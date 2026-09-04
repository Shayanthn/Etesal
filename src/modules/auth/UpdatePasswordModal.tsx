import React, { useState } from 'react';
import { X, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSupabase } from '../../services/supabaseClient';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (toast: any) => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      onShowToast({ title: 'خطا', description: 'رمز عبور باید حداقل ۶ کاراکتر باشد', type: 'error' });
      return;
    }

    setIsLoading(true);
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.auth.updateUser({ password });
    
    setIsLoading(false);
    if (error) {
      onShowToast({ title: 'خطا', description: error.message, type: 'error' });
    } else {
      setIsSuccess(true);
      onShowToast({ title: 'موفق', description: 'رمز عبور با موفقیت تغییر یافت!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto overscroll-contain rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              تغییر رمز عبور
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">تغییر رمز موفقیت‌آمیز بود!</h3>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 ml-1">رمز عبور جدید</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-left pr-10 transition-all"
                    placeholder="••••••••"
                    dir="ltr"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-2"
              >
                {isLoading ? 'در حال ثبت...' : 'تایید رمز عبور جدید'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
