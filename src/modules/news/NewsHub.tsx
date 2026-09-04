import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  Search, 
  Clock, 
  Flame, 
  ExternalLink, 
  Share2, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Globe2, 
  Tag, 
  ArrowLeft,
  Check,
  Radio,
  Eye
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../../types/news';
import { SAMPLE_NEWS_ARTICLES } from '../../data/newsData';

interface NewsHubProps {
  onSelectArticle: (article: NewsArticle) => void;
  onBackToHome?: () => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const NewsHub: React.FC<NewsHubProps> = ({ onSelectArticle, onBackToHome, onShowToast }) => {
  const [articles] = useState<NewsArticle[]>(SAMPLE_NEWS_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Time formatter helper (Relative Persian time)
  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} دقیقه قبل`;
    if (diffHours < 24) return `${diffHours} ساعت قبل`;
    return `${diffDays} روز قبل`;
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.tags.some(t => t.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const breakingNews = useMemo(() => {
    return articles.find(a => a.isBreaking);
  }, [articles]);

  const handleShare = (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/news/${article.slug}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedSlug(article.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
      onShowToast({
        title: 'لینک خبر کپی شد 📋',
        description: 'آدرس مستقیم مقاله در کلیپ‌بورد کپی شد.',
        type: 'success'
      });
    }
  };

  return (
    <div className="space-y-6 text-right py-4 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Top Breadcrumb / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">رصدخانه اخبار فناوری، امنیت و وضعیت شبکه</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            پوشش زنده و تحلیل اختلالات زیرساخت، پروتکل‌های امنیتی، اخبار لینوکس و دنیای ارتباطات ایران و جهان.
          </p>
        </div>

        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>بازگشت به صفحه اصلی</span>
          </button>
        )}
      </div>

      {/* Breaking News Banner (If Available) */}
      {breakingNews && (
        <div 
          onClick={() => onSelectArticle(breakingNews)}
          className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900 border border-red-500/30 hover:border-red-500/60 shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  <span>خبر فوری شبکه</span>
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-red-400" />
                  {formatTimeAgo(breakingNews.publishedAt)}
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-white group-hover:text-red-200 transition-colors leading-relaxed">
                {breakingNews.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {breakingNews.summary}
              </p>
            </div>

            <button className="self-end md:self-center shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all">
              <span>مطالعه تحلیل کامل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در سرتیترها، موضوعات یا تگ‌ها (مثال: Reality، فیبر نوری، لینوکس)..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            همه اخبار ({articles.length})
          </button>

          <button
            onClick={() => setSelectedCategory('network_censorship')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'network_censorship'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>اختلالات و پایش شبکه</span>
          </button>

          <button
            onClick={() => setSelectedCategory('security_privacy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'security_privacy'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>امنیت و حریم خصوصی</span>
          </button>

          <button
            onClick={() => setSelectedCategory('tech_world')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'tech_world'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>دنیای لینوکس و سیستم‌ها</span>
          </button>

          <button
            onClick={() => setSelectedCategory('ai_dev')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ai_dev'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>هوش مصنوعی و ابزارها</span>
          </button>
        </div>

      </div>

      {/* News Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">خبری با عبارت جستجوی شما یافت نشد</p>
          <p className="text-xs text-slate-500">می‌توانید کلمات کلیدی دیگری را امتحان کنید یا فیلتر دسته‌بندی را تغییر دهید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="flex flex-col justify-between p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-lg"
            >
              <div className="space-y-3">
                
                {/* Image Cover */}
                <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-slate-200">
                    {article.categoryLabelFa}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500">
                    <Eye className="w-3 h-3" />
                    {article.viewsCount || 500} بازدید
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-relaxed line-clamp-2">
                  {article.title}
                </h2>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>

              </div>

              {/* Footer info: Source & Tags */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Globe2 className="w-3 h-3 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{article.sourceName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShare(e, article)}
                    title="کپی لینک مستقیم خبر"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-900/60 text-slate-400 hover:text-purple-300 transition-colors"
                  >
                    {copiedSlug === article.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                    <span>مطالعه</span>
                    <ArrowLeft className="w-3 h-3" />
                  </span>
                </div>

              </div>

            </article>
          ))}
        </div>
      )}

    </div>
  );
};
