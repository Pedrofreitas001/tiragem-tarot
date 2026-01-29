import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, SubscriptionTier } from '../types/database';
import { getGuestReading, clearGuestReading, transferGuestReadingToUser } from '../services/readingsService';

// Limites para visitantes (não logados)
export const GUEST_LIMITS = {
  readingsPerDay: 1,
  historyDays: 0,
  maxHistoryItems: 0,
  maxArchiveCards: 0,
  hasAISynthesis: false,
  hasPatternAnalysis: false,
  hasPDFExport: false,
  hasWhatsApp: false,
  hasPhysicalReading: false,
  hasAds: true,
};

// Limites do plano gratuito (logado)
export const FREE_TIER_LIMITS = {
  readingsPerDay: 1,
  historyDays: 7,
  maxHistoryItems: 3,
  maxArchiveCards: 7,
  hasAISynthesis: true, // Free users get AI synthesis
  hasPatternAnalysis: false,
  hasPDFExport: false,
  hasWhatsApp: false,
  hasPhysicalReading: false, // Physical reading is premium only
  hasAds: true,
};

// Limites do plano premium
export const PREMIUM_TIER_LIMITS = {
  readingsPerDay: Infinity,
  historyDays: Infinity,
  maxHistoryItems: Infinity,
  maxArchiveCards: Infinity,
  hasAISynthesis: true,
  hasPatternAnalysis: true,
  hasPDFExport: true,
  hasWhatsApp: true,
  hasPhysicalReading: true,
  hasAds: false,
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  tier: SubscriptionTier | 'guest';
  limits: typeof FREE_TIER_LIMITS;
  readingsToday: number;
  canDoReading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; profile?: Profile | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  incrementReadingCount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Criar um valor padrão seguro para quando o contexto não está disponível
const defaultAuthValue: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  isConfigured: false,
  tier: 'guest',
  limits: GUEST_LIMITS,
  readingsToday: 0,
  canDoReading: true,
  isGuest: true,
  signUp: async () => ({ error: { message: 'Not initialized' } as any }),
  signIn: async () => ({ error: { message: 'Not initialized' } as any }),
  signInWithGoogle: async () => ({ error: { message: 'Not initialized' } as any }),
  signOut: async () => { },
  resetPassword: async () => ({ error: { message: 'Not initialized' } as any }),
  updateProfile: async () => ({ error: new Error('Not initialized') }),
  incrementReadingCount: async () => { },
  refreshProfile: async () => { },
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Não lançar erro - retornar valor padrão seguro se contexto não disponível
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper para gerenciar leituras de visitantes no localStorage
const GUEST_STORAGE_KEY = 'tarot-guest-readings';
const GUEST_PENDING_READING_KEY = 'tarot-guest-pending-reading';

const getGuestReadings = (): { count: number; date: string } => {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      // Reset se for um novo dia
      if (data.date !== today) {
        return { count: 0, date: today };
      }
      return data;
    }
  } catch (e) {
    console.error('Error reading guest storage:', e);
  }
  return { count: 0, date: new Date().toISOString().split('T')[0] };
};

const setGuestReadings = (count: number) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ count, date: today }));
  } catch (e) {
    console.error('Error saving guest storage:', e);
  }
};

// Interface for pending guest reading
export interface GuestPendingReading {
  spreadType: string;
  spreadName: string;
  cards: any[];
  question?: string;
  createdAt: string;
}

// Save guest reading to localStorage for later processing after signup
export const saveGuestPendingReading = (reading: GuestPendingReading) => {
  try {
    localStorage.setItem(GUEST_PENDING_READING_KEY, JSON.stringify(reading));
    console.log('Guest pending reading saved');
  } catch (e) {
    console.error('Error saving guest pending reading:', e);
  }
};

