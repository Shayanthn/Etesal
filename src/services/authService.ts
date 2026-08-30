
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

export function deriveAuthEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${clean}@user.etesal.internal`;
}

export function createDefaultUserStructure(userId: string, username: string, email: string = ''): User {
  return {
    id: userId,
    username,
    name: username,
    email,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + username,
    role: 'user',
    walletBalance: 0,
    transactions: INITIAL_TRANSACTIONS,
    joinedDate: new Date().toISOString(),
    subscription: {
      planName: 'طرح رایگان (عمومی)',
      totalTrafficGB: 0,
      usedTrafficGB: 0,
      expireDate: new Date().toISOString(),
      daysRemaining: 0,
      subscriptionUrl: '',
      status: 'expired',
      dailyUsage: [],
      speedLimitMbps: 0
    }
  };
}

export async function registerUser(username: string, passwordPlain: string): Promise<AuthResponse> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) return { success: false, error: 'نام کاربری باید حداقل ۳ حرف باشد.' };
  if (!passwordPlain || passwordPlain.length < 6) return { success: false, error: 'رمز عبور باید حداقل ۶ حرف باشد.' };

  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) return { success: false, error: 'خطا: زیرساخت ابری پایگاه داده متصل نیست.' };

  const email = deriveAuthEmail(cleanUsername);
  try {
    const { data, error } = await supabase.auth.signUp({ email, password: passwordPlain, options: { data: { username: cleanUsername } } });
    if (error) {
      if (error.status === 422 || error.message.includes('User already registered')) return { success: false, error: 'این نام کاربری قبلاً ثبت شده است. لطفاً وارد شوید.' };
      return { success: false, error: 'خطا در ثبت نام.' };
    }
    if (data.user) {
      const userObj = createDefaultUserStructure(data.user.id, cleanUsername, email);
      saveLocalSession(userObj);
      return { success: true, user: userObj, isNewUser: true };
    }
    return { success: false, error: 'پاسخ نامعتبر از سرور ثبت‌نام.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'خطای ارتباط با سرور' };
  }
}

export async function loginUser(username: string, passwordPlain: string): Promise<AuthResponse> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) return { success: false, error: 'لطفاً نام کاربری را وارد کنید.' };
  if (!passwordPlain) return { success: false, error: 'لطفاً رمز عبور را وارد کنید.' };

  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) return { success: false, error: 'خطا: زیرساخت ابری متصل نیست.' };

  const email = deriveAuthEmail(cleanUsername);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwordPlain });
    if (error) return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
    if (data.user) {
      const dbUsername = data.user.user_metadata?.username || cleanUsername;
      const userObj = createDefaultUserStructure(data.user.id, dbUsername, data.user.email || email);
      saveLocalSession(userObj);
      return { success: true, user: userObj, isNewUser: false };
    }
    return { success: false, error: 'پاسخ نامعتبر از سرور.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'خطای ارتباط با سرور' };
  }
}

export async function loginWithGoogle(): Promise<void> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('خطا: زیرساخت ابری متصل نیست.');
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // Redirects back to the current domain
    }
  });

  if (error) {
    throw error;
  }
}

export function saveLocalSession(user: User): void {
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
}

export function getSavedLocalSession(): User | null {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    return data ? (JSON.parse(data) as User) : null;
  } catch {
    return null;
  }
}

export function syncSessionWithSupabase(onUserUpdate: (user: User) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Check if we already have this user in local storage to prevent unnecessary overwrites
      const currentLocal = getSavedLocalSession();
      if (currentLocal && currentLocal.id === session.user.id) {
        onUserUpdate(currentLocal);
        return;
      }
      
      // We have a session but no local storage! Likely returned from Google OAuth
      const email = session.user.email || '';
      
      // Let's get their profile from the database to get the real username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role, wallet_balance, recovery_email')
        .eq('id', session.user.id)
        .single();

      const username = profile?.username || session.user.user_metadata?.name || 'user';
      
      const userObj = createDefaultUserStructure(session.user.id, username, email);
      
      // Override with real DB data if available
      if (profile) {
        userObj.role = profile.role as 'user' | 'vip' | 'super_admin';
        userObj.walletBalance = profile.wallet_balance || 0;
        userObj.recoveryEmail = profile.recovery_email || undefined;
      }

      saveLocalSession(userObj);
      onUserUpdate(userObj);
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
}

export async function updateRecoveryEmail(user: User, email: string): Promise<User> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ recovery_email: email })
        .eq('id', user.id);
        
      if (error) {
        console.error('Failed to update recovery email in DB:', error);
      }
    }

    const updatedUser = { ...user, recoveryEmail: email };
    saveLocalSession(updatedUser);
    return updatedUser;
  } catch {
    return user;
  }
}
