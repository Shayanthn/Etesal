const fs = require('fs');

const authServiceCode = `
import { User, WalletTransaction } from '../types';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_TRANSACTIONS } from './walletService';

const LOCAL_STORAGE_SESSION_KEY = 'etesal_secure_user_session';

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
  return \`\${clean}@user.etesal.internal\`;
}

/**
 * Creates default user structure for new registrations
 */
export function createDefaultUserStructure(userId: string, username: string, email: string = ''): User {
  return {
    id: userId,
    username,
    email,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + username,
    walletBalance: 0,
    walletTransactions: INITIAL_TRANSACTIONS,
    registeredAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

/**
 * Handles persistent new user registration, ONLY via Supabase
 */
export async function registerUser(
  username: string,
  passwordPlain: string
): Promise<AuthResponse> {
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'نام کاربری باید حداقل ۳ حرف باشد.' };
  }
  if (!passwordPlain || passwordPlain.length < 6) {
    return { success: false, error: 'رمز عبور باید حداقل ۶ حرف باشد.' };
  }

  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'خطا: زیرساخت ابری پایگاه داده متصل نیست. لطفا از متصل بودن اینترنت مطمئن شوید.' };
  }

  const email = deriveAuthEmail(cleanUsername);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordPlain,
      options: {
        data: {
          username: cleanUsername,
        }
      }
    });

    if (error) {
      console.error("Supabase Auth Registration Error:", error);
      let errMsg = 'خطا در ثبت نام. لطفاً مجدداً تلاش کنید.';
      if (error.status === 422 || error.message.includes('User already registered')) {
        errMsg = 'این نام کاربری قبلاً ثبت شده است. لطفاً وارد شوید.';
      }
      return { success: false, error: errMsg };
    }

    if (data.user) {
      const userObj = createDefaultUserStructure(data.user.id, cleanUsername, email);
      saveLocalSession(userObj);
      return { success: true, user: userObj, isNewUser: true };
    }

    return { success: false, error: 'پاسخ نامعتبر از سرور ثبت‌نام.' };

  } catch (err: unknown) {
    console.error("Unexpected Auth Error:", err);
    const errMsg = err instanceof Error ? err.message : 'خطای ارتباط با سرور احراز هویت';
    return { success: false, error: errMsg };
  }
}

/**
 * Handles persistent user login, ONLY via Supabase
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
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'خطا: زیرساخت ابری پایگاه داده متصل نیست. لطفا از متصل بودن اینترنت مطمئن شوید.' };
  }

  const email = deriveAuthEmail(cleanUsername);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordPlain,
    });

    if (error) {
      console.error("Supabase Auth Login Error:", error);
      return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
    }

    if (data.user) {
      const dbUsername = data.user.user_metadata?.username || cleanUsername;
      const userObj = createDefaultUserStructure(data.user.id, dbUsername, data.user.email || email);
      saveLocalSession(userObj);
      return { success: true, user: userObj, isNewUser: false };
    }

    return { success: false, error: 'پاسخ نامعتبر از سرور لاگین.' };

  } catch (err: unknown) {
    console.error("Unexpected Login Error:", err);
    const errMsg = err instanceof Error ? err.message : 'خطای ارتباط با سرور احراز هویت';
    return { success: false, error: errMsg };
  }
}

/**
 * Saves authenticated user session locally (for fast re-hydration)
 */
export function saveLocalSession(user: User): void {
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
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
 * Clears current session
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Failed to sign out from Supabase", e);
    }
  }
}
`;

fs.writeFileSync('src/services/authService.ts', authServiceCode);
