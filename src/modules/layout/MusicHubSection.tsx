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
  Radio, 
  Sparkles,
  Download,
  Info,
  FileText,
  X,
  Compass,
  RefreshCw,
  Share2
} from 'lucide-react';
import { MusicTrack } from '../../types/admin';
import { INITIAL_MUSIC_TRACKS, ADDITIONAL_ONLINE_TRACKS } from '../../data/adminData';
import { AudioVisualizer } from '../music/AudioVisualizer';

interface MusicHubSectionProps {
  onShowToast?: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const MusicHubSection: React.FC<MusicHubSectionProps> = ({ onShowToast }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>(INITIAL_MUSIC_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Online ingestion loading state
  const [isFetchingOnline, setIsFetchingOnline] = useState(false);

  // Lyrics / Track Info Modal state
  const [selectedTrackForDetails, setSelectedTrackForDetails] = useState<MusicTrack | null>(null);

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
        console.warn('Playback notice:', err);
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

  const handleFetchMoreOnlineTracks = () => {
    setIsFetchingOnline(true);
    setTimeout(() => {
      // Append unique online tracks
      setTracks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newOnes = ADDITIONAL_ONLINE_TRACKS.filter(t => !existingIds.has(t.id));
        if (newOnes.length === 0) {
          // Generate an extra synthwave track
          const extra: MusicTrack = {
            id: `track-online-${Date.now()}`,
            title: 'Starlight Cyber Express',
            artist: 'Gunship & The Midnight',
            genre: 'Synthwave / Retrowave',
            album: 'Galactic Highway',
            year: 2024,
            duration: '03:40',
            audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
            coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            fileSizeMb: 5.3,
            downloadsCount: 1120,
            isSentToTelegram: false,
            createdAt: new Date().toISOString(),
            description: 'هارمونی‌های الکترونیک با طنین آنالوگ برای لذت بردن از وب‌گردی پرسرعت و شبانه.',
            lyrics: '[Instrumental Odyssey]\nEchoes in the electric midnight sky.\nSynth leads carrying your mind across lightyears.',
            lyricsFa: '[ادیسه بی‌کلام]\nطنین در آسمان نیمه‌شب الکتریکی.\nسینث‌سایزر پیشرو ذهن شما را در طول سال‌های نوری به پرواز درمی‌آورد.'
          };
          return [...prev, extra];
        }
        return [...prev, ...newOnes];
      });

      setIsFetchingOnline(false);
      if (onShowToast) {
        onShowToast({
          title: 'آهنگ‌های جدید آنلاین دریافت شد 🎵',
          description: 'قطعات جدید بین‌المللی با کیفیت ۳۲۰ به لیست پخش افزوده شدند.',
          type: 'success'
        });
      }
    }, 850);
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
              <span>ایستگاه رادیویی و موسیقی تمرکز اختصاصی</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              موزیک‌پلیر آنلاین قطعات خارجی و آرامش‌بخش
            </h2>
            <p className="text-xs text-slate-400">
              پخش آنلاین و بی‌وقفه موسیقی‌های Lo-Fi، Synthwave و Ambient با کیفیت بالا، مشاهده توضیحات هنری و متن کامل ترانه (Lyrics).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleFetchMoreOnlineTracks}
              disabled={isFetchingOnline}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="بارگذاری قطعات جدید خارجی از منابع آنلاین"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingOnline ? 'animate-spin text-cyan-300' : ''}`} />
              <span>{isFetchingOnline ? 'در حال دریافت آنلاین...' : 'دریافت آهنگ‌های جدید آنلاین'}</span>
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          {/* Active Track Highlight Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-5 text-center">
            <div className="relative group cursor-pointer" onClick={() => setSelectedTrackForDetails(currentTrack)}>
              <img
                src={currentTrack?.coverUrl}
                alt={currentTrack?.title}
                referrerPolicy="no-referrer"
                className={`w-44 h-44 md:w-52 md:h-52 rounded-3xl object-cover border-2 border-purple-500/40 shadow-2xl shadow-purple-950/50 transition-transform duration-500 ${
                  isPlaying ? 'scale-105 shadow-purple-500/20' : 'scale-100'
                }`}
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl backdrop-blur-sm transition-all transform hover:scale-110 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>

            <div className="space-y-1 w-full text-center">
              <h3 className="text-base font-bold text-white truncate max-w-xs mx-auto">{currentTrack?.title}</h3>
              <p className="text-xs text-purple-300 font-medium">{currentTrack?.artist}</p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                <span>{currentTrack?.genre}</span>
                <span>•</span>
                <span>{currentTrack?.duration}</span>
                <span>•</span>
                <span>{currentTrack?.year || 2024}</span>
              </div>
            </div>

            {/* Quick Actions: Lyrics & Details */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTrackForDetails(currentTrack)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>مشاهده متن ترانه و توضیحات (Lyrics)</span>
              </button>
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
              </div>

            </div>

            {/* Real-time Interactive Audio Visualizer */}
            <div className="w-full pt-1">
              <AudioVisualizer
                isPlaying={isPlaying}
                audioRef={audioRef}
                trackTitle={currentTrack?.title}
                genre={currentTrack?.genre}
              />
            </div>

          </div>

          {/* Tracks Playlist Grid */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <span>لیست قطعات منتخب</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                320kbps Hi-Res MP3
              </span>
            </div>

            <div className="space-y-2 max-h-[580px] lg:max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
              {tracks.map((track, idx) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-950/50 border-purple-500/50 shadow-lg shadow-purple-950/40'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 text-right">
                        <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {track.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{track.artist}</span>
                          <span>•</span>
                          <span className="text-purple-400">{track.genre}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForDetails(track);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                        title="مشاهده متن ترانه و توضیحات"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={track.audioUrl}
                        download={`${track.title}.mp3`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                        title="دانلود مستقیم ترک صوتی"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-left">
                        {track.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Track Details & Lyrics Modal */}
      {selectedTrackForDetails && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedTrackForDetails(null)}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
            <div
              className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/30 p-5 sm:p-6 shadow-2xl flex flex-col gap-5 overflow-hidden text-right my-4 sm:my-8"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTrackForDetails.coverUrl}
                  alt={selectedTrackForDetails.title}
                  className="w-14 h-14 rounded-2xl object-cover border border-purple-500/40 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedTrackForDetails.title}</h3>
                  <p className="text-xs text-purple-300">{selectedTrackForDetails.artist} • {selectedTrackForDetails.album || 'تک‌آهنگ'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrackForDetails(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="overflow-y-auto space-y-5 pr-1 text-xs text-slate-300 leading-relaxed no-scrollbar">
              
              {/* Technical & Artistic Overview */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Info className="w-4 h-4" />
                  <span>درباره اثر و اتمسفر صوتی</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {selectedTrackForDetails.description || 'قطعه‌ای برگزیده با ترکیب سینث‌سایزرهای آنالوگ و تمپوی بهینه جهت تمرکز ذهنی و آرامش پایدار.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">سبک:</span>
                    <span className="text-white font-bold">{selectedTrackForDetails.genre}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">مدت زمان:</span>
                    <span className="text-white font-bold">{selectedTrackForDetails.duration}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">سال انتشار:</span>
                    <span className="text-white font-bold">{selectedTrackForDetails.year || 2024}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">کیفیت:</span>
                    <span className="text-emerald-400 font-bold">320kbps MP3</span>
                  </div>
                </div>
              </div>

              {/* Lyrics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Lyrics */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-left dir-ltr">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <FileText className="w-4 h-4" />
                    <span>Original Lyrics (English)</span>
                  </div>
                  <pre className="font-sans text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedTrackForDetails.lyrics || 'No explicit vocal lyrics available for this instrumental track.'}
                  </pre>
                </div>

                {/* Persian Translation / Meaning */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-right">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>ترجمه و مفهوم شعر به فارسی</span>
                  </div>
                  <pre className="font-sans text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedTrackForDetails.lyricsFa || 'این قطعه بدون کلام بوده و بر هارمونی‌های عمیق صوتی تمرکز دارد.'}
                  </pre>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const idx = tracks.findIndex(t => t.id === selectedTrackForDetails.id);
                  if (idx !== -1) handleSelectTrack(idx);
                  setSelectedTrackForDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>پخش فوری این آهنگ</span>
              </button>

              <button
                onClick={() => setSelectedTrackForDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                بستن
              </button>
            </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};
