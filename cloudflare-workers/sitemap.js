/**
 * Etesal Hub - Dynamic & Real-time Sitemap & Robots Generator (Production Grade v2)
 * Fixes: Edge Cache API, AbortController timeout, array-join XML, full XML escaping.
 */

function xmlEscape(str) {
  if (!str) return '';
  return String(str).replace(/[<>&'"]/g, c => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[c]));
}

function fetchWithTimeout(url, options, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const baseUrl = env.BASE_URL || 'https://etesal.aetherai.ir';

    // ۱. تولید و هندل فایل robots.txt
    if (url.pathname === '/robots.txt') {
      const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
      return new Response(robotsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      });
    }

    if (url.pathname !== '/sitemap.xml') {
      return new Response('Not Found', { status: 404 });
    }

    // ۲. Cache API لبه کلادفلر جهت محافظت از دیتابیس در برابر Crawl Bursts
    const cache = caches.default;
    const cacheKey = new Request(`${baseUrl}/sitemap.xml`, { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

    // سایت‌مپ حداقلی اضطراری در صورت عدم دسترسی به دیتابیس (جلوگیری از خطای ۵۰۰ در گوگل بات)
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(baseUrl)}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
</urlset>`;

    const fallbackHeaders = (mode) => ({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'X-Sitemap-Mode': mode,
    });

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      const res = new Response(fallbackSitemap, { status: 200, headers: fallbackHeaders('no-config') });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    }

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };

    try {
      // ۳. دریافت همزمان و موازی با TimeOut سخت ۵ ثانیه‌ای (محافظت از منابع Worker)
      const [articlesResponse, newsResponse] = await Promise.all([
        fetchWithTimeout(`${SUPABASE_URL}/rest/v1/articles?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`, { headers }).catch(() => null),
        fetchWithTimeout(`${SUPABASE_URL}/rest/v1/news?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`, { headers }).catch(() => null)
      ]);

      const articles = (articlesResponse && articlesResponse.ok) ? await articlesResponse.json() : [];
      const news = (newsResponse && newsResponse.ok) ? await newsResponse.json() : [];

      if ((!articlesResponse || !articlesResponse.ok) && (!newsResponse || !newsResponse.ok)) {
        const res = new Response(fallbackSitemap, { status: 200, headers: fallbackHeaders('db-unreachable') });
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return res;
      }

      const today = new Date().toISOString().split('T')[0];
      const latestUpdate = xmlEscape(articles[0]?.updated_at?.split('T')[0] || news[0]?.updated_at?.split('T')[0] || today);

      // ۴. ساختار آرایه‌ای برای Join جهت جلوگیری از مشکل O(n²) و OOM در استرینگ‌ها
      const parts = [];
      parts.push(`<?xml version="1.0" encoding="UTF-8"?>\n`);
      parts.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`);

      // صفحه اصلی
      parts.push(`  <url>\n`);
      parts.push(`    <loc>${xmlEscape(baseUrl)}/</loc>\n`);
      parts.push(`    <lastmod>${latestUpdate}</lastmod>\n`);
      parts.push(`  </url>\n`);

      // لیست مقالات با اسکیپینگ ایمن و حذف فیلدهای بی‌تاثیر (priority/changefreq)
      articles.forEach(article => {
        if (!article.slug) return;
        const lastMod = xmlEscape(article.updated_at?.split('T')[0] || latestUpdate);
        parts.push(`  <url>\n`);
        parts.push(`    <loc>${xmlEscape(baseUrl)}/article/${encodeURIComponent(article.slug)}</loc>\n`);
        parts.push(`    <lastmod>${lastMod}</lastmod>\n`);
        parts.push(`  </url>\n`);
      });

      // لیست اخبار
      news.forEach(newsItem => {
        if (!newsItem.slug) return;
        const lastMod = xmlEscape(newsItem.updated_at?.split('T')[0] || latestUpdate);
        parts.push(`  <url>\n`);
        parts.push(`    <loc>${xmlEscape(baseUrl)}/news/${encodeURIComponent(newsItem.slug)}</loc>\n`);
        parts.push(`    <lastmod>${lastMod}</lastmod>\n`);
        parts.push(`  </url>\n`);
      });

      parts.push(`</urlset>`);
      const xml = parts.join('');

      const response = new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
          'X-Sitemap-Mode': 'live',
          'X-Sitemap-Urls': String(1 + articles.length + news.length),
        }
      });
      
      // ذخیره نتیجه نهایی در Cache API کلادفلر
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
      
    } catch (error) {
      // در صورت خطای پیش‌بینی‌نشده، نسخه Fallback بازگردانده می‌شود تا ۵۰۰ نگیرد (همراه با هدر لاگینگ)
      const res = new Response(fallbackSitemap, { status: 200, headers: fallbackHeaders('error') });
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    }
  }
};
