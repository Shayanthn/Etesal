import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
  isAnimated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
  isAnimated = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: { box: 'w-8 h-8', imgPad: 'p-1', text: 'text-sm', badge: 'text-[9px]', sub: 'text-[10px]' },
    md: { box: 'w-11 h-11', imgPad: 'p-1.5', text: 'text-base md:text-lg', badge: 'text-[10px]', sub: 'text-[11px]' },
    lg: { box: 'w-14 h-14', imgPad: 'p-2', text: 'text-lg md:text-xl', badge: 'text-xs', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', imgPad: 'p-2.5', text: 'text-2xl', badge: 'text-xs', sub: 'text-sm' },
    '2xl': { box: 'w-28 h-28', imgPad: 'p-3', text: 'text-3xl', badge: 'text-sm', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Logo Container with Optical Framing */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Breathing Outer Ambient Aura */}
        <div
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr from-purple-600/40 via-indigo-500/30 to-cyan-400/40 blur-md pointer-events-none ${
            isAnimated ? 'animate-pulse' : 'opacity-75'
          }`}
        />

        {/* Orbit Ring for animated mode */}
        {isAnimated && (
          <div className="absolute -inset-2 rounded-2xl border border-purple-500/40 border-dashed animate-[spin_8s_linear_infinite] pointer-events-none" />
        )}

        {/* Core Frame */}
        <div
          className={`relative ${currentSize.box} rounded-2xl overflow-hidden shadow-xl shadow-purple-950/60 border border-purple-400/30 bg-gradient-to-b from-slate-900 via-slate-950 to-[#080a0f] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/50`}
        >
          {!imageError ? (
            <img
              src="/logo.png"
              alt="لوگوی رسمی اتصال | Etesal Hub"
              className={`w-full h-full object-contain ${currentSize.imgPad} transition-transform duration-500 ${
                isAnimated ? 'scale-105 filter drop-shadow(0 0 8px rgba(168,85,247,0.5))' : ''
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-700 to-cyan-600 text-white font-black">
              <span className="tracking-tighter drop-shadow-md">اتصال</span>
            </div>
          )}

          {/* High-Gloss Light Sheen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/30 pointer-events-none" />
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-right justify-center">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-white leading-none ${currentSize.text}`}>
              اتصال
            </span>
            <span className="text-slate-400 font-bold tracking-tight text-xs md:text-sm font-sans">
              Etesal
            </span>
            <span
              className={`font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 ${currentSize.badge}`}
            >
              v6.0
            </span>
          </div>
          <span className={`text-slate-400 font-medium tracking-tight mt-1 leading-snug hidden sm:block ${currentSize.sub}`}>
            پورتال هوشمند ارتباطات و اتصال پایدار ابری
          </span>
        </div>
      )}
    </div>
  );
};
