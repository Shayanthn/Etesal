import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, ArrowRight, KeyRound, AlertTriangle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { verifyAdminPasscode, checkAdminSession, terminateAdminSession } from '../../services/adminSecurityService';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  onExit?: () => void;
  onAccessDenied?: () => void;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children, onExit, onAccessDenied }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExitFlow = () => {
    if (onExit) onExit();
    else if (onAccessDenied) onAccessDenied();
  };

  // بررسی وضعیت نشست امن مدیر با اعتبارسنجی امضای توکن و طول عمر
  useEffect(() => {
    const isValid = checkAdminSession();
    if (isValid) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isSuccess = await verifyAdminPasscode(adminPassword);
      if (isSuccess) {
        setIsAdminAuthenticated(true);
        setAdminPassword('');
      } else {
        setError('رمز عبور مدیر سیستم نادرست است. دسترسی غیرمجاز متوقف گردید.');
      }
    } catch {
      setError('خطای سیستمی در پردازش کلید امنیتی.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogout = () => {
    terminateAdminSession();
    setIsAdminAuthenticated(false);
    handleExitFlow();
  };

  if (isAdminAuthenticated) {
    return (
      <div className="relative">
        {/* نوار وضعیت امنیتی بالای پنل ادمین */}
        <div className="bg-amber-950/90 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between dir-rtl">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>نشست امنیتی مدیریت کل فعال است (Admin Role Cryptographically Authenticated)</span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-bold transition-colors cursor-pointer"
          >
            خروج از حالت مدیریت
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dir-rtl relative overflow-hidden">
      {/* Background Cyber Accents */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-100 mb-1.5">مرکز کنترل و مدیریت اتصال</h2>
          <p className="text-xs text-slate-400">
            این بخش دارای محافظت رمزنگاری است. لطفاً کلید امنیتی مدیر سیستم را وارد کنید.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>تطبیق گذرواژه با الگوریتم SHA-256 و بدون ذخیره متن خام انجام می‌شود.</span>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              کلید امنیتی مدیر (Admin Security Passphrase):
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-3 pl-11 pr-11 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all font-mono"
                autoFocus
              />
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-rose-400 text-xs mt-2 font-medium flex items-center gap-1.5 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !adminPassword}
            className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>احراز هویت رمزنگاری‌شده</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={handleExitFlow}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به پورتال اصلی</span>
          </button>
        </div>
      </div>
    </div>
  );
};
