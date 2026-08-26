import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve environment variables with Vite standard prefixes
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates if the Supabase environment configuration is properly set.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('placeholder')
  );
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns the initialized Supabase client singleton.
 * Uses lazy initialization to prevent crashes when environment variables are pending.
 */
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'etesal_supabase_auth_token'
      }
    });
  }

  return supabaseInstance;
};
