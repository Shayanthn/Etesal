/**
 * Etesal Hub - Dynamic & Real-time Sitemap & Robots Generator (Production Grade)
 * Concurrent Fetching, XML Escaping, Robots.txt Handler & Error Fallback
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const baseUrl = env.BASE_URL || 'https://etesal.aetherai.ir';

    // ۱. تولید و هندل فایل robots.txt با ارجاع مستقیم به sitemap
    if (url.pathname === '/robots.txt') {
      const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
      return new Response(robotsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
        }
      });
    }

    if (url.pathname !== '/sitemap.xml') {
      return new Response('Not Found', { status: 404 });
    }

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

    // سایت‌مپ حداقلی اضطراری در صورت عدم دسترسی به دیتابیس (جلوگیری از خطای ۵۰۰ در گوگل بات)
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(baseUrl)}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(fallbackSitemap, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
        }
      });
    }

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };

    try {
      // ۲. دریافت همزمان و موازی داده‌ها با Promise.all (کاهش ۵۰ درصدی تاخیر)
      const [articlesResponse, newsResponse] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/articles?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`, { headers }).catch(() => null),
        fetch(`${SUPABASE_URL}/rest/v1/news?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`, { headers }).catch(() => null)
      ]);

      const articles = (articlesResponse && articlesResponse.ok) ? await articlesResponse.json() : [];
      const news = (newsResponse && newsResponse.ok) ? await newsResponse.json() : [];

      const latestUpdate = articles[0]?.updated_at?.split('T')[0] || news[0]?.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // صفحه اصلی
      xml += `  <url>\n`;
      xml += `    <loc>${xmlEscape(baseUrl)}/</loc>\n`;
      xml += `    <lastmod>${latestUpdate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;

      // لیست مقالات با اسکیپینگ ایمن
      articles.forEach(article => {
        if (!article.slug) return;
        const lastMod = article.updated_at ? article.updated_at.split('T')[0] : latestUpdate;
        xml += `  <url>\n`;
        xml += `    <loc>${xmlEscape(baseUrl)}/article/${encodeURIComponent(article.slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      // لیست اخبار با اسکیپینگ ایمن
      news.forEach(newsItem => {
        if (!newsItem.slug) return;
        const lastMod = newsItem.updated_at ? newsItem.updated_at.split('T')[0] : latestUpdate;
        xml += `  <url>\n`;
        xml += `    <loc>${xmlEscape(baseUrl)}/news/${encodeURIComponent(newsItem.slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          // ۳. کش لبه هوشمند با قابلیت استفاده از کش در زمان خطا یا بازتولید در پس‌زمینه
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400'
        }
      });
      
    } catch (error) {
      // در صورت خطای پیش‌بینی‌نشده، نسخه Fallback بازگردانده می‌شود تا ۵۰۰ نگیرد
      return new Response(fallbackSitemap, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
        }
      });
    }
  }
};
