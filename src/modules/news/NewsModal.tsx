import React from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Tag, 
  Share2, 
  Check, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { NewsItem } from '../../types';

interface NewsModalProps {
  news: NewsItem | null;
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ news, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!news) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
              {news.category}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {news.timeAgo}
            </span>
            <span className="text-[11px] text-slate-500">• {news.readTime}</span>
          </div>

          <h2 className="text-lg md:text-xl font-black text-white leading-snug">
            {news.title}
          </h2>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>منبع: <strong className="text-slate-200">{news.source}</strong></span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'لینک کپی شد' : 'اشتراک‌گذاری'}</span>
            </button>
          </div>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          {news.content.map((paragraph, idx) => (
            <p key={idx} className="bg-slate-800/30 p-3.5 rounded-2xl border border-slate-800/60">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          {news.tags.map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-400 font-mono">
              #{tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
};
