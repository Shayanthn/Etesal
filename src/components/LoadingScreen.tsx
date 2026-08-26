import React from 'react';
import { BrandLogo } from './BrandLogo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080a0f] text-white">
      <div className="relative flex flex-col items-center gap-6 p-8">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
          <BrandLogo size="xl" showText={false} />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
            سامانه هوشمند اتصال
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            در حال پایش و بهینه‌سازی سرورهای ضد فیلتر...
          </p>
        </div>

        <div className="w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
          <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
