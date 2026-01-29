import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, SubscriptionTier } from '../types/database';

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
    if (!expiresAt) return false; // Se não tem data de expiração, não expirou
    try {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      console.log('Checking expiration:', { expiresAt, expirationDate: expirationDate.toISOString(), now: now.toISOString(), isExpired: expirationDate < now });
      return expirationDate < now;
    } catch (e) {
      console.error('Error parsing expiration date:', e);
      return false; // Em caso de erro, assume não expirado
    }
  };

  // Derivar tier e limites com validação de expiração
  const computeTier = useCallback((): SubscriptionTier | 'guest' => {
    // Se usuário não está logado, é guest
    if (isGuest) {
      console.log('🔓 Tier: isGuest=true → GUEST');
      return 'guest';
    }
    // Se profile ainda não carregou, retornar 'free' temporário (não 'guest'!)
    if (!profile) {
      console.log('⏳ Tier: profile=null (loading) → FREE (temporary)');
      return 'free';
    }

    const subTier = profile.subscription_tier;
    const expiresAt = profile.subscription_expires_at;

    console.log('📊 Tier computation:', {
      email: profile.email,
      subTier,
      expiresAt
    });

    if (subTier === 'premium') {
      const expired = isSubscriptionExpired(expiresAt);
      const finalTier = expired ? 'free' : 'premium';
      console.log(`✨ Premium check: expired=${expired} → ${finalTier}`);
      return finalTier;
    }

    console.log(`📌 Tier from profile: ${subTier}`);
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
      console.warn('⚠️ fetchProfile: Supabase not available');
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    console.log('🔄 fetchProfile: Starting for userId:', userId);

    try {
      console.log('📡 fetchProfile: Calling supabase query...');

      // Timeout de 5 segundos
      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
        setTimeout(() => {
          console.error('⏰ fetchProfile: TIMEOUT - query took too long');
          resolve({ data: null, error: { message: 'Query timeout' } });
        }, 5000);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error } = result;

      console.log('📡 fetchProfile: Query result received:', {
        hasError: !!error,
        errorCode: error?.code,
        hasTier: !!data?.subscription_tier,
        tier: data?.subscription_tier
      });

      if (error) {
        // Se o perfil não existe, criar um
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating new profile...');
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

          console.log('📝 Inserting new profile:', newProfile.id);
          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (!createError && created) {
            console.log('✅ New profile created:', { id: created.id, tier: created.subscription_tier });
            setProfile(created);
            setProfileLoading(false);
            return created;
          }
          console.error('❌ Failed to create profile:', createError?.message);
          setProfileLoading(false);
          return null;
        }

        console.error('❌ Error fetching profile:', error.message, error.code);
        setProfileLoading(false);
        return null;
      }

      if (!data) {
        console.warn('⚠️ fetchProfile: No data returned but no error');
        setProfileLoading(false);
        return null;
      }

      console.log('✅ Profile fetched successfully:', {
        id: data.id,
        email: data.email,
        tier: data.subscription_tier,
        expires: data.subscription_expires_at
      });

      // Resetar contador se for um novo dia
      if (data && isNewDay(data.last_reading_date)) {
        console.log('📅 New day detected, resetting readings count');
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({
            readings_today: 0,
            last_reading_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.warn('⚠️ Error updating daily reset:', updateError.message);
        }

        const finalProfile = updated || data;
        console.log('📌 Profile ready (after daily reset):', { id: finalProfile.id, tier: finalProfile.subscription_tier });
        setProfile(finalProfile);
        setProfileLoading(false);
        return finalProfile;
      } else {
        console.log('📌 Profile ready (no daily reset):', { id: data.id, tier: data.subscription_tier });
        setProfile(data);
        setProfileLoading(false);
        return data;
      }
    } catch (err: any) {
      console.error('❌ fetchProfile catch error:', err?.message || err);
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
        console.log('Auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event - clearing all state');
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
      console.log('🔑 signIn: Starting login for', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ signIn: Auth error:', error.message);
        return { error, profile: null };
      }

      // Se login foi sucesso, carregar perfil
      if (data?.user) {
        console.log('✅ signIn: Auth successful, now fetching profile...');
        setUser(data.user);
        setSession(data.session);

        // Buscar e aguardar perfil - CRUCIAL aguardar aqui
        const userProfile = await fetchProfile(data.user.id);

        if (userProfile) {
          console.log('✅ signIn complete → tier:', userProfile.subscription_tier);
        } else {
          console.warn('⚠️ signIn: Profile null after fetch');
        }

        return { error: null, profile: userProfile };
      }

      console.warn('⚠️ signIn: No user data returned');
      return { error: null };
    } catch (err) {
      console.error('❌ SignIn catch error:', err);
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
    console.log('SignOut: Starting...');

    // Limpar estado local PRIMEIRO para UI responder imediatamente
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
    console.log('SignOut: Local state cleared');

    // Limpar localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-')) {
          console.log('SignOut: Removing localStorage key:', key);
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('SignOut: localStorage error:', e);
    }

    // Sign out from Supabase (não bloquear se falhar)
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
        console.log('SignOut: Supabase signOut completed');
      } catch (err) {
        console.error('SignOut: Supabase error (ignored):', err);
      }
    }

    console.log('SignOut: Complete');
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
