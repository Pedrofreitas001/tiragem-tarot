import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { signIn, signUp, signInWithGoogle, resetPassword, isConfigured } = useAuth();
  const { isPortuguese } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = {
    login: isPortuguese ? 'Entrar' : 'Sign In',
    register: isPortuguese ? 'Criar Conta' : 'Create Account',
    resetPassword: isPortuguese ? 'Recuperar Senha' : 'Reset Password',
    email: isPortuguese ? 'E-mail' : 'Email',
    password: isPortuguese ? 'Senha' : 'Password',
    fullName: isPortuguese ? 'Nome Completo' : 'Full Name',
    forgotPassword: isPortuguese ? 'Esqueceu a senha?' : 'Forgot password?',
    noAccount: isPortuguese ? 'Não tem conta?' : "Don't have an account?",
    hasAccount: isPortuguese ? 'Já tem conta?' : 'Already have an account?',
    backToLogin: isPortuguese ? 'Voltar ao login' : 'Back to login',
    orContinueWith: isPortuguese ? 'ou continue com' : 'or continue with',
    sendResetLink: isPortuguese ? 'Enviar link de recuperação' : 'Send reset link',
    resetSent: isPortuguese
      ? 'Link de recuperação enviado! Verifique seu e-mail.'
      : 'Reset link sent! Check your email.',
    errorInvalidEmail: isPortuguese ? 'E-mail inválido' : 'Invalid email',
    errorWeakPassword: isPortuguese
      ? 'Senha deve ter pelo menos 6 caracteres'
      : 'Password must be at least 6 characters',
    errorGeneric: isPortuguese
      ? 'Ocorreu um erro. Tente novamente.'
      : 'An error occurred. Please try again.',
    errorInvalidCredentials: isPortuguese
      ? 'E-mail ou senha incorretos'
      : 'Invalid email or password',
    notConfigured: isPortuguese
      ? 'Sistema de autenticação não configurado'
      : 'Authentication system not configured',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message.includes('Invalid') ? t.errorInvalidCredentials : t.errorGeneric);
        } else {
          onClose();
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          setError(t.errorWeakPassword);
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setSuccess(isPortuguese
            ? 'Conta criada! Verifique seu e-mail para confirmar.'
            : 'Account created! Check your email to confirm.');
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess(t.resetSent);
        }
      }
    } catch (err) {
      setError(t.errorGeneric);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  if (!isConfigured) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1628] border border-[#875faf]/30 rounded-2xl p-8 z-50">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-[#875faf] mb-4">warning</span>
            <h2 className="text-xl font-bold text-white mb-2">{t.notConfigured}</h2>
            <p className="text-gray-400 text-sm mb-6">
              {isPortuguese
                ? 'Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
                : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#875faf] hover:bg-[#a77fd4] rounded-lg text-white font-medium transition-colors"
            >
              {isPortuguese ? 'Fechar' : 'Close'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1628] border border-[#875faf]/30 rounded-2xl p-8 z-50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
            {mode === 'login' ? t.login : mode === 'register' ? t.register : t.resetPassword}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.fullName}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] focus:outline-none transition-colors"
                placeholder={isPortuguese ? 'Seu nome' : 'Your name'}
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] focus:outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#875faf] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-[#a77fd4] hover:text-white text-sm transition-colors"
            >
              {t.forgotPassword}
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#875faf] hover:bg-[#a77fd4] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {isPortuguese ? 'Carregando...' : 'Loading...'}
              </span>
            ) : (
              mode === 'login' ? t.login : mode === 'register' ? t.register : t.sendResetLink
            )}
          </button>
        </form>

        {/* Divider */}
        {mode !== 'reset' && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">{t.orContinueWith}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </>
        )}

        {/* Switch Mode */}
        <div className="mt-6 text-center text-sm">
          {mode === 'login' ? (
            <p className="text-gray-400">
              {t.noAccount}{' '}
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                className="text-[#a77fd4] hover:text-white transition-colors"
              >
                {t.register}
              </button>
            </p>
          ) : mode === 'register' ? (
            <p className="text-gray-400">
              {t.hasAccount}{' '}
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="text-[#a77fd4] hover:text-white transition-colors"
              >
                {t.login}
              </button>
            </p>
          ) : (
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className="text-[#a77fd4] hover:text-white transition-colors"
            >
              {t.backToLogin}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
