import React from 'react';
import { 
  Bell, 
  Flame, 
  ChevronLeft, 
  ExternalLink, 
  Clock, 
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { NewsItem } from '../../types';

interface HeroNewsCardProps {
  news: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
}

export const HeroNewsCard: React.FC<HeroNewsCardProps> = ({ news, onSelectNews }) => {
  const topNews = news[0];

  if (!topNews) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-900/60 border border-purple-800/30 p-5 md:p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Badge & Title */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black animate-pulse">
              <Flame className="w-3 h-3 text-rose-400" />
              خبر فوری
            </span>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {topNews.timeAgo}
            </span>
            <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              {topNews.category}
            </span>
          </div>

          <h3 
            onClick={() => onSelectNews(topNews)}
            className="text-sm md:text-base font-bold text-white hover:text-purple-300 transition-colors cursor-pointer line-clamp-1"
          >
            {topNews.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
            {topNews.summary}
          </p>
        </div>

        {/* Right Side: Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectNews(topNews)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer group"
          >
            <span>مطالعه کامل خبر</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
