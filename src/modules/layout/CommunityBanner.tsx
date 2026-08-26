import React from 'react';
import { 
  Send, 
  Users, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Bell
} from 'lucide-react';

export const CommunityBanner: React.FC = () => {
  return (
    <section className="py-8">
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/70 to-purple-950/60 border border-blue-800/40 p-6 md:p-8 overflow-hidden shadow-2xl">
        
        {/* Background Decorative Rings */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>جامعه ۲۸,۰۰۰ نفری @vpnbuying</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
              عضویت در کانال تلگرام برای دریافت لحظه‌ای نودهای VIP
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              کانفیگ‌های اختصاصی با پینگ زیر ۴۰ میلی‌ثانیه، پروکسی‌های بدون قطعی و آخرین هشدارهای فیلترینگ شبکه را در لحظه دریافت کنید.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href="https://t.me/vpnbuying"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-950/60 transition-all cursor-pointer group"
            >
              <Send className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>عضویت در کانال @vpnbuying</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
