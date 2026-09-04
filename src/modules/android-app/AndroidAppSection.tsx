import React from 'react';
import { 
  Smartphone, 
  ShieldCheck, 
  Download, 
  Zap, 
  Layers, 
  Lock, 
  Sparkles,
  Check
} from 'lucide-react';
import { V2RayConfig } from '../../types';
import { AndroidAppInterface } from './AndroidAppInterface';

interface AndroidAppSectionProps {
  configs: V2RayConfig[];
  onOpenApkModal: () => void;
  onNavigateToDownload?: () => void;
}

export const AndroidAppSection: React.FC<AndroidAppSectionProps> = ({ 
  configs, 
  onOpenApkModal,
  onNavigateToDownload 
}) => {
  return (
    <section id="android-app" className="py-12 border-t border-slate-800/80 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: App Interactive Mockup */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
            <AndroidAppInterface configs={configs} onOpenApkModal={onOpenApkModal} />
          </div>

          {/* Right Column: Features & Download */}
          <div className="lg:col-span-7 space-y-6 text-right order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>هسته هوشمند اختصاصی Sing-Box v1.10</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              اپلیکیشن اختصاصی اندروید <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">اتصال</span>
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              تجربه‌ای بدون افت سرعت و بدون نیاز به تنظیمات پیچیده. با یک لمس به سالم‌ترین نودهای ارتباطی متصل شوید و از ارتباط پایدار لذت ببرید.
            </p>

            {/* Benefit Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'رمزنگاری و پایداری شبکه', desc: 'تکنولوژی پیشرفته مدیریت بسته‌های TLS' },
                { title: 'تفکیک ترافیک ایرانی', desc: 'بانک‌ها و سامانه‌های پرداخت بدون قطعی' },
                { title: 'اتصال هوشمند Smart Connect', desc: 'انتخاب خودکار کم‌پینگ‌ترین نود پایدار' },
                { title: 'بدون ثبت لاگ و تبلیغات', desc: 'حفظ حریم خصوصی با امنیت سرتاسری' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onNavigateToDownload || onOpenApkModal}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>صفحه رسمی و دریافت فایل APK</span>
              </button>

              <a
                href="#configs"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>مشاهده کانفیگ‌های دستی</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
