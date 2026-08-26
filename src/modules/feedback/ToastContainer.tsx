import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Terminal 
} from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-3">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all transform animate-[slideUp_0.3s_ease-out] flex items-start gap-3 text-right ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
                : isError
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/50'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-100 shadow-cyan-950/50'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {isError && (
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 animate-pulse">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              {isWarning && (
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {!isSuccess && !isError && !isWarning && (
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-black flex items-center gap-1.5">
                <span>{toast.title}</span>
              </h4>
              <p className="text-[11px] opacity-90 leading-relaxed font-normal">
                {toast.description}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
