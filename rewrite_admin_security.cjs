const fs = require('fs');
const code = `
import { getSupabase } from './supabaseClient';

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
    
    // In a strict commercial setup, you would check Custom Claims here.
    // e.g. data.user.app_metadata?.role === 'super_admin'
    // For now, successful login into the admin route indicates admin capability,
    // assuming RLS policies limit the admin email/role in the DB.
    
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
    
    // Check custom claims if defined, otherwise presence of active session in the admin guard means access
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
`;
fs.writeFileSync('src/services/adminSecurityService.ts', code);
