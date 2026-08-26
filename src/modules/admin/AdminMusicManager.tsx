import React, { useState, useRef } from 'react';
import { 
  Music, 
  Plus, 
  Trash2, 
  Edit3, 
  Send, 
  Play, 
  Pause, 
  UploadCloud, 
  Sparkles, 
  Check, 
  X, 
  FileAudio, 
  Image as ImageIcon,
  Layers,
  Radio
} from 'lucide-react';
import { MusicTrack } from '../../types/admin';
import { extractAudioMetadata, ExtractedAudioMeta } from '../../utils/audioMetadata';

interface AdminMusicManagerProps {
  musicList: MusicTrack[];
  setMusicList: React.Dispatch<React.SetStateAction<MusicTrack[]>>;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onPushToTelegram: (trackId: string) => void;
}

export const AdminMusicManager: React.FC<AdminMusicManagerProps> = ({
  musicList,
  setMusicList,
  onShowToast,
  onPushToTelegram
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('03:30');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80');
  const [fileSizeMb, setFileSizeMb] = useState(5.4);
  const [isSentToTelegram, setIsSentToTelegram] = useState(false);

  const handleOpenAdd = () => {
    setEditingTrack(null);
    setTitle('');
    setArtist('');
    setGenre('Synthwave / Focus');
    setDuration('03:30');
    setAudioUrl('');
    setCoverUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80');
    setFileSizeMb(5.2);
    setIsSentToTelegram(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (track: MusicTrack) => {
    setEditingTrack(track);
    setTitle(track.title);
    setArtist(track.artist);
    setGenre(track.genre);
    setDuration(track.duration);
    setAudioUrl(track.audioUrl);
    setCoverUrl(track.coverUrl);
    setFileSizeMb(track.fileSizeMb);
    setIsSentToTelegram(track.isSentToTelegram);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    onShowToast({
      title: 'در حال پردازش فایل صوتی 🎧',
      description: 'در حال استخراج متادیتا، تگ‌های ID3، کاور، نام هنرمند و مدت زمان...',
      type: 'info'
    });

    try {
      const meta = await extractAudioMetadata(file);
      setTitle(meta.title);
      setArtist(meta.artist);
      setGenre(meta.genre || 'Electronic / Focus');
      setDuration(meta.durationFormatted);
      setFileSizeMb(meta.fileSizeMb);
      setAudioUrl(meta.fileDataUrl);
      if (meta.coverUrl) {
        setCoverUrl(meta.coverUrl);
      }

      onShowToast({
        title: 'استخراج متادیتا کامل شد ✨',
        description: `تگ‌های موزیک "${meta.title}" با موفقیت شناسایی و اعمال شد.`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error extracting audio metadata:', err);
      onShowToast({
        title: 'خطا در خواندن تگ‌ها',
        description: 'امکان خواندن کامل تگ‌های فایل نبود؛ می‌توانید مقادیر را دستی وارد نمایید.',
        type: 'warning'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTogglePlay = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      audioPlayerRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = track.audioUrl;
        audioPlayerRef.current.play().catch(e => console.warn('Playback error:', e));
        setPlayingTrackId(track.id);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (playingTrackId === id) {
      audioPlayerRef.current?.pause();
      setPlayingTrackId(null);
    }
    setMusicList(prev => prev.filter(t => t.id !== id));
    onShowToast({
      title: 'ترک صوتی حذف شد 🗑️',
      description: 'موزیک از آرشیو سایت حذف گردید.',
      type: 'info'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      onShowToast({
        title: 'خطا',
        description: 'لطفاً نام آهنگ و هنرمند را مشخص کنید.',
        type: 'error'
      });
      return;
    }

    if (editingTrack) {
      // Update
      setMusicList(prev => prev.map(t => {
        if (t.id === editingTrack.id) {
          return {
            ...t,
            title: title.trim(),
            artist: artist.trim(),
            genre: genre.trim() || 'Electronic',
            duration: duration || '03:30',
            audioUrl: audioUrl.trim() || t.audioUrl,
            coverUrl: coverUrl.trim() || t.coverUrl,
            fileSizeMb: Number(fileSizeMb) || t.fileSizeMb,
            isSentToTelegram
          };
        }
        return t;
      }));

      onShowToast({
        title: 'موزیک ویرایش شد 🎵',
        description: `اطلاعات ترک "${title}" با موفقیت بروزرسانی شد.`,
        type: 'success'
      });
    } else {
      // Create
      const newTrack: MusicTrack = {
        id: 'track-' + Date.now(),
        title: title.trim(),
        artist: artist.trim(),
        genre: genre.trim() || 'Electronic / Focus',
        duration: duration || '03:30',
        audioUrl: audioUrl.trim() || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
        fileSizeMb: Number(fileSizeMb) || 5.2,
        downloadsCount: 0,
        isSentToTelegram: false,
        createdAt: new Date().toISOString()
      };

      setMusicList(prev => [newTrack, ...prev]);
      onShowToast({
        title: 'آهنگ جدید ثبت شد 🎧',
        description: `ترک "${newTrack.title}" آماده پخش و انتشار مستقیم در کانال تلگرام است.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Hidden Audio Player instance */}
      <audio ref={audioPlayerRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span>هاب مدیریت و توزیع موزیک ربات و کانال تلگرام ({musicList.length} ترک صوتی)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            آپلود موزیک، استخراج خودکار تگ‌های ID3 و کاور، پیش‌نمایش پخش و انتشار مستقیم ۱-کلیک در تلگرام.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ آپلود و انتشار موزیک جدید</span>
        </button>
      </div>

      {/* Music Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {musicList.map((track) => {
          const isPlaying = playingTrackId === track.id;

          return (
            <div 
              key={track.id} 
              className={`p-5 rounded-3xl bg-slate-900/80 border transition-all flex flex-col justify-between space-y-4 ${
                isPlaying ? 'border-purple-500/60 bg-slate-900 shadow-lg shadow-purple-950/40' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0 group">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shadow-md"
                  />
                  <button
                    onClick={() => handleTogglePlay(track)}
                    className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>

                <div className="space-y-1 overflow-hidden flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                  <div className="flex items-center gap-2 text-[10px] text-purple-400 font-mono">
                    <span>{track.genre}</span>
                    <span>•</span>
                    <span>{track.duration}</span>
                    <span>•</span>
                    <span>{track.fileSizeMb}MB</span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  track.isSentToTelegram 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                }`}>
                  {track.isSentToTelegram ? 'منتشر در کانال تلگرام ✅' : 'آماده ارسال'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPushToTelegram(track.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                    title="ارسال مستقیم به کانال تلگرام"
                  >
                    <Send className="w-3 h-3" />
                    <span>انتشار در کانال</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(track)}
                    className="p-1.5 rounded-xl bg-slate-950 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors"
                    title="ویرایش متادیتا"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(track.id)}
                    className="p-1.5 rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                    title="حذف آهنگ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Music Modal with File & Metadata Auto-Extractor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/40 p-6 shadow-2xl space-y-4 text-right max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                <span>{editingTrack ? 'ویرایش مشخصات ترک صوتی' : 'آپلود و انتشار موزیک جدید'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart File Upload Dropzone */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border-2 border-dashed border-purple-500/40 text-center space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileAudio className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
              <div>
                <p className="text-xs font-bold text-white">فایل صوتی خود را انتخاب کنید</p>
                <p className="text-[10px] text-purple-300 mt-0.5">
                  سیستم به صورت خودکار تگ‌های ID3، کاور، نام خواننده و تایم آهنگ را استخراج می‌کند.
                </p>
              </div>
              <button
                type="button"
                disabled={isExtracting}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isExtracting ? 'در حال استخراج تگ‌ها...' : 'انتخاب فایل از حافظه دستگاه'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">عنوان آهنگ (Title):</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Cyberpunk Night Drive"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">هنرمند / تولیدکننده (Artist):</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Kavinsky & The Midnight"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">سبک موسیقی (Genre):</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Synthwave / Lo-Fi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">مدت زمان (Duration):</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="03:45"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">حجم فایل (MB):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fileSizeMb}
                    onChange={(e) => setFileSizeMb(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Cover URL & Preview */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">لینک یا داده تصویر کاور (Cover URL):</label>
                <div className="flex items-center gap-3">
                  <img
                    src={coverUrl}
                    alt="پیش‌نمایش کاور"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Audio URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">لینک مستقیم استریم یا Blob صوتی:</label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://cdn.example.com/audio.mp3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg"
                >
                  {editingTrack ? 'ذخیره تغییرات موزیک' : 'ثبت و انتشار موزیک'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
