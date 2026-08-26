import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Send, 
  Download, 
  Sparkles, 
  Activity, 
  Users, 
  Flame,
  Globe2,
  Lock
} from 'lucide-react';
import { NewsItem } from '../../types';
import { TechNewsBox } from '../news/TechNewsBox';

interface HeroSectionProps {
  onOpenApkModal: () => void;
  onNavigateToDownload?: () => void;
  onNavigateToNewsHub?: () => void;
  news: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onOpenApkModal, 
  onNavigateToDownload,
  onNavigateToNewsHub,
  news, 
  onSelectNews 
}) => {
  return (
    <section className="py-6 md:py-10 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Right Column (RTL): Hero Main Info & Actions - 7 cols */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold animate-fade-in shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>پورتال رسمی توزیع نودهای پایدار ضد فیلتر • جامعه @vpnbuying</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              سامانه هوشمند <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">اتصال ضد DPI</span> با پینگ تضمینی
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
              دسترسی آزاد و پایدار به کانفیگ‌های تست‌شده VLESS Reality، Hysteria 2 و پروکسی‌های اختصاصی تلگرام برای اپراتورهای همراه اول، ایرانسل، رایتل و اینترنت خانگی.
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#configs"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>دریافت کانفیگ‌های V2Ray</span>
              </a>

              <a
                href="#proxies"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
              >
                <Send className="w-4 h-4 text-cyan-400" />
                <span>پروکسی تلگرام (۱ کلیک)</span>
              </a>

              <button
                onClick={onNavigateToDownload || onOpenApkModal}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 text-purple-300 font-bold text-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>دانلود اپلیکیشن اختصاصی</span>
              </button>
            </div>
          </div>

          {/* Stat Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
            {[
              { label: 'پروتکل‌های فعال', value: 'VLESS / Hy2 / TUIC', icon: ShieldCheck, color: 'text-purple-400' },
              { label: 'میانگین پینگ', value: '۴۲ میلی‌ثانیه', icon: Activity, color: 'text-emerald-400' },
              { label: 'پایش مستمر', value: '۲۴ ساعته خودکار', icon: Zap, color: 'text-cyan-400' },
              { label: 'اعضای جامعه', value: '+۲۸,۰۰۰ کاربر', icon: Users, color: 'text-indigo-400' }
            ].map((stat, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/90 text-center">
                <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <div className="text-xs font-black text-white truncate">{stat.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Left Column (RTL): Tech & Internet News Box (10 Latest Iran & World) - 5 cols */}
        <div className="lg:col-span-5 h-full">
          <TechNewsBox 
            news={news} 
            onSelectNews={onSelectNews} 
            onNavigateToNewsHub={onNavigateToNewsHub}
          />
        </div>

      </div>
    </section>
  );
};
