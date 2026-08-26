import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  SkipForward, 
  SkipBack, 
  Send, 
  Radio, 
  ExternalLink,
  Sparkles,
  Download
} from 'lucide-react';
import { MusicTrack } from '../../types/admin';
import { INITIAL_MUSIC_TRACKS } from '../../data/adminData';

interface MusicHubSectionProps {
  onShowToast?: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const MusicHubSection: React.FC<MusicHubSectionProps> = ({ onShowToast }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>(INITIAL_MUSIC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback blocked:', err);
      });
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.warn(err));
      }
    }, 100);
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    handleSelectTrack(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    handleSelectTrack(prevIdx);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendToTelegram = (track: MusicTrack) => {
    if (onShowToast) {
      onShowToast({
        title: 'ارسال به کانال تلگرام 🚀',
        description: `ترک "${track.title}" با کاور و تگ‌های اختصاصی به کانال @vpnbuying ارسال شد.`,
        type: 'success'
      });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8" id="music-hub">
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleNext}
      />

      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-purple-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-purple-400" />
              <span>ایستگاه رادیویی و موسیقی آرامش / تمرکز اتصال</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              موزیک‌پلیر ضد فیلتر و هاب ربات تلگرام
            </h2>
            <p className="text-xs text-slate-400">
              پخش آنلاین موسیقی‌های Lo-Fi، Synthwave و بی‌کلام برای زمان کار با اینترنت و فیلترشکن، با قابلیت انتشار مستقیم در تلگرام.
            </p>
          </div>

          <a
            href="https://t.me/vpnbuying"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-md self-start md:self-auto"
          >
            <Send className="w-4 h-4" />
            <span>عضویت در کانال موزیک تلگرام</span>
          </a>
        </div>

        {/* Player Body */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          {/* Active Track Highlight Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-5 text-center">
            <div className="relative group">
              <img
                src={currentTrack?.coverUrl}
                alt={currentTrack?.title}
                referrerPolicy="no-referrer"
                className={`w-44 h-44 md:w-52 md:h-52 rounded-3xl object-cover border-2 border-purple-500/40 shadow-2xl shadow-purple-950/50 transition-transform duration-500 ${
                  isPlaying ? 'scale-105 shadow-purple-500/20' : 'scale-100'
                }`}
              />
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-all transform hover:scale-110 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white truncate max-w-xs">{currentTrack?.title}</h3>
              <p className="text-xs text-purple-300 font-medium">{currentTrack?.artist}</p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                <span>{currentTrack?.genre}</span>
                <span>•</span>
                <span>{currentTrack?.duration}</span>
                <span>•</span>
                <span>{currentTrack?.fileSizeMb} MB</span>
              </div>
            </div>

            {/* Seek bar */}
            <div className="w-full space-y-1.5 pt-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Player Controls & Volume Slider */}
            <div className="w-full flex items-center justify-between gap-3 pt-2">
              
              {/* Skip Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
                  title="آهنگ قبلی"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTogglePlay}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all shadow-md"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
                  title="آهنگ بعدی"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-purple-400" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  title={`میزان صدا: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
                <span className="text-[10px] font-mono text-slate-400 w-7 text-left">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

            </div>

            {/* Direct Telegram Push Button */}
            <button
              onClick={() => handleSendToTelegram(currentTrack)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ارسال مستقیم این ترک به کانال تلگرام</span>
            </button>

          </div>

          {/* Playlist Track List */}
          <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 text-right">لیست ترک‌های صوتی منتخب:</h4>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {tracks.map((t, idx) => {
                  const isCurrent = currentTrackIndex === idx;

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTrack(idx)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-950/50 border-purple-500/50 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative shrink-0">
                          <img
                            src={t.coverUrl}
                            alt={t.title}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover border border-slate-800"
                          />
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-purple-900/60 rounded-xl flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5 overflow-hidden text-right">
                          <div className="text-xs font-bold truncate flex items-center gap-2">
                            <span>{t.title}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-600 text-[9px] font-mono text-white">
                                در حال پخش
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-slate-400">{t.duration}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendToTelegram(t);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                          title="ارسال به کانال تلگرام"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs text-purple-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>پشتیبانی از استخراج خودکار تگ ID3، مدت زمان و کاور در پنل مدیریت</span>
              </span>
              <span className="text-[10px] font-mono bg-purple-900/50 px-2 py-0.5 rounded-md">
                Bitrate: 320kbps
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
