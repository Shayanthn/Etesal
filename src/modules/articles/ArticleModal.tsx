import React from 'react';
import { 
  X, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Share2, 
  Check, 
  UserCheck, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Article } from '../../types';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!article) return null;

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
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
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
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              {article.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              ضریب بازدهی: {article.successRate}٪
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
            {article.title}
          </h2>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                {article.author.avatar}
              </div>
              <div>
                <span className="text-slate-200 font-bold">{article.author.name}</span>
                <span className="text-slate-500 text-[11px] block">{article.author.role}</span>
              </div>
            </div>

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
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed mb-6">
          {article.fullContent?.map((paragraph, idx) => (
            <p key={idx} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800/60">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Key Takeaways Box */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30 space-y-2 mb-6">
            <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>نکات کلیدی این راهنما:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {article.keyTakeaways.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          {article.tags.map((tag, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-400 font-mono">
              #{tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
};
