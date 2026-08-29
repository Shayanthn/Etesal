const fs = require('fs');

let authCode = fs.readFileSync('src/services/authService.ts', 'utf8');

authCode = authCode.replace(/transactions/g, 'walletTransactions'); // undo my mistake if any

authCode = `
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
  return \`\${clean}@user.etesal.internal\`;
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

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
}

export function updateRecoveryEmail(email: string): boolean {
  try {
    const currentSession = getSavedLocalSession();
    if (!currentSession) return false;
    currentSession.recoveryEmail = email;
    saveLocalSession(currentSession);
    return true;
  } catch {
    return false;
  }
}
`;

fs.writeFileSync('src/services/authService.ts', authCode);
