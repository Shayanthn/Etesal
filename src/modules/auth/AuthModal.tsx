import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  KeyRound
} from 'lucide-react';
import { InteractiveMascot } from './InteractiveMascot';
import { User, ToastMessage } from '../../types';
import { RecoveryEmailPromptModal } from './RecoveryEmailPromptModal';
import { loginUser, registerUser, updateRecoveryEmail, loginWithGoogle } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccessAuth: (user: User) => void;
  onShowToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccessAuth,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form fields: Username & Password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Recovery prompt state after signup
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [tempCreatedUser, setTempCreatedUser] = useState<User | null>(null);

  // Mascot tracking states
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [lookPercentage, setLookPercentage] = useState(50);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mascotMessage, setMascotMessage] = useState<string | undefined>();

  if (!isOpen) return null;

  // Calculate password strength score (0 to 4)
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength();

  // Helper to handle text typing cursor movement
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value;
    setter(val);
    setIsError(false);
    
    const len = val.length;
    const maxExpectedLen = 20;
    const percent = Math.min(100, Math.max(10, (len / maxExpectedLen) * 100));
    setLookPercentage(percent);
  };

  const handleInputFocus = (field: 'text' | 'password', length: number) => {
    setIsError(false);
    if (field === 'password') {
      setIsPasswordFocused(true);
      setMascotMessage(showPassword ? 'دزدکی دارم چک می‌کنم! 👀' : 'چشمامو بستم، رمزتو نبینم! 🙈');
    } else {
      setIsPasswordFocused(false);
      const percent = Math.min(100, Math.max(15, (length / 25) * 100));
      setLookPercentage(percent);
      setMascotMessage('حواسم به یوزرنیمت هست کاپیتان! 🤖');
    }
  };

  const handleInputBlur = () => {
    setIsPasswordFocused(false);
    setLookPercentage(50);
    setMascotMessage(undefined);
  };

  const triggerError = (msg: string, toastDesc: string) => {
    setIsError(true);
    setMascotMessage(msg);
    onShowToast({
      title: 'خطای اعتبارسنجی 🛑',
      description: toastDesc,
      type: 'error'
    });
    setTimeout(() => {
      setIsError(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase();

    // Validation
    if (!cleanUsername) {
      triggerError('نام کاربری رو وارد نکردی! ✍️', 'لطفاً نام کاربری (Username) دلخواه خود را وارد کنید.');
      return;
    }

    if (cleanUsername.length < 3) {
      triggerError('نام کاربری خیلی کوتاهه! 🤷‍♂️', 'نام کاربری باید حداقل ۳ کاراکتر باشد.');
      return;
    }

    if (password.length < 6) {
      triggerError('رمزت خیلی کوتاهه! 🔒', 'کلمه عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      triggerError('رمز عبور با تکرارش همخوانی نداره! 🤷‍♂️', 'تکرار کلمه عبور باید دقیقاً مشابه رمز اصلی باشد.');
      return;
    }

    // Processing state
    setIsSubmitting(true);
    setMascotMessage('در حال اعتبارسنجی رمزنگاری‌شده... ⏳');

    try {
      if (mode === 'register') {
        const result = await registerUser(cleanUsername, password);
        if (!result.success || !result.user) {
          triggerError('خطا در ثبت‌نام 🛑', result.error || 'ثبت‌نام انجام نشد.');
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        setMascotMessage('حساب شما با موفقیت ساخته شد! 🎉');
        setTempCreatedUser(result.user);
        setShowRecoveryPrompt(true);
      } else {
        const result = await loginUser(cleanUsername, password);
        if (!result.success || !result.user) {
          triggerError('اطلاعات ورود نادرست است 🛑', result.error || 'نام کاربری یا رمز عبور اشتباه است.');
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        setMascotMessage('ورود با موفقیت انجام شد 🚀');

        onShowToast({
          title: 'ورود موفقیت‌آمیز 🚀',
          description: `خوش آمدید ${cleanUsername} عزیز. نشست امن شما برقرار شد.`,
          type: 'success'
        });

        setTimeout(() => {
          onSuccessAuth(result.user!);
          onClose();
          setIsSuccess(false);
        }, 600);
      }
    } catch {
      triggerError('خطای سیستمی 🛑', 'خطایی در برقراری ارتباط رخ داد. مجدداً تلاش کنید.');
      setIsSubmitting(false);
    }
  };

  const handleSaveRecoveryEmail = async (email: string) => {
    if (!tempCreatedUser) return;
    const finalUser = await updateRecoveryEmail(tempCreatedUser, email);
    setShowRecoveryPrompt(false);
    onShowToast({
      title: 'ایمیل بازیابی با موفقیت ذخیره شد 🛡️',
      description: 'حساب کاربری شما با امنیت کامل فعال گردید.',
      type: 'success'
    });
    onSuccessAuth(finalUser);
    onClose();
  };

  const handleSkipRecoveryEmail = () => {
    if (!tempCreatedUser) return;
    setShowRecoveryPrompt(false);
    onShowToast({
      title: 'خوش آمدید 🎉',
      description: 'می‌توانید هر زمان از بخش تنظیمات حساب، ایمیل بازیابی خود را ثبت کنید.',
      type: 'info'
    });
    onSuccessAuth(tempCreatedUser);
    onClose();
  };

  return (
    <>
      {showRecoveryPrompt && tempCreatedUser && (
        <RecoveryEmailPromptModal
          isOpen={showRecoveryPrompt}
          username={tempCreatedUser.username}
          onSaveEmail={handleSaveRecoveryEmail}
          onSkip={handleSkipRecoveryEmail}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-md my-auto rounded-3xl bg-slate-900 border border-purple-500/30 p-6 md:p-8 shadow-2xl shadow-purple-950/50 text-right overflow-hidden">
          
          {/* Glow ambient background */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mascot Header */}
          <div className="pt-2 pb-4">
            <InteractiveMascot
              lookPercentage={lookPercentage}
              isPasswordMode={isPasswordFocused}
              isPeeking={showPassword}
              isError={isError}
              isSuccess={isSuccess}
              isSubmitting={isSubmitting}
              message={mascotMessage}
            />
          </div>

          {/* Tab Switcher (Login vs Register) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-5 relative z-10">
            <button
              type="button"
              onClick={() => { setMode('login'); setIsError(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ورود با نام کاربری
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setIsError(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ثبت‌نام سریع (بدون نیاز به ایمیل)
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">نام کاربری (Username)</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => handleInputChange(e, setUsername)}
                  onFocus={() => handleInputFocus('text', username.length)}
                  onBlur={handleInputBlur}
                  placeholder="مثال: shayan_user"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-left font-mono"
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">کلمه عبور (Password)</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => triggerError('بازیابی رمز عبور 📩', 'در صورت فراموشی، به پشتیبانی آنلاین پیام دهید یا از ایمیل بازیابی استفاده کنید.')}
                    className="text-[11px] text-purple-400 hover:underline cursor-pointer"
                  >
                    فراموشی رمز؟
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setIsError(false);
                  }}
                  onFocus={() => handleInputFocus('password', password.length)}
                  onBlur={handleInputBlur}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-left font-mono"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    setMascotMessage(!showPassword ? 'دزدکی دارم چک می‌کنم! 👀' : 'چشمامو بستم، خیالت راحت! 🙈');
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter (Register Mode) */}
              {mode === 'register' && password.length > 0 && (
                <div className="pt-1 space-y-1 animate-fade-in">
                  <div className="flex items-center gap-1 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          idx <= passwordScore
                            ? passwordScore === 1 ? 'bg-rose-500' :
                              passwordScore === 2 ? 'bg-amber-500' :
                              passwordScore === 3 ? 'bg-cyan-500' : 'bg-emerald-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Register Mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold text-slate-300 block">تکرار کلمه عبور</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      setIsError(false);
                    }}
                    onFocus={() => handleInputFocus('password', confirmPassword.length)}
                    onBlur={handleInputBlur}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-left font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Remember me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-lg bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-600"
                />
                <span>مرا به خاطر بسپار</span>
              </label>

              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Log / Encrypted Vault</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال اعتبارسنجی امن...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ورود به حساب</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>ثبت‌نام آنی و دریافت هدیه خوش‌آمدگویی</span>
                </>
              )}
            </button>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative bg-slate-900 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                یا از طریق
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  setIsSubmitting(true);
                  await loginWithGoogle();
                } catch (err) {
                  triggerError('خطای ورود با گوگل 🛑', 'ارتباط با سرور گوگل برقرار نشد.');
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{mode === 'login' ? 'ورود با حساب گوگل' : 'ثبت‌نام سریع با حساب گوگل'}</span>
            </button>
          </form>

        </div>
      </div>
    </>
  );
};
