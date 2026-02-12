// Shared auth helper for Vercel serverless functions
// Validates Supabase JWT and optionally checks subscription tier

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Extracts and validates the Supabase JWT from the Authorization header.
 * Returns the authenticated user or null.
 */
export async function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const url = supabaseUrl;
  const key = supabaseServiceKey || supabaseAnonKey;

  if (!url || !key) {
    console.error('Supabase not configured for API auth');
    return null;
  }

  const supabase = createClient(url, key);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Checks if a user has an active premium subscription.
 * Queries the profiles table directly from the server side.
 */
export async function getUserTier(userId) {
  const url = supabaseUrl;
  const key = supabaseServiceKey || supabaseAnonKey;

  if (!url || !key) return 'free';

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', userId)
    .single();

  if (error || !data) return 'free';

  if (data.subscription_tier === 'premium') {
    // Check expiration
    if (data.subscription_expires_at) {
      const expired = new Date(data.subscription_expires_at) < new Date();
      return expired ? 'free' : 'premium';
    }
    return 'premium';
  }

  return 'free';
}

/**
 * Middleware-style function: validates auth + premium tier.
 * Returns { user, tier } or sends 401/403 and returns null.
 */
export async function requirePremium(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const tier = await getUserTier(user.id);
  if (tier !== 'premium') {
    res.status(403).json({ error: 'Premium subscription required' });
    return null;
  }

  return { user, tier };
}

/**
 * Middleware-style function: validates auth (any tier).
 * Returns { user } or sends 401 and returns null.
 */
export async function requireAuth(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  return { user };
}
