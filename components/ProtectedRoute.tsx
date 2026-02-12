import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SubscriptionTier } from '../types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Minimum tier required: 'free' = must be logged in, 'premium' = must have active premium */
  requiredTier?: SubscriptionTier | 'authenticated';
  /** If true, only admins can access */
  requireAdmin?: boolean;
  /** Custom redirect path (defaults to '/') */
  redirectTo?: string;
}

/**
 * Route-level guard that validates authentication and subscription tier
 * via Supabase before rendering child components.
 *
 * Usage:
 *   <Route path="/history" element={<ProtectedRoute requiredTier="free"><History /></ProtectedRoute>} />
 *   <Route path="/interpretacao" element={<ProtectedRoute requiredTier="premium"><Interpretacao /></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
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

  // While auth state is loading, show a minimal spinner to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0512] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → redirect to home (where they can login)
  if (!user) {
    const target = redirectTo || '/';
    return <Navigate to={target} state={{ from: location.pathname, authRequired: true }} replace />;
  }

  // Admin check
  if (requireAdmin && !profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // Premium check: user is logged in but doesn't have premium
  if (requiredTier === 'premium' && tier !== 'premium') {
    const target = redirectTo || (isPortuguese ? '/checkout' : '/checkout');
    return (
      <Navigate
        to={target}
        state={{ from: location.pathname, upgradRequired: true }}
        replace
      />
    );
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;
