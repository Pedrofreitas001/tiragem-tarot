import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  hasAds: true,
};

// Limites do plano gratuito (logado)
export const FREE_TIER_LIMITS = {
  readingsPerDay: 3,
  historyDays: 7,
  maxHistoryItems: 3,
  maxArchiveCards: 7,
  hasAISynthesis: false,
  hasPatternAnalysis: false,
  hasPDFExport: false,
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
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  incrementReadingCount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper para gerenciar leituras de visitantes no localStorage
const GUEST_STORAGE_KEY = 'tarot-guest-readings';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestReadings, setGuestReadingsState] = useState<number>(() => getGuestReadings().count);
  const isConfigured = isSupabaseConfigured();

  // Determinar se é visitante (não logado)
  const isGuest = !user;

  // Derivar tier e limites
  const tier: SubscriptionTier | 'guest' = isGuest ? 'guest' : (profile?.subscription_tier || 'free');
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

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Se o perfil não existe, criar um
        if (error.code === 'PGRST116') {
          const newProfile: Profile = {
            id: userId,
            email: user?.email || null,
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
          }
          return;
        }
        console.error('Error fetching profile:', error);
        return;
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

        setProfile(updated || data);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

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
  }, [isConfigured]);

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
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
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
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Clear all auth state to ensure logout works even without Supabase
    setUser(null);
    setSession(null);
    setProfile(null);
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