// Get pending guest reading
export const getGuestPendingReading = (): GuestPendingReading | null => {
  try {
    const stored = localStorage.getItem(GUEST_PENDING_READING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading guest pending reading:', e);
  }
  return null;
};

// Clear pending guest reading after it's been processed
export const clearGuestPendingReading = () => {
  try {
    localStorage.removeItem(GUEST_PENDING_READING_KEY);
    console.log('Guest pending reading cleared');
  } catch (e) {
    console.error('Error clearing guest pending reading:', e);
  }
};

// Check if there's a pending guest reading
export const hasGuestPendingReading = (): boolean => {
  return getGuestPendingReading() !== null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestReadings, setGuestReadingsState] = useState<number>(() => getGuestReadings().count);
  const isConfigured = isSupabaseConfigured();

  // Determinar se é visitante (não logado)
  const isGuest = !user;

  // Estado para indicar que o profile está sendo carregado
  const [profileLoading, setProfileLoading] = useState(false);

  // Função para verificar se assinatura expirou
  const isSubscriptionExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    try {
      return new Date(expiresAt) < new Date();
    } catch {
      return false;
    }
  };

  // Derivar tier e limites com validação de expiração
  const computeTier = useCallback((): SubscriptionTier | 'guest' => {
    // Se usuário não está logado, é guest
    if (isGuest) return 'guest';
    // Se profile ainda não carregou, retornar 'free' temporário (não 'guest'!)
    if (!profile) return 'free';

    const subTier = profile.subscription_tier;
    const expiresAt = profile.subscription_expires_at;

    if (subTier === 'premium') {
      return isSubscriptionExpired(expiresAt) ? 'free' : 'premium';
    }

    return (subTier as SubscriptionTier) || 'free';
  }, [isGuest, profile]);

  const tier = computeTier();
  const limits = tier === 'premium' ? PREMIUM_TIER_LIMITS : (tier === 'guest' ? GUEST_LIMITS : FREE_TIER_LIMITS);

  // Verificar se é um novo dia para resetar contador
  const isNewDay = (lastDate: string | null): boolean => {
    if (!lastDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return lastDate !== today;
  };

  // Contar leituras de hoje (visitante usa localStorage, logado usa profile)
  const readingsToday = isGuest ? guestReadings : (profile?.readings_today || 0);
  const canDoReading = tier === 'premium' || readingsToday < limits.readingsPerDay;

  // Buscar perfil do usuário - retorna o perfil ou null
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) {
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);

    try {
      // Timeout de 5 segundos
      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
        setTimeout(() => resolve({ data: null, error: { message: 'Query timeout' } }), 5000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error } = result;

      if (error) {
        // Se o perfil não existe, criar um
        if (error.code === 'PGRST116') {
          const newProfile: Profile = {
            id: userId,
            email: null,
            full_name: null,
            avatar_url: null,
            subscription_tier: 'free',
            subscription_expires_at: null,
            readings_today: 0,
            last_reading_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (!createError && created) {
            setProfile(created);
            setProfileLoading(false);
            return created;
          }
          setProfileLoading(false);
          return null;
        }

        setProfileLoading(false);
        return null;
      }

      if (!data) {
        setProfileLoading(false);
        return null;
      }

      // Resetar contador se for um novo dia
      if (data && isNewDay(data.last_reading_date)) {
        const { data: updated } = await supabase
          .from('profiles')
          .update({
            readings_today: 0,
            last_reading_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', userId)
          .select()
          .single();

        const finalProfile = updated || data;
        setProfile(finalProfile);
        setProfileLoading(false);
        return finalProfile;
      } else {
        setProfile(data);
        setProfileLoading(false);
        return data;
      }
    } catch {
      setProfileLoading(false);
      return null;
    }
  }, []);

  // Inicializar autenticação
  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);

          // Transfer guest reading to user account after sign in/sign up
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const guestReading = getGuestReading();
            if (guestReading) {
              // Transfer the reading asynchronously
              transferGuestReadingToUser(session.user.id, true)
                .then((success) => {
                  if (success) {
                    console.log('Guest reading transferred to user account');
                  }
                })
                .catch(() => {
                  // Silent fail - clear anyway to avoid duplicates
                  clearGuestReading();
                });
            }
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isConfigured, fetchProfile]);

  // Cadastro
  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  // Login
  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null; profile?: Profile | null }> => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error, profile: null };

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        const userProfile = await fetchProfile(data.user.id);
        return { error: null, profile: userProfile };
      }

      return { error: null };
    } catch {
      return { error: { message: 'An error occurred during sign in' } as AuthError };
    }
  };

  // Login com Google
  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  // Logout
  const signOut = async () => {
    // Limpar estado local PRIMEIRO para UI responder imediatamente
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);

    // Limpar localStorage (tokens Supabase)
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
    } catch { /* ignore */ }

    // Sign out from Supabase
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch { /* ignore */ }
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    if (!supabase) return { error: new Error('Supabase not configured') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!error) {
        await fetchProfile(user.id);
      }

      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Incrementar contador de leituras (funciona para visitantes e logados)
  const incrementReadingCount = async () => {
    // Para visitantes: salvar no localStorage
    if (isGuest) {
      const newCount = guestReadings + 1;
      setGuestReadings(newCount);
      setGuestReadingsState(newCount);
      return;
    }

    // Para usuários logados: salvar no Supabase
    if (!user || !profile || !supabase) return;

    const today = new Date().toISOString().split('T')[0];
    const newCount = isNewDay(profile.last_reading_date) ? 1 : profile.readings_today + 1;

    await supabase
      .from('profiles')
      .update({
        readings_today: newCount,
        last_reading_date: today,
      })
      .eq('id', user.id);

    setProfile(prev => prev ? {
      ...prev,
      readings_today: newCount,
      last_reading_date: today,
    } : null);
  };

  // Recarregar perfil
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isConfigured,
    tier,
    limits,
    readingsToday,
    canDoReading,
    isGuest,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    incrementReadingCount,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
