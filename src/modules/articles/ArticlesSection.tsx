import React from 'react';
import { 
  BookOpen, 
  Clock, 
  ChevronLeft, 
  Cpu, 
  Network, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Article } from '../../types';

interface ArticlesSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  articles,
  onSelectArticle
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Network': return <Network className="w-5 h-5 text-cyan-400" />;
      default: return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section id="articles" className="py-12 border-t border-slate-800/80">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">پایگاه دانش و مقالات تخصصی</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                آموزش‌های کاربردی
              </span>
            </div>
            <p className="text-xs text-slate-400">
              بررسی‌های فنی، راهنماهای پیکربندی فرگمنت و ترفندهای ارتقای سرعت در شبکه‌های دارای اختلال
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {articles.map(art => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between gap-4 cursor-pointer group shadow-lg shadow-black/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform">
                    {getIcon(art.iconName)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {art.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-[11px] font-medium text-slate-300">{art.author.name}</span>
                <span className="flex items-center gap-1 text-purple-400 font-bold group-hover:-translate-x-1 transition-transform">
                  <span>مطالعه مقاله</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
