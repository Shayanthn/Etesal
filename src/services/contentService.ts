import { getSupabase } from './supabaseClient';
import { SAMPLE_NEWS_ARTICLES } from '../data/newsData';
import { KNOWLEDGE_ARTICLES } from '../data/articles.data';

export async function fetchArticles() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
  }
  return KNOWLEDGE_ARTICLES.map(a => ({
    ...a,
    slug: a.id,
    content: (a as any).fullContent ? (a as any).fullContent.map((p: string) => `<p>${p}</p>`).join('') : '',
    meta_title: a.title,
    meta_description: a.description
  }));
}

export async function fetchNews() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }
  }
  return SAMPLE_NEWS_ARTICLES;
}

export async function saveArticle(article: any) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'دیتابیس متصل نیست' };
  
  try {
    if (article.id) {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          is_published: article.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id)
        .select()
        .single();
      return { success: !error, data, error };
    } else {
      const { data, error } = await supabase
        .from('articles')
        .insert([{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          is_published: article.is_published
        }])
        .select()
        .single();
      return { success: !error, data, error };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteArticle(id: string) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'دیتابیس متصل نیست' };
  try {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    return { success: !error, error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchArticleBySlug(slug: string) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
        
      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }
  }
  return KNOWLEDGE_ARTICLES.find(a => a.id === slug) || null;
}
