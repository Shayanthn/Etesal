import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve environment variables safely across both browser (Vite) and Node.js environments
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const supabaseUrl: string = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey: string = getEnvVar('VITE_SUPABASE_ANON_KEY');

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
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'etesal_supabase_auth_token'
      }
    });
  }

  return supabaseInstance;
};
