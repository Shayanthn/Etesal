import React, { useState, useEffect } from 'react';
import { calculateSEOScore, SEOAnalysisResult } from '../../utils/seoScorer';
import { fetchArticles, saveArticle, deleteArticle } from '../../services/contentService';
import { Plus, Save, Trash2, Edit3, X, Check, AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminArticlesManagerProps {
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const AdminArticlesManager: React.FC<AdminArticlesManagerProps> = ({ onShowToast }) => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  
  // Editor state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  
  // SEO state
  const [seoResult, setSeoResult] = useState<SEOAnalysisResult>({ score: 0, suggestions: [] });

  const loadArticles = async () => {
    setLoading(true);
    const data = await fetchArticles();
    if (data) {
      setArticles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // SEO calculations and Auto-save
  useEffect(() => {
    if (editingArticle !== null) {
      const result = calculateSEOScore({
        title, slug, excerpt, content, meta_title: metaTitle, meta_description: metaDescription, focus_keyword: focusKeyword
      });
      setSeoResult(result);
    }
  }, [title, slug, excerpt, content, metaTitle, metaDescription, focusKeyword, editingArticle]);

  const handleCreateNew = () => {
    setEditingArticle({});
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setMetaTitle('');
    setMetaDescription('');
    setFocusKeyword('');
    setIsPublished(true);
  };

  const handleEdit = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title || '');
    setSlug(article.slug || '');
    setExcerpt(article.excerpt || '');
    setContent(article.content || '');
    setMetaTitle(article.meta_title || '');
    setMetaDescription(article.meta_description || '');
    setIsPublished(article.is_published ?? true);
  };

  const handleSave = async () => {
    if (!title || !slug || !content) {
      onShowToast({ title: 'خطا', description: 'عنوان، پیوند یکتا و محتوا الزامی است.', type: 'error' });
      return;
    }
    
    const articleData = {
      id: editingArticle?.id,
      title,
      slug,
      excerpt,
      content,
      meta_title: metaTitle,
      meta_description: metaDescription,
      is_published: isPublished
    };

    const result = await saveArticle(articleData);
    if (result.success) {
      onShowToast({ title: 'موفقیت', description: 'مقاله با موفقیت ذخیره شد.', type: 'success' });
      setEditingArticle(null);
      loadArticles();
    } else {
      onShowToast({ title: 'خطا', description: result.error || 'مشکلی در ذخیره مقاله رخ داد.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این مقاله مطمئن هستید؟')) {
      const result = await deleteArticle(id);
      if (result.success) {
        onShowToast({ title: 'حذف شد', description: 'مقاله با موفقیت حذف گردید.', type: 'success' });
        loadArticles();
      } else {
        onShowToast({ title: 'خطا', description: result.error || 'مشکلی در حذف مقاله رخ داد.', type: 'error' });
      }
    }
  };

  if (editingArticle !== null) {
    return (
      <div className="space-y-6 fade-in text-right">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-400" />
            {editingArticle.id ? 'ویرایش مقاله' : 'مقاله جدید'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingArticle(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              ذخیره و انتشار
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">عنوان مقاله</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="مثال: آموزش تنظیمات V2Ray..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">پیوند یکتا (Slug)</label>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span>etesal.aetherai.ir/article/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="v2ray-setup-guide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">خلاصه (Excerpt)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="چکیده کوتاه مقاله..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">محتوای اصلی (پشتیبانی از HTML)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none font-mono text-sm leading-relaxed"
                  placeholder="<p>پاراگراف اول...</p>"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
              <h3 className="text-white font-medium mb-4">تنظیمات سئو (SEO)</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">عنوان سئو (Meta Title)</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">توضیحات متا (Meta Description)</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">کلمه کلیدی هدف</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="مثال: پراکسی تلگرام"
                />
              </div>
            </div>

            {/* SEO Scorer Panel */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">نمره سئو هوشمند</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${seoResult.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : seoResult.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {seoResult.score} / 100
                </div>
              </div>
              <div className="space-y-3">
                {seoResult.suggestions.map((s, idx) => (
                  <div key={idx} className="flex gap-2 text-xs">
                    {s.type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {s.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />}
                    {s.type === 'error' && <X className="w-4 h-4 text-red-400 shrink-0" />}
                    <span className="text-slate-300 leading-relaxed">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in text-right">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          مدیریت مقالات
        </h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          مقاله جدید
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            هیچ مقاله‌ای یافت نشد.
          </div>
        ) : (
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-slate-400 bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">عنوان مقاله</th>
                <th className="px-6 py-4 font-medium">پیوند یکتا (Slug)</th>
                <th className="px-6 py-4 font-medium text-center">وضعیت</th>
                <th className="px-6 py-4 font-medium text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-slate-200 font-medium">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {article.slug}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {article.is_published ? (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">منتشر شده</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-500/10 text-slate-400 rounded-lg text-xs">پیشنویس</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
