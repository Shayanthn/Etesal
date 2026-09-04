import React from 'react';

export interface MascotState {
  lookPercentage: number; // 0 to 100
  isPasswordMode: boolean;
  isPeeking: boolean;
  isError: boolean;
  isSuccess: boolean;
  isSubmitting: boolean;
  message?: string;
}

export const InteractiveMascot: React.FC<MascotState> = ({
  lookPercentage,
  isPasswordMode,
  isPeeking,
  isError,
  isSuccess,
  isSubmitting,
  message
}) => {
  // Eye pupil movement calculations: range from -12px to +12px horizontally, -4px to +6px vertically
  const pupilX = isPasswordMode && !isPeeking 
    ? 0 
    : Math.max(-14, Math.min(14, ((lookPercentage - 50) / 50) * 14));
  
  const pupilY = isPasswordMode && !isPeeking 
    ? 0 
    : Math.max(-3, Math.min(6, (lookPercentage > 0 ? 3 : 0)));

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Speech Bubble / Mascot Mood Quote */}
      <div className="relative mb-1 sm:mb-2 transition-all duration-300 max-w-[270px] sm:max-w-xs">
        <div className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-center border shadow-lg backdrop-blur-md transition-all duration-300 ${
          isError 
            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-bounce' 
            : isSuccess 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 scale-105' 
            : isPasswordMode && !isPeeking
            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
            : isPeeking
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
            : 'bg-slate-900/80 text-cyan-300 border-cyan-500/30'
        }`}>
          {message || (
            isError ? 'وای! اطلاعات وارد شده معتبر نیست! 🙈' :
            isSuccess ? 'ایول! کلیدهای رمزنگاری تأیید شد 🚀' :
            isPasswordMode && !isPeeking ? 'چشمامو بستم، خیالت راحت نگات نمی‌کنم! 🙈' :
            isPeeking ? 'دزدکی دارم چک می‌کنم رمزو درست زدی؟ 👀' :
            isSubmitting ? 'در حال برقراری هندشیک امن با سرور... ⏳' :
            'سلام جیگر! مشخصاتت رو دقیق بنویس تا چشمام دنبالت کنه ✨'
          )}
        </div>
        {/* Tail */}
        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rotate-45 mx-auto -mt-1 border-r border-b ${
          isError ? 'bg-rose-950 border-rose-500/40' :
          isSuccess ? 'bg-emerald-950 border-emerald-500/40' :
          isPasswordMode ? 'bg-purple-950 border-purple-500/40' :
          'bg-slate-900 border-cyan-500/30'
        }`} />
      </div>

      {/* Interactive Mascot SVG Canvas */}
      <div className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 relative transition-transform duration-300 ${isError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-2xl overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ears / Antennas */}
          <g className="transition-transform duration-300">
            {/* Left Antenna */}
            <path 
              d="M 50 70 Q 25 35 45 20 Q 65 35 58 65" 
              fill="url(#bodyGrad)" 
              className={isSuccess ? 'animate-pulse' : ''}
            />
            <circle cx="43" cy="20" r="7" fill="#22d3ee" filter="url(#cyberGlow)" />

            {/* Right Antenna */}
            <path 
              d="M 150 70 Q 175 35 155 20 Q 135 35 142 65" 
              fill="url(#bodyGrad)" 
              className={isSuccess ? 'animate-pulse' : ''}
            />
            <circle cx="157" cy="20" r="7" fill="#a855f7" filter="url(#cyberGlow)" />
          </g>

          {/* Robot / Cyber Yeti Head Body */}
          <rect 
            x="35" 
            y="45" 
            width="130" 
            height="125" 
            rx="45" 
            fill="url(#bodyGrad)" 
            stroke="#a855f7" 
            strokeWidth="3"
            className="transition-all duration-300"
          />

          {/* Inner Face Screen (Dark Glass) */}
          <rect 
            x="48" 
            y="60" 
            width="104" 
            height="90" 
            rx="32" 
            fill="url(#faceGrad)" 
            stroke={isError ? '#f43f5e' : isSuccess ? '#10b981' : '#38bdf8'} 
            strokeWidth="2.5" 
            className="transition-colors duration-300"
          />

          {/* Screen Scanlines Effect */}
          <line x1="52" y1="75" x2="148" y2="75" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
          <line x1="52" y1="95" x2="148" y2="95" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
          <line x1="52" y1="115" x2="148" y2="115" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />

          {/* Eyebrows */}
          <g className="transition-all duration-300">
            {isError ? (
              <>
                {/* Angry/Confused Eyebrows */}
                <line x1="68" y1="84" x2="88" y2="90" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="132" y1="84" x2="112" y2="90" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
              </>
            ) : isSuccess ? (
              <>
                {/* Happy high eyebrows */}
                <line x1="68" y1="80" x2="88" y2="78" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                <line x1="112" y1="78" x2="132" y2="80" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Normal Eyebrows tracking */}
                <line 
                  x1="70" 
                  y1={82 - (pupilY < 0 ? 3 : 0)} 
                  x2="88" 
                  y2={83 - (pupilY < 0 ? 3 : 0)} 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <line 
                  x1="112" 
                  y1={83 - (pupilY < 0 ? 3 : 0)} 
                  x2="130" 
                  y2={82 - (pupilY < 0 ? 3 : 0)} 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
              </>
            )}
          </g>

          {/* Eyes Sockets & Pupils */}
          <g>
            {/* Left Eye */}
            <circle cx="78" cy="98" r="15" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            {/* Right Eye */}
            <circle cx="122" cy="98" r="15" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

            {isSuccess ? (
              // Happy Arc Eyes (^ ^)
              <>
                <path d="M 68 100 Q 78 88 88 100" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                <path d="M 112 100 Q 122 88 132 100" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : (
              // Dynamic Moving Pupils
              <>
                {/* Left Pupil */}
                <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: 'transform 0.15s ease-out' }}>
                  <circle cx="78" cy="98" r={isError ? 8.5 : 7} fill={isError ? '#f43f5e' : '#06b6d4'} />
                  {/* Eye light glare reflection */}
                  <circle cx="75.5" cy="95.5" r="2.5" fill="#ffffff" />
                </g>

                {/* Right Pupil */}
                <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)`, transition: 'transform 0.15s ease-out' }}>
                  <circle cx="122" cy="98" r={isError ? 8.5 : 7} fill={isError ? '#f43f5e' : '#06b6d4'} />
                  {/* Eye light glare reflection */}
                  <circle cx="119.5" cy="95.5" r="2.5" fill="#ffffff" />
                </g>
              </>
            )}
          </g>

          {/* Cheeks Blush */}
          {(isSuccess || (!isError && !isPasswordMode)) && (
            <>
              <ellipse cx="64" cy="112" rx="6" ry="3.5" fill="#f43f5e" opacity="0.4" />
              <ellipse cx="136" cy="112" rx="6" ry="3.5" fill="#f43f5e" opacity="0.4" />
            </>
          )}

          {/* Mouth */}
          <g className="transition-all duration-300">
            {isError ? (
              // Sad / shocked wavy mouth (~ or O)
              <path d="M 90 132 Q 100 122 110 132" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
            ) : isSuccess ? (
              // Big happy smile (D)
              <path d="M 88 124 Q 100 142 112 124 Z" fill="#10b981" stroke="#10b981" strokeWidth="2" />
            ) : isSubmitting ? (
              // Small speaking/processing O mouth
              <ellipse cx="100" cy="128" rx="5" ry="6" fill="#38bdf8" />
            ) : (
              // Calm pleasant smile
              <path d="M 92 126 Q 100 134 108 126" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

          {/* Hands Covering Eyes (Password Mode Animation) */}
          {/* Left Hand */}
          <g 
            style={{
              transform: isPasswordMode 
                ? (isPeeking ? 'translate(22px, -36px) rotate(-15deg)' : 'translate(32px, -48px) rotate(0deg)') 
                : 'translate(0px, 0px)',
              transformOrigin: '40px 160px',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <path 
              d="M 25 155 Q 35 130 55 135 Q 75 140 70 165 Z" 
              fill="url(#handGrad)" 
              stroke="#6366f1" 
              strokeWidth="2.5" 
            />
            {/* Finger Pads */}
            <circle cx="58" cy="138" r="4" fill="#c084fc" />
            <circle cx="68" cy="144" r="4" fill="#c084fc" />
          </g>

          {/* Right Hand */}
          <g 
            style={{
              transform: isPasswordMode 
                ? (isPeeking ? 'translate(-8px, -18px) rotate(20deg)' : 'translate(-32px, -48px) rotate(0deg)') 
                : 'translate(0px, 0px)',
              transformOrigin: '160px 160px',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <path 
              d="M 175 155 Q 165 130 145 135 Q 125 140 130 165 Z" 
              fill="url(#handGrad)" 
              stroke="#6366f1" 
              strokeWidth="2.5" 
            />
            {/* Finger Pads */}
            <circle cx="142" cy="138" r="4" fill="#c084fc" />
            <circle cx="132" cy="144" r="4" fill="#c084fc" />
          </g>

        </svg>
      </div>
    </div>
  );
};
