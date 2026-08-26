import React, { useState } from 'react';
import { Home, Radio, Sparkles, Terminal, Compass, RefreshCw, ArrowLeft } from 'lucide-react';
import { InteractiveMascot } from '../modules/auth/InteractiveMascot';

export const NotFoundPage: React.FC<{ onGoHome?: () => void }> = ({ onGoHome }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | undefined>();

  const handleRadarScan = () => {
    setIsScanning(true);
    setScanMessage('در حال پویش کهکشان سایبری و دیتاسنترهای فرانکفورت... 🛰️');
    
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('سیگنال پایگاه اصلی پورتال اتصال پیدا شد! به خانه برگرد کاپیتان 📡✨');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Ambient background space glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full p-8 md:p-10 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-6 relative z-10">
        
        {/* Animated Cyber Mascot in 404 Lost Mode */}
        <div className="w-full flex justify-center">
          <InteractiveMascot
            lookPercentage={isScanning ? 90 : 20}
            isPasswordMode={false}
            isPeeking={false}
            isError={!isScanning && !scanMessage?.includes('پیدا شد')}
            isSuccess={!!scanMessage?.includes('پیدا شد')}
            isSubmitting={isScanning}
            message={scanMessage || 'اوپس! در کهکشان سایبری گم شدیم! خطای ۴۰۴ 🚀'}
          />
        </div>

        {/* 404 Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>HTTP 404 • ROUTE_NOT_FOUND</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            نود مورد نظر در فضا پیدا نشد!
          </h1>
          
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            مسیری که دنبالش بودید یا توسط فایروال محو شده، یا به یکی دیگر از خوشه‌های Anycast منتقل گشته است.
          </p>
        </div>

        {/* Radar Scanner Easter Egg */}
        <button
          type="button"
          onClick={handleRadarScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <Compass className={`w-4 h-4 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'در حال پایش رادار...' : 'اسکن رادار فرکانس‌های آزاد'}</span>
        </button>

        {/* Return Button */}
        <button
          onClick={onGoHome || (() => window.location.href = '/')}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-purple-950/50 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>بازگشت به پایگاه مرکزی اتصال</span>
          <ArrowLeft className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
