import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowLeft, CheckCircle2, Sparkles, X } from 'lucide-react';

interface RecoveryEmailPromptModalProps {
  isOpen: boolean;
  username: string;
  onSaveEmail: (email: string) => void;
  onSkip: () => void;
}

export const RecoveryEmailPromptModal: React.FC<RecoveryEmailPromptModalProps> = ({
  isOpen,
  username,
  onSaveEmail,
  onSkip
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('لطفاً آدرس ایمیل معتبر خود را وارد کنید.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      setError('فرمت ایمیل وارد شده صحیح نمی‌باشد (مثال: user@gmail.com).');
      return;
    }

    setError('');
    setIsSaved(true);
    setTimeout(() => {
      onSaveEmail(emailInput.trim());
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in dir-rtl">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-950/40 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onSkip}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        {isSaved ? (
          <div className="text-center py-6 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-100 mb-2">ایمیل بازیابی با موفقیت ثبت شد!</h3>
            <p className="text-sm text-slate-400">
              حساب کاربری شما با امنیت کامل فعال شد. در حال انتقال به داشبورد...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ثبت‌نام با موفقیت انجام شد</span>
                </div>
                <h3 className="text-lg font-black text-slate-100">
                  خوش‌آمدی، <span className="text-emerald-300">{username}</span> عزیز!
                </h3>
              </div>
            </div>

            {/* Prompt Notice */}
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-sm leading-relaxed mb-5">
              <p className="font-semibold mb-1">💡 یک نکته بسیار مهم برای امنیت حسابت:</p>
              <p className="text-xs text-emerald-300/90 leading-6">
                چون ثبت‌نامت بدون احراز هویت و فقط با یوزرنیم انجام شد، برای اینکه <strong className="text-emerald-100 font-bold">اگه رمزت یادت رفت بعداً شرمندت نشیم</strong>، لطفاً ایمیلت رو وارد کن تا در صورت نیاز بتونی رمز عبورت رو برگردونی.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  آدرس ایمیل برای بازیابی حساب (اختیاری):
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-3 pl-11 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                    autoFocus
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
                {error && (
                  <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>ثبت ایمیل و ادامه</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
                >
                  بعداً وارد می‌کنم
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
