import React from 'react';
import { 
  Send, 
  ShieldCheck, 
  Heart, 
  ExternalLink,
  Zap,
  Globe,
  Headphones
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';

interface FooterProps {
  onNavigate?: (view: 'home' | 'dashboard' | 'download' | 'support' | 'news' | 'admin' | '404') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-[#06080c] text-slate-400 text-xs">
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-4 text-right">
            <button 
              onClick={() => onNavigate ? onNavigate('home') : undefined}
              className="cursor-pointer text-right"
            >
              <BrandLogo size="md" />
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              پورتال اتصال؛ سامانه هوشمند ارائه و پایش نودهای ضد فیلتر و دورزننده DPI با هدف دسترسی آزاد و امن به اینترنت جهانی.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>تمامی ارتباطات رمزنگاری شده و بدون ذخیره لاگ هستند.</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-right">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate ? onNavigate('download') : undefined} 
                  className="hover:text-purple-400 text-purple-300 font-semibold transition-colors cursor-pointer"
                >
                  دانلود مستقیم اپلیکیشن (APK)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate ? onNavigate('news') : undefined} 
                  className="hover:text-cyan-400 text-cyan-300 font-semibold transition-colors cursor-pointer"
                >
                  اخبار و رصدخانه شبکه
                </button>
              </li>
              <li>
                <a href="#configs" className="hover:text-purple-400 transition-colors">کانفیگ‌های Reality</a>
              </li>
              <li>
                <a href="#proxies" className="hover:text-cyan-400 transition-colors">پروکسی‌های تلگرام</a>
              </li>
              <li>
                <a href="#articles" className="hover:text-purple-400 transition-colors">پایگاه دانش شبکه</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Social */}
          <div className="space-y-3 text-right">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">پشتیبانی و جامعه ما</h4>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate ? onNavigate('support') : undefined}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-purple-500/60 text-purple-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold">فرم ثبت تیکت پشتیبانی</span>
                </div>
                <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full font-bold">آنلاین</span>
              </button>

              <a
                href="https://t.me/NetWithoutBorders"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-mono text-xs font-bold">@NetWithoutBorders</span>
                </div>
                <ExternalLink className="w-3 h-3 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              </a>

              <a
                href="https://t.me/vpnbuying"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono text-xs">@vpnbuying</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              <a
                href="https://github.com/hiddify/hiddify-next"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs">هسته Sing-Box / Hiddify</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} اتصال (Etesal Hub). تمامی حقوق برای جامعه اینترنت آزاد محفوظ است.
          </div>
          <div className="flex items-center gap-1">
            <span>طراحی شده با</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>برای دسترسی آزاد به اینترنت</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
