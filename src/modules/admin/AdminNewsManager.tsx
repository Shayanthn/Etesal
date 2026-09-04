import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Sparkles, 
  X, 
  Newspaper,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { NewsArticle } from '../../types/news';

interface AdminNewsManagerProps {
  newsList: NewsArticle[];
  setNewsList: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onToggleBreaking: (id: string) => void;
  onDeleteNews: (id: string) => void;
}

export const AdminNewsManager: React.FC<AdminNewsManagerProps> = ({
  newsList,
  setNewsList,
  onShowToast,
  onToggleBreaking,
  onDeleteNews
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [contentRaw, setContentRaw] = useState('');
  const [category, setCategory] = useState<NewsArticle['category']>('network_censorship');
  const [sourceName, setSourceName] = useState('تحریریه اختصاصی اتصال');
  const [sourceUrl, setSourceUrl] = useState('https://etesal.app');
  const [author, setAuthor] = useState('تیم امنیت و شبکه');
  const [readTimeMinutes, setReadTimeMinutes] = useState(4);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80');
  const [tagsRaw, setTagsRaw] = useState('اختلالات, امنیت, شبکه');
  const [isBreaking, setIsBreaking] = useState(false);

  const getCategoryLabel = (cat: NewsArticle['category']) => {
    switch (cat) {
      case 'network_censorship': return 'اختلالات و پایش شبکه';
      case 'security_privacy': return 'امنیت و حریم خصوصی';
      case 'tech_world': return 'دنیای تکنولوژی و لینوکس';
      case 'ai_dev': return 'هوش مصنوعی و ابزارها';
      default: return 'عمومی';
    }
  };

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setContentRaw('');
    setCategory('network_censorship');
    setSourceName('تحریریه اتصال');
    setSourceUrl('https://etesal.app');
    setAuthor('تیم فنی');
    setReadTimeMinutes(3);
    setImageUrl('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80');
    setTagsRaw('پروتکل, پایش, شبکه');
    setIsBreaking(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSlug(article.slug);
    setSummary(article.summary);
    setContentRaw(article.content.join('\n\n'));
    setCategory(article.category);
    setSourceName(article.sourceName);
    setSourceUrl(article.sourceUrl);
    setAuthor(article.author);
    setReadTimeMinutes(article.readTimeMinutes);
    setImageUrl(article.imageUrl);
    setTagsRaw(article.tags.join(', '));
    setIsBreaking(article.isBreaking || false);
    setIsModalOpen(true);
  };

  const handleGenerateSlug = () => {
    if (!title.trim()) return;
    const autoSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    setSlug(autoSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      onShowToast({
        title: 'خطا در فیلدها',
        description: 'لطفاً عنوان و خلاصه مقاله را وارد کنید.',
        type: 'error'
      });
      return;
    }

    const finalSlug = slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 50);
    const contentParagraphs = contentRaw.trim() 
      ? contentRaw.split('\n\n').map(p => p.trim()).filter(Boolean)
      : [summary.trim()];
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    if (editingArticle) {
      // Update
      setNewsList(prev => prev.map(a => {
        if (a.id === editingArticle.id) {
          return {
            ...a,
            title: title.trim(),
            slug: finalSlug,
            summary: summary.trim(),
            content: contentParagraphs,
            category,
            categoryLabelFa: getCategoryLabel(category),
            sourceName: sourceName.trim(),
            sourceUrl: sourceUrl.trim(),
            author: author.trim(),
            readTimeMinutes: Number(readTimeMinutes) || 3,
            imageUrl: imageUrl.trim(),
            tags,
            isBreaking
          };
        }
        return a;
      }));

      onShowToast({
        title: 'مقاله ویرایش شد ✍️',
        description: `تغییرات مقاله "${title}" ذخیره شد.`,
        type: 'success'
      });
    } else {
      // Create
      const newArt: NewsArticle = {
        id: 'news-' + Date.now(),
        slug: finalSlug,
        title: title.trim(),
        summary: summary.trim(),
        content: contentParagraphs,
        category,
        categoryLabelFa: getCategoryLabel(category),
        sourceName: sourceName.trim() || 'تحریریه اتصال',
        sourceUrl: sourceUrl.trim() || 'https://etesal.app',
        sourceType: 'iranian',
        author: author.trim() || 'تیم پژوهش',
        publishedAt: new Date().toISOString(),
        readTimeMinutes: Number(readTimeMinutes) || 3,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        tags,
        isBreaking,
        viewsCount: 1
      };

      setNewsList(prev => [newArt, ...prev]);
      onShowToast({
        title: 'مقاله جدید منتشر شد 📰',
        description: `مقاله "${newArt.title}" با موفقیت در سایت و رصدخانه قرار گرفت.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-purple-400" />
            <span>تحریریه، اخبار و مقالات سئو ({newsList.length} مقاله)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            افزودن مقاله تخصصی جدید، ویرایش اسلاگ سئو، تغییر وضعیت فوری و مدیریت محتوا.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ افزودن مقاله / خبر جدید</span>
        </button>
      </div>

      {/* News Table */}
      <div className="overflow-x-auto rounded-3xl bg-slate-900/80 border border-slate-800">
        <table className="w-full text-right text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3.5">عنوان مقاله</th>
              <th className="p-3.5">دسته‌بندی</th>
              <th className="p-3.5">منبع و نویسنده</th>
              <th className="p-3.5">اسلاگ URL</th>
              <th className="p-3.5">وضعیت فوری</th>
              <th className="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {newsList.map((article) => (
              <tr key={article.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-white max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0" 
                    />
                    <span className="truncate">{article.title}</span>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-lg bg-purple-950 border border-purple-500/30 text-[10px] text-purple-300">
                    {article.categoryLabelFa}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">
                  <span className="text-white font-medium">{article.sourceName}</span>
                  <span className="text-[10px] text-slate-500 block">{article.author}</span>
                </td>
                <td className="p-3.5 text-left font-mono text-[10px] text-cyan-400 max-w-[140px] truncate">
                  /news/{article.slug}
                </td>
                <td className="p-3.5">
                  <button
                    onClick={() => onToggleBreaking(article.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      article.isBreaking
                        ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>{article.isBreaking ? 'خبر فوری 🚨' : 'عادی'}</span>
                  </button>
                </td>
                <td className="p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(article)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors"
                      title="ویرایش مقاله"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteNews(article.id)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                      title="حذف مقاله"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-purple-500/40 p-5 sm:p-6 shadow-2xl space-y-4 text-right my-4 sm:my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>{editingArticle ? 'ویرایش مقاله تحریریه' : 'افزودن مقاله و خبر جدید به سایت'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Title & Slug */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">عنوان مقاله / خبر:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آموزش تنظیم TLS Fragment برای پایداری ارتباطات..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300">اسلاگ URL سئو:</label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>تولید خودکار اسلاگ</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="tls-fragment-optimization-guide"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">دسته‌بندی موضوعی:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="network_censorship">اختلالات و پایش شبکه</option>
                    <option value="security_privacy">امنیت و حریم خصوصی</option>
                    <option value="tech_world">دنیای تکنولوژی و کامپیوتر</option>
                    <option value="ai_dev">هوش مصنوعی و ابزارها</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">خلاصه مقاله (توضیحات کوتاه برای کارت و متاتگ سئو):</label>
                <textarea
                  rows={2}
                  required
                  placeholder="خلاصه ۲ خطی از موضوع مقاله و نتیجه‌گیری..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">متن کامل مقاله (پاراگراف‌ها را با ۲ بار اینتر جدا کنید):</label>
                <textarea
                  rows={5}
                  placeholder="پاراگراف اول...&#10;&#10;پاراگراف دوم...&#10;&#10;پاراگراف سوم..."
                  value={contentRaw}
                  onChange={(e) => setContentRaw(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Source & Author & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">نام منبع / نویسنده:</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">لینک منبع (URL):</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">زمان تخمینی مطالعه (دقیقه):</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">تصویر شاخص (Image URL):</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">برچسب‌ها (با ویرگول جدا کنید):</label>
                  <input
                    type="text"
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Breaking News Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isBreakingCheck"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-slate-800 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isBreakingCheck" className="text-xs text-white font-bold cursor-pointer">
                  نمایش به عنوان <span className="text-red-400 font-black">خبر فوری (Breaking News)</span> در بالای رصدخانه
                </label>
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
                  {editingArticle ? 'ذخیره تغییرات مقاله' : 'انتشار رسمی مقاله'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
