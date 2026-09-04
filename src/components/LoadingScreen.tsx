import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Cpu, Wifi } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  const [progress, setProgress] = useState(15);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { title: 'برقراری ارتباط امن با گیت‌وی ابری...', sub: 'اتصال لبه شبکه (Edge Gateway)', icon: Wifi },
    { title: 'پایش و اعتبارسنجی پینگ نودها...', sub: 'سنجش تاخیر میلی‌ثانیه و فیلترینگ نودها', icon: Cpu },
    { title: 'سامانه هوشمند اتصال آماده است', sub: 'بارگذاری سریع محیط کاربری پایدار', icon: ShieldCheck },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(55);
      setStepIndex(1);
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(95);
      setStepIndex(2);
    }, 950);

    const timer3 = setTimeout(() => {
      setProgress(100);
    }, 1350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-white select-none overflow-hidden">
      {/* Ambient background aura glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-7 p-6 max-w-sm w-full mx-auto">
        {/* Animated Brand Logo with Radar Ring */}
        <div className="relative">
          <BrandLogo size="xl" showText={false} isAnimated={true} />
        </div>

        {/* Dynamic Status Typography */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>اتصال</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-300">
              Etesal Hub
            </span>
          </h2>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-cyan-300 font-medium animate-fadeIn">
            <CurrentIcon className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{steps[stepIndex].title}</span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            {steps[stepIndex].sub}
          </p>
        </div>

        {/* Progress Tracker Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
            <span>در حال مقداردهی اولیه...</span>
            <span className="text-cyan-300 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Security / Quality Stamp */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>SING-BOX CORE v6 • EDGE GATEWAY CONNECTED</span>
        </div>
      </div>
    </div>
  );
};
