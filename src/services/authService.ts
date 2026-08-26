import { User, WalletTransaction } from '../types';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_TRANSACTIONS } from './walletService';

const LOCAL_STORAGE_SESSION_KEY = 'etesal_secure_user_session';
const LOCAL_STORAGE_USERS_DB_KEY = 'etesal_registered_users_vault';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Derives standard synthetic email from clean username for zero-friction username/password auth
 */
export function deriveAuthEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${clean}@user.etesal.internal`;
}

/**
 * Cryptographic SHA-256 password hash with salt using browser-native WebCrypto API
 */
export async function hashPassword(password: string, salt: string = 'etesal_sec_v6_salt'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Builds standard User object with default welcome bonuses
 */
export function createDefaultUserStructure(
  id: string,
  username: string,
  email?: string,
  recoveryEmail?: string
): User {
  const cleanUsername = username.trim().toLowerCase();
  return {
    id,
    username: cleanUsername,
    name: cleanUsername,
    email: email || deriveAuthEmail(cleanUsername),
    recoveryEmail: recoveryEmail || undefined,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
    role: 'user',
    walletBalance: 15000, // 15,000 Tomans welcome bonus
    transactions: INITIAL_TRANSACTIONS,
    joinedDate: new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long' }).format(new Date()),
    subscription: {
      planName: 'طرح پایه اتصال آزاد (رایگان)',
      totalTrafficGB: 15,
      usedTrafficGB: 0.0,
      expireDate: '۳۰ روز دیگر',
      daysRemaining: 30,
      subscriptionUrl: 'https://sub.etesal.app/v2/sub/free_' + cleanUsername,
      status: 'active',
      dailyUsage: [
        { date: 'شنبه', gigabytes: 0.0 },
        { date: 'یکشنبه', gigabytes: 0.0 },
        { date: 'دوشنبه', gigabytes: 0.0 },
        { date: 'سه‌شنبه', gigabytes: 0.0 },
        { date: 'چهارشنبه', gigabytes: 0.0 },
        { date: 'پنجشنبه', gigabytes: 0.0 },
        { date: 'جمعه', gigabytes: 0.0 },
      ],
      speedLimitMbps: 100
    }
  };
}

/**
 * Handles persistent user registration
 */
export async function registerUser(
  username: string,
  passwordPlain: string
): Promise<AuthResponse> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر و معتبر باشد.' };
  }
  if (!passwordPlain || passwordPlain.length < 6) {
    return { success: false, error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' };
  }

  const supabase = getSupabase();
  const authEmail = deriveAuthEmail(cleanUsername);

  // 1. Production Mode: Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: passwordPlain,
        options: {
          data: {
            username: cleanUsername,
            initial_role: 'user'
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً وارد شوید.' };
        }
        return { success: false, error: error.message };
      }

      const userId = data.user?.id || 'usr_' + Date.now().toString(36);
      const user = createDefaultUserStructure(userId, cleanUsername, authEmail);
      saveLocalSession(user);
      return { success: true, user, isNewUser: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'خطای ارتباط با سرور احراز هویت';
      return { success: false, error: errMsg };
    }
  }

  // 2. Offline / High-Security Local Vault Fallback (Zero Hardcoded Credentials)
  const passwordHash = await hashPassword(passwordPlain, cleanUsername);
  const vaultRaw = localStorage.getItem(LOCAL_STORAGE_USERS_DB_KEY);
  const vault: Record<string, { passwordHash: string; user: User }> = vaultRaw ? JSON.parse(vaultRaw) : {};

  if (vault[cleanUsername]) {
    return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً وارد شوید.' };
  }

  const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const user = createDefaultUserStructure(userId, cleanUsername);

  vault[cleanUsername] = {
    passwordHash,
    user
  };
  localStorage.setItem(LOCAL_STORAGE_USERS_DB_KEY, JSON.stringify(vault));
  saveLocalSession(user);

  return { success: true, user, isNewUser: true };
}

/**
 * Handles persistent user login
 */
export async function loginUser(
  username: string,
  passwordPlain: string
): Promise<AuthResponse> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    return { success: false, error: 'لطفاً نام کاربری را وارد کنید.' };
  }
  if (!passwordPlain) {
    return { success: false, error: 'لطفاً رمز عبور را وارد کنید.' };
  }

  const supabase = getSupabase();
  const authEmail = deriveAuthEmail(cleanUsername);

  // 1. Production Mode: Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: passwordPlain
      });

      if (error) {
        return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
      }

      // Check if user profile exists in session storage
      const savedUser = getSavedLocalSession();
      const user = (savedUser && savedUser.username === cleanUsername)
        ? savedUser
        : createDefaultUserStructure(data.user.id, cleanUsername, authEmail);

      saveLocalSession(user);
      return { success: true, user, isNewUser: false };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'خطای ارتباط با سرور احراز هویت';
      return { success: false, error: errMsg };
    }
  }

  // 2. Offline / High-Security Local Vault
  const passwordHash = await hashPassword(passwordPlain, cleanUsername);
  const vaultRaw = localStorage.getItem(LOCAL_STORAGE_USERS_DB_KEY);
  const vault: Record<string, { passwordHash: string; user: User }> = vaultRaw ? JSON.parse(vaultRaw) : {};

  const record = vault[cleanUsername];
  if (!record || record.passwordHash !== passwordHash) {
    return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  saveLocalSession(record.user);
  return { success: true, user: record.user, isNewUser: false };
}

/**
 * Saves authenticated user session
 */
export function saveLocalSession(user: User): void {
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
  
  // Also sync back to local users vault
  try {
    const vaultRaw = localStorage.getItem(LOCAL_STORAGE_USERS_DB_KEY);
    const vault = vaultRaw ? JSON.parse(vaultRaw) : {};
    if (vault[user.username]) {
      vault[user.username].user = user;
      localStorage.setItem(LOCAL_STORAGE_USERS_DB_KEY, JSON.stringify(vault));
    }
  } catch {
    // Ignore storage sync error
  }
}

/**
 * Retrieves persisted session on startup
 */
export function getSavedLocalSession(): User | null {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}

/**
 * Clears user session
 */
export async function logoutUser(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on logout
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
}

/**
 * Updates recovery email on current user profile
 */
export async function updateRecoveryEmail(user: User, email: string): Promise<User> {
  const updatedUser: User = {
    ...user,
    recoveryEmail: email,
    email: email
  };

  saveLocalSession(updatedUser);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.updateUser({
        data: { recovery_email: email }
      });
    } catch {
      // Ignore background sync error
    }
  }

  return updatedUser;
}
