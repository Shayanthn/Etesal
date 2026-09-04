import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Globe, 
  Flame, 
  Clock, 
  ChevronLeft, 
  Filter, 
  Search, 
  Sparkles, 
  ShieldAlert,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { NewsItem } from '../../types';

interface TechNewsBoxProps {
  news: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
  onNavigateToNewsHub?: () => void;
}

export const TechNewsBox: React.FC<TechNewsBoxProps> = ({ news, onSelectNews, onNavigateToNewsHub }) => {
  const [filterType, setFilterType] = useState<'all' | 'local' | 'international'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      // Type filter (Iran vs World)
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSummary = item.summary.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSummary && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [news, filterType, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(news.map(n => n.category));
    return ['all', ...Array.from(cats)];
  }, [news]);

  const localCount = news.filter(n => n.type === 'local').length;
  const intlCount = news.filter(n => n.type === 'international').length;

  return (
    <div className="flex flex-col h-full rounded-3xl bg-slate-900/90 border border-purple-500/20 p-5 md:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute -top-16 -left-16 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 pb-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>اخبار فناوری و شبکه</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-normal">
                پایش لحظه‌ای زیرساخت اینترنت ایران و تحولات تکنولوژی جهان
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToNewsHub && (
              <button
                onClick={onNavigateToNewsHub}
                className="flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold"
              >
                <span>مشاهده رصدخانه کامل</span>
                <ChevronLeft className="w-3.5 h-3.5 text-purple-400" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-xl">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>پایش آنلاین</span>
            </div>
          </div>
        </div>

        {/* Scope Tabs: All / Iran / World */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/60 border border-slate-800">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            همه اخبار ({news.length})
          </button>
          <button
            onClick={() => setFilterType('local')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterType === 'local'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🇮🇷 ایران</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-emerald-300">
              {localCount}
            </span>
          </button>
          <button
            onClick={() => setFilterType('international')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterType === 'international'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌐 جهان</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300">
              {intlCount}
            </span>
          </button>
        </div>

        {/* Quick Search & Category Filter Pills */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجو در اخبار تکنولوژی و پروتکل‌ها..."
              className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">تمام دسته‌ها</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* News List Container */}
      <div className="relative z-10 flex-1 overflow-y-auto space-y-2.5 mt-3 pr-0.5 pl-1 max-h-[380px] sm:max-h-[420px] lg:max-h-[460px] custom-scrollbar">
        {filteredNews.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs text-slate-400">خبری مطابق با فیلتر شما یافت نشد.</p>
            <button
              onClick={() => { setFilterType('all'); setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-[11px] text-purple-400 hover:underline cursor-pointer"
            >
              پاک‌سازی فیلترها
            </button>
          </div>
        ) : (
          filteredNews.map((item, idx) => {
            const isLocal = item.type === 'local';
            return (
              <article
                key={item.id}
                onClick={() => onSelectNews(item)}
                className="group relative p-3 sm:p-3.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-200 cursor-pointer text-right flex flex-col justify-between gap-2"
              >
                {/* Top Item Meta */}
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Country/Scope Pill */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      isLocal 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    }`}>
                      {isLocal ? '🇮🇷 ایران' : '🌐 جهان'}
                    </span>

                    {/* Category */}
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] border border-purple-500/20">
                      {item.category}
                    </span>

                    {/* Urgent badge */}
                    {item.isImportant && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30">
                        <Flame className="w-2.5 h-2.5 text-rose-400" />
                        فوری
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    {item.timeAgo}
                  </span>
                </div>

                {/* News Title */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-relaxed">
                  {item.title}
                </h3>

                {/* News Summary Snippet */}
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-normal">
                  {item.summary}
                </p>

                {/* Bottom Footer: Source, Tags & Read Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span className="text-slate-400 truncate max-w-[140px]">
                    منبع: <strong className="text-slate-300 font-normal">{item.source}</strong>
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-purple-400 group-hover:text-purple-300 font-bold">
                    <span>مشاهده خبر</span>
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>پوشش تازه‌ترین تحولات شبکه، ECH و امنیت ارتباطات</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">۱۰/۱۰ به‌روز</span>
      </div>
    </div>
  );
};
