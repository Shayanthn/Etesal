
import { getSupabase } from './supabaseClient';

/**
 * Calculates SHA-256 hash of a string (useful for password hashing, token validation, and checksums)
 */
export async function calculateSha256(input: string): Promise<string> {
  const cleanInput = (input || '').trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(cleanInput);
  
  const cryptoObj = (typeof globalThis !== 'undefined' && globalThis.crypto)
    ? globalThis.crypto
    : (typeof window !== 'undefined' ? window.crypto : null);

  if (cryptoObj && cryptoObj.subtle) {
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  return '';
}

/**
 * Validates admin password via Supabase Auth
 * The admin account MUST be pre-created in Supabase (e.g. admin@etesal.ir)
 * For security, we authenticate via standard Supabase endpoints and verify the JWT contains the admin role.
 */
export async function verifyAdminPasscode(email: string, passcode: string): Promise<boolean> {
  if (!email || !passcode || passcode.trim().length === 0) {
    return false;
  }

  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passcode,
    });

    if (error || !data.user) {
      return false;
    }
    
    // Crucial check: verify that this user is actually an admin
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    
    if (rpcError || !isAdmin) {
      // If not an admin, we must sign them out immediately from this flow
      await supabase.auth.signOut();
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if current admin session is valid and active
 */
export async function checkAdminSessionAsync(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return false;
    
    // Check if the current user is actually an admin using the database RPC
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError || !isAdmin) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Terminates admin session
 */
export async function terminateAdminSession(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
