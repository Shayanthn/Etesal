export interface SEOAnalysisResult {
  score: number;
  suggestions: { text: string; type: 'success' | 'warning' | 'error' }[];
}

export function calculateSEOScore(article: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
}): SEOAnalysisResult {
  const suggestions: { text: string; type: 'success' | 'warning' | 'error' }[] = [];
  let score = 0;
  
  const title = article.title || '';
  const metaTitle = article.meta_title || title;
  const metaDesc = article.meta_description || article.excerpt || '';
  const content = article.content || '';
  const slug = article.slug || '';
  const keyword = (article.focus_keyword || '').toLowerCase().trim();

  // 1. Meta Title Length
  if (metaTitle.length > 0 && metaTitle.length < 40) {
    suggestions.push({ text: 'عنوان سئو (Meta Title) کوتاه است (بهتر است بین ۴۰ تا ۶۰ کاراکتر باشد).', type: 'warning' });
    score += 5;
  } else if (metaTitle.length >= 40 && metaTitle.length <= 60) {
    suggestions.push({ text: 'طول عنوان سئو عالی است.', type: 'success' });
    score += 15;
  } else if (metaTitle.length > 60) {
    suggestions.push({ text: 'عنوان سئو طولانی است (بیش از ۶۰ کاراکتر ممکن است در گوگل بریده شود).', type: 'error' });
    score += 5;
  } else {
    suggestions.push({ text: 'عنوان سئو خالی است.', type: 'error' });
  }

  // 2. Meta Description Length
  if (metaDesc.length > 0 && metaDesc.length < 120) {
    suggestions.push({ text: 'توضیحات متا کوتاه است (بهتر است بین ۱۲۰ تا ۱۶۰ کاراکتر باشد).', type: 'warning' });
    score += 5;
  } else if (metaDesc.length >= 120 && metaDesc.length <= 160) {
    suggestions.push({ text: 'طول توضیحات متا استاندارد است.', type: 'success' });
    score += 15;
  } else if (metaDesc.length > 160) {
    suggestions.push({ text: 'توضیحات متا بیش از ۱۶۰ کاراکتر است.', type: 'warning' });
    score += 10;
  } else {
    suggestions.push({ text: 'توضیحات متا خالی است.', type: 'error' });
  }

  // 3. Slug format
  if (slug.length > 0) {
    if (/^[a-z0-9\-]+$/.test(slug) || /^[\u0600-\u06FFa-z0-9\-]+$/.test(slug)) {
      // Accepting persian chars too, but best practice is latin lowercase + hyphens
      suggestions.push({ text: 'فرمت پیوند یکتا (Slug) مناسب است.', type: 'success' });
      score += 10;
    } else {
      suggestions.push({ text: 'پیوند یکتا نباید شامل فاصله یا کاراکترهای غیرمجاز باشد.', type: 'warning' });
      score += 5;
    }
  } else {
    suggestions.push({ text: 'پیوند یکتا (Slug) تنظیم نشده است.', type: 'error' });
  }

  // 4. Content length
  const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 300) {
    suggestions.push({ text: `طول محتوا مناسب است (${wordCount} کلمه).`, type: 'success' });
    score += 20;
  } else if (wordCount > 0) {
    suggestions.push({ text: `طول محتوا کم است (${wordCount} کلمه). حداقل ۳۰۰ کلمه توصیه می‌شود.`, type: 'warning' });
    score += 10;
  } else {
    suggestions.push({ text: 'محتوای مقاله خالی است.', type: 'error' });
  }

  // 5. Keyword analysis (If focus keyword provided)
  if (keyword) {
    let keywordScore = 0;
    // In meta title
    if (metaTitle.toLowerCase().includes(keyword)) {
      suggestions.push({ text: 'کلمه کلیدی در عنوان سئو وجود دارد.', type: 'success' });
      keywordScore += 10;
    } else {
      suggestions.push({ text: 'کلمه کلیدی در عنوان سئو یافت نشد.', type: 'error' });
    }
    
    // In meta description
    if (metaDesc.toLowerCase().includes(keyword)) {
      suggestions.push({ text: 'کلمه کلیدی در توضیحات متا وجود دارد.', type: 'success' });
      keywordScore += 10;
    } else {
      suggestions.push({ text: 'کلمه کلیدی در توضیحات متا یافت نشد.', type: 'error' });
    }

    // In content
    const contentLower = content.toLowerCase();
    const kwOccurrences = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
    if (kwOccurrences > 0) {
      if (kwOccurrences > (wordCount / 100) * 3) { // > 3% density
        suggestions.push({ text: 'چگالی کلمه کلیدی در متن بیش از حد بالا است (احتمال Keyword Stuffing).', type: 'warning' });
        keywordScore += 10;
      } else {
        suggestions.push({ text: `کلمه کلیدی ${kwOccurrences} بار در متن استفاده شده است.`, type: 'success' });
        keywordScore += 20;
      }
    } else {
      suggestions.push({ text: 'کلمه کلیدی اصلاً در متن مقاله استفاده نشده است.', type: 'error' });
    }
    score += keywordScore;
  } else {
    suggestions.push({ text: 'کلمه کلیدی هدف وارد نشده است. برای تحلیل دقیق‌تر آن را مشخص کنید.', type: 'warning' });
    // Normalize score out of 100 if keyword is not provided
    score = Math.floor((score / 60) * 100);
    return { score: Math.min(score, 100), suggestions };
  }

  return { score: Math.min(score, 100), suggestions };
}
