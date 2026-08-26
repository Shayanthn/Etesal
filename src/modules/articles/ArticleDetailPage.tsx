import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  Check, 
  ShieldCheck,
  Cpu,
  Network
} from 'lucide-react';

interface ArticleDetailPageProps {
  article: any;
  onBackToArticles: () => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  onBackToArticles,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  // SEO: Inject Structured Data (Schema.org Article JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.meta_title || article.title,
    'description': article.meta_description || article.excerpt || article.description,
    'datePublished': article.published_at || new Date().toISOString(),
    'author': {
      '@type': 'Person',
      'name': article.author || article.author?.name || 'تیم اتصال'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'اتصال | مرجع اینترنت آزاد',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://etesal.aeherai.ir/icon.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${window.location.origin}/article/${article.slug}`
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/article/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowToast({
        title: 'لینک مقاله کپی شد 📋',
        description: 'آدرس اینترنتی در کلیپ‌بورد کپی شد.',
        type: 'success'
      });
    }
  };

  const handleShareTelegram = () => {
    const url = `${window.location.origin}/article/${article.slug}`;
    const text = encodeURIComponent(`📚 ${article.title}\n\n`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Network': return <Network className="w-5 h-5 text-cyan-400" />;
      default: return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-20 fade-in">
      <Helmet>
        <title>{article.meta_title || article.title} | مقالات اتصال</title>
        <meta name="description" content={article.meta_description || article.excerpt || article.description} />
        <meta property="og:title" content={article.meta_title || article.title} />
        <meta property="og:description" content={article.meta_description || article.excerpt || article.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/article/${article.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToArticles}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors border border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">بازگشت</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareTelegram}
            className="p-2 rounded-xl bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 transition-colors"
            title="اشتراک در تلگرام"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors border border-slate-700/50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="text-xs font-medium">{copied ? 'کپی شد' : 'کپی لینک'}</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <div className="space-y-6 p-6 md:p-10 rounded-3xl bg-slate-900/50 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           {getIcon(article.iconName)}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>زمان مطالعه: {article.read_time_minutes || article.readTime || 5} دقیقه</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{new Date(article.published_at || new Date()).toLocaleDateString('fa-IR')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>{article.author?.name || article.author || 'تیم اتصال'}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-lg text-slate-300 leading-relaxed font-medium">
          {article.excerpt || article.description}
        </p>
      </div>

      {/* Article Content */}
      <div className="p-6 md:p-10 rounded-3xl bg-slate-900/40 border border-slate-800/80">
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-img:rounded-2xl prose-hr:border-slate-800 leading-loose">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </div>
  );
};
