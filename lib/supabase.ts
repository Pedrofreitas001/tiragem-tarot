import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co'));
};

// Only create client if properly configured
let supabase: SupabaseClient<Database> | null = null;

if (isSupabaseConfigured()) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Auth features will be disabled.');
}

export { supabase };
