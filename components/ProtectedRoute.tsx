import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionTier } from '../types/database';

/**
 * Loading spinner consistent with the app theme.
 * Used by both ProtectedRoute and AuthGuard.
 */
const AuthLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-[#0d0512] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

// --- ProtectedRoute: blocks access and redirects ---

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier | 'authenticated';
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Route-level guard that blocks access entirely.
 * Redirects unauthenticated users to home, non-premium to checkout, non-admin to home.
 *
 * Use for pages that should NEVER render for unauthorized users:
 *   /history, /settings → requiredTier="authenticated"
 *   /admin → requireAdmin
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredTier = 'authenticated',
  requireAdmin = false,
  redirectTo,
}) => {
  const { user, profile, loading, tier } = useAuth();
  const { isPortuguese } = useLanguage();
  const location = useLocation();

  if (loading) return <AuthLoadingSpinner />;

  if (!user) {
    const target = redirectTo || '/';
    return <Navigate to={target} state={{ from: location.pathname, authRequired: true }} replace />;
  }

  if (requireAdmin && !profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (requiredTier === 'premium' && tier !== 'premium') {
    return <Navigate to={redirectTo || '/checkout'} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// --- AuthGuard: waits for auth, then renders (no redirect) ---

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Lightweight wrapper that waits for auth state to resolve before rendering children.
 * Does NOT block or redirect — it just prevents components from rendering while
 * auth is loading, so their inline paywall checks (usePaywall, useAuth) have
 * correct tier/user data instead of stale defaults.
 *
 * Use for pages with inline paywall logic that ALL users can visit:
 *   /session, /result, /interpretacao, /arquivo-arcano, etc.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) return <AuthLoadingSpinner />;

  return <>{children}</>;
};

export default ProtectedRoute;
