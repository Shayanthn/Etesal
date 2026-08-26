import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeDimensions = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeDimensions[size]} rounded-2xl overflow-hidden shadow-lg shadow-purple-950/40 border border-purple-500/30 flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-950 shrink-0 group transition-transform duration-300 hover:scale-105`}
      >
        {!imageError ? (
          <img
            src="/logo.png"
            alt="اتصال Etesal Hub Logo"
            className="w-full h-full object-cover p-1 transition-opacity duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-black tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-300">
              E
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-purple-400/20 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-white text-base md:text-lg">
              اتصال
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              v6.0 Hub
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-tight">
            مرکز نودهای هوشمند ضد فیلتر
          </span>
        </div>
      )}
    </div>
  );
};
