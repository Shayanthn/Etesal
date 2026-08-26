import React from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Layers,
  Cpu
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadPage?: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenDownloadPage 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo size="md" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">دانلود اپلیکیشن اندروید اتصال</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                نسخه v6.0.4
              </span>
            </div>
            <p className="text-xs text-slate-400">هسته اختصاصی Sing-Box و دورزننده DPI</p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {[
            { icon: ShieldCheck, text: 'بای‌پس کامل فیلترینگ DPI' },
            { icon: Cpu, text: 'پشتیبانی از Hysteria 2 و Reality' },
            { icon: Layers, text: 'تفکیک هوشمند ترافیک سایت‌های ایرانی' },
            { icon: Smartphone, text: 'پشتیبانی از اندروید ۶ تا ۱۵' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center gap-2.5">
              <item.icon className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Download Buttons */}
        <div className="space-y-3 mb-6">
          {onOpenDownloadPage ? (
            <button
              onClick={() => {
                onClose();
                onOpenDownloadPage();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-right">
                  <div className="text-sm font-black">رفتن به صفحه اختصاصی دانلود APK</div>
                  <div className="text-[10px] font-normal text-purple-200">دارای کد QR، راهنمای مصور نصب و هش SHA-256</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80" />
            </button>
          ) : (
            <a
              href="https://t.me/vpnbuying"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-right">
                  <div className="text-sm font-black">دانلود مستقیم فایل APK (رایگان)</div>
                  <div className="text-[10px] font-normal text-purple-200">حجم: ۶.۸ مگابایت • نسخه ۶۴ بیتی و ۳۲ بیتی</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80" />
            </a>
          )}

          <a
            href="https://github.com/hiddify/hiddify-next/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-slate-400" />
              <span>دانلود کلاینت رسمی Hiddify از گیت‌هاب</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Security Note */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p className="leading-relaxed">
            اپلیکیشن متن‌باز است و هیچ لاگی از فعالیت وب شما ثبت نمی‌کند. تمامی ارتباطات به صورت سرتاسری رمزنگاری می‌شوند.
          </p>
        </div>
      </div>
    </div>
  );
};
