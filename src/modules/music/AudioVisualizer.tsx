import React, { useEffect, useRef, useState } from 'react';
import { Activity, Waves, Orbit, Sparkles, Sliders, Volume2 } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  trackTitle?: string;
  genre?: string;
}

type VisualizerMode = 'bars' | 'waves' | 'orbit';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  audioRef,
  trackTitle = 'موزیک اتصال',
  genre = 'Focus / Synthwave'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [glowIntensity, setGlowIntensity] = useState<number>(1.2);
  const [isFxActive, setIsFxActive] = useState<boolean>(true);

  // Animation frame ref
  const animFrameIdRef = useRef<number | null>(null);
  const peaksRef = useRef<number[]>(new Array(32).fill(0));
  const phaseRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; size: number; speed: number; angle: number; radius: number }>>([]);

  // Initialize orbiting particles
  useEffect(() => {
    const p: Array<{ x: number; y: number; size: number; speed: number; angle: number; radius: number }> = [];
    for (let i = 0; i < 40; i++) {
      p.push({
        x: 0,
        y: 0,
        size: Math.random() * 2.5 + 1,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 45 + 15
      });
    }
    particlesRef.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 320;
    const height = 90;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let running = true;

    const render = (time: number) => {
      if (!running) return;
      phaseRef.current += isPlaying ? 0.045 : 0.01;
      ctx.clearRect(0, 0, width, height);

      // Generate dynamic audio frequency buffer
      const barCount = 32;
      const frequencies: number[] = [];
      const currentAudio = audioRef.current;
      const curTime = currentAudio ? currentAudio.currentTime : time * 0.001;

      for (let i = 0; i < barCount; i++) {
        if (isPlaying) {
          // Dynamic rhythm synthesis based on musical harmonics
          const bassBoost = Math.sin(curTime * 3.5 + i * 0.15) * 0.5 + 0.5;
          const midRhythm = Math.cos(curTime * 5.2 + i * 0.4) * 0.5 + 0.5;
          const highJitter = Math.sin(curTime * 8.7 + i * 0.7) * 0.3 + 0.5;
          const composite = (bassBoost * 0.5 + midRhythm * 0.35 + highJitter * 0.15);
          const scaled = Math.max(0.08, composite * Math.sin((i / barCount) * Math.PI) * 1.3);
          frequencies.push(Math.min(0.95, scaled));
        } else {
          // Gentle ambient resting pulse
          const idle = Math.sin(phaseRef.current * 0.8 + i * 0.2) * 0.06 + 0.1;
          frequencies.push(idle);
        }
      }

      // Update peaks with gravity
      for (let i = 0; i < barCount; i++) {
        const val = frequencies[i];
        if (val > peaksRef.current[i]) {
          peaksRef.current[i] = val;
        } else {
          peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 0.015);
        }
      }

      // MODE 1: STUDIO EQUALIZER BARS
      if (mode === 'bars') {
        const barWidth = (width - (barCount - 1) * 3) / barCount;
        for (let i = 0; i < barCount; i++) {
          const val = frequencies[i];
          const barH = Math.max(4, val * (height - 18));
          const x = i * (barWidth + 3);
          const y = height - barH;

          // Gradient: Cyan -> Purple -> Rose
          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.55, '#a855f7');
          grad.addColorStop(1, '#f43f5e');

          ctx.fillStyle = grad;
          if (isFxActive && isPlaying) {
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 8 * glowIntensity;
          } else {
            ctx.shadowBlur = 0;
          }

          // Draw rounded pill bar
          ctx.beginPath();
          const r = Math.min(barWidth / 2, 2.5);
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + barWidth - r, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
          ctx.lineTo(x + barWidth, height);
          ctx.lineTo(x, height);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();

          // Draw peak marker cap
          const peakY = height - peaksRef.current[i] * (height - 18) - 2;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x, Math.max(2, peakY), barWidth, 2);
        }
        ctx.shadowBlur = 0;
      }

      // MODE 2: CYBER SINE WAVES
      else if (mode === 'waves') {
        const waveCount = 3;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          const alpha = 0.35 + w * 0.25;
          const color = w === 0 ? `rgba(6, 182, 212, ${alpha})` : w === 1 ? `rgba(168, 85, 247, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5 - w * 0.5;

          if (isFxActive && isPlaying) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10 * glowIntensity;
          }

          const centerY = height / 2;
          const amp = isPlaying ? (22 - w * 5) : 6;
          const freqMultiplier = 0.018 + w * 0.008;

          for (let x = 0; x <= width; x += 4) {
            const y = centerY + Math.sin(x * freqMultiplier + phaseRef.current * (1 + w * 0.4)) * amp * Math.sin((x / width) * Math.PI);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // MODE 3: QUANTUM CIRCULAR ORBIT
      else if (mode === 'orbit') {
        const centerX = width / 2;
        const centerY = height / 2;
        const avgEnergy = frequencies.reduce((a, b) => a + b, 0) / barCount;
        const coreRadius = (isPlaying ? 14 + avgEnergy * 16 : 14);

        // Center pulsating core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, coreRadius);
        coreGrad.addColorStop(0, '#38bdf8');
        coreGrad.addColorStop(0.6, '#a855f7');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting particles
        particlesRef.current.forEach((p) => {
          p.angle += p.speed * (isPlaying ? 2.5 : 1);
          const currentRad = p.radius + (isPlaying ? avgEnergy * 20 : 0);
          const px = centerX + Math.cos(p.angle) * currentRad * 1.8;
          const py = centerY + Math.sin(p.angle) * currentRad * 0.7;

          ctx.fillStyle = isPlaying ? '#a855f7' : '#64748b';
          if (isFxActive && isPlaying) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
          }
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Outer wave rings
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 55 + avgEnergy * 18, 26 + avgEnergy * 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, mode, isFxActive, glowIntensity, audioRef]);

  return (
    <div className="w-full rounded-2xl bg-slate-950/90 border border-purple-500/25 p-3 space-y-2.5 shadow-xl backdrop-blur-md">
      {/* Header Info & Mode Switcher */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-[11px]">ویژوالایزر صوتی زنده</span>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
            isPlaying ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-500'
          }`}>
            {isPlaying ? 'ACTIVE 320kbps' : 'IDLE'}
          </span>
        </div>

        {/* Visualizer Mode Toggles */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('bars')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mode === 'bars' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="اکولایزر میله‌ای ۳۲ بانده استودیو"
          >
            <Activity className="w-3 h-3" />
            <span className="hidden sm:inline">اکولایزر</span>
          </button>

          <button
            onClick={() => setMode('waves')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mode === 'waves' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="امواج سینوسی نئون سایبرنتیک"
          >
            <Waves className="w-3 h-3" />
            <span className="hidden sm:inline">امواج</span>
          </button>

          <button
            onClick={() => setMode('orbit')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              mode === 'orbit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="مدار کوانتومی و ذرات معلق"
          >
            <Orbit className="w-3 h-3" />
            <span className="hidden sm:inline">کوانتوم</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[90px] rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '90px' }}
        />

        {/* Watermark/Status Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-md">
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span>پخش آهنگ را شروع کنید تا ویژوالایزر فعال شود</span>
            </span>
          </div>
        )}
      </div>

      {/* Footer FX Controls */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 px-1">
        <span className="font-mono text-cyan-400/80 truncate max-w-[180px]">
          {genre} • 44.1kHz Hi-Res
        </span>

        <button
          onClick={() => setIsFxActive(!isFxActive)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
            isFxActive
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="افکت نئونی درخشنده و هاله طیفی"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>{isFxActive ? 'افکت نئونی فعال' : 'افکت نئونی خاموش'}</span>
        </button>
      </div>
    </div>
  );
};
