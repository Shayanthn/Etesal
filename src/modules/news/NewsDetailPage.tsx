import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Globe, 
  ExternalLink, 
  Share2, 
  Check, 
  Tag, 
  Eye, 
  Send,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { SAMPLE_NEWS_ARTICLES } from '../../data/newsData';

interface NewsDetailPageProps {
  article: NewsArticle;
  onBackToNews: () => void;
  onSelectOtherArticle: (article: NewsArticle) => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  article,
  onBackToNews,
  onSelectOtherArticle,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': article.title,
    'description': article.summary,
    'image': [article.imageUrl],
    'datePublished': article.publishedAt,
    'dateModified': article.publishedAt,
    'author': {
      '@type': 'Person',
      'name': article.author
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'اتصال | مرجع اینترنت آزاد',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://etesal.aetherai.ir/icon.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${typeof window !== 'undefined' ? window.location.origin : 'https://etesal.aetherai.ir'}/news/${article.slug}`
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/news/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowToast({
        title: 'لینک خبر کپی شد 📋',
        description: 'آدرس اینترنتی این گزارش در کلیپ‌بورد کپی شد.',
        type: 'success'
      });
    }
  };

  const handleShareTelegram = () => {
    const url = `${window.location.origin}/news/${article.slug}`;
    const text = encodeURIComponent(`📰 ${article.title}\n\n${article.summary}\n\n`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  const relatedArticles = SAMPLE_NEWS_ARTICLES.filter(
    (a) => a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t)))
  ).slice(0, 3);

  return (
    <div className="space-y-8 text-right py-4 max-w-4xl mx-auto animate-in fade-in duration-300">
      <Helmet>
        <title>{(article as any).meta_title || article.title} | رصدخانه اخبار اتصال</title>
        <meta name="description" content={(article as any).meta_description || article.summary} />
        <meta property="og:title" content={(article as any).meta_title || article.title} />
        <meta property="og:description" content={(article as any).meta_description || article.summary} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : 'https://etesal.aetherai.ir'}/news/${article.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToNews}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>بازگشت به آرشیو اخبار</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareTelegram}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>اشتراک در تلگرام</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی لینک'}</span>
          </button>
        </div>
      </div>

      {/* Article Container */}
      <article className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        
        {/* Category & Date badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
            {article.categoryLabelFa}
          </span>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>زمان مطالعه: {article.readTimeMinutes} دقیقه</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{new Date(article.publishedAt).toLocaleDateString('fa-IR')}</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-black text-white leading-relaxed tracking-tight">
          {article.title}
        </h1>

        {/* Author and Views */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>نویسنده و گردآورنده: <strong className="text-slate-200">{article.author}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{article.viewsCount || 620} بازدید</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lead / Summary Box */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border-r-4 border-r-purple-500 border-y border-l border-slate-800 text-sm text-purple-100 font-medium leading-relaxed">
          {article.summary}
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-4 text-sm text-slate-300 leading-loose">
          {article.content.map((p, index) => (
            <p key={index} className="text-justify">
              {p}
            </p>
          ))}
        </div>

        {/* Source Box (SEO E-E-A-T Guarantee) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <div className="text-xs">
              <span className="text-slate-400">منبع رسمی گزارش: </span>
              <span className="font-bold text-white">{article.sourceName}</span>
            </div>
          </div>

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <span>مشاهده گزارش اصلی در سایت مرجع</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tags */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            برچسب‌ها:
          </span>
          {article.tags.map((t, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono"
            >
              #{t}
            </span>
          ))}
        </div>

      </article>

      {/* Related News Section */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>مطالب و اخبار مرتبط</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectOtherArticle(rel)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <span className="text-[10px] text-purple-300 font-bold block">{rel.categoryLabelFa}</span>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-relaxed">
                  {rel.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
