/**
 * Etesal Hub - Dynamic & Real-time Sitemap Generator (Production Grade)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== '/sitemap.xml') {
      return new Response('Not Found', { status: 404 });
    }

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response('Configuration Error: Missing Supabase credentials.', { status: 500 });
    }

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };

    try {
      // دریافت مقالات منتشرشده به صورت واقعی
      const articlesResponse = await fetch(`${SUPABASE_URL}/rest/v1/articles?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`, { headers });
      const articles = articlesResponse.ok ? await articlesResponse.json() : [];

      // دریافت اخبار منتشرشده به صورت واقعی
      const newsResponse = await fetch(`${SUPABASE_URL}/rest/v1/news?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500`, { headers });
      const news = newsResponse.ok ? await newsResponse.json() : [];

      const baseUrl = env.BASE_URL || 'https://etesal.aetherai.ir';
      const latestUpdate = articles[0]?.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // صفحه اصلی با آخرین تاریخ بهروزرسانی واقعی محتوا
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <lastmod>${latestUpdate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;

      // لیست مقالات واقعی
      articles.forEach(article => {
        const lastMod = article.updated_at ? article.updated_at.split('T')[0] : latestUpdate;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/article/${encodeURIComponent(article.slug)}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      // لیست اخبار واقعی
      news.forEach(newsItem => {
        const lastMod = newsItem.updated_at ? newsItem.updated_at.split('T')[0] : latestUpdate;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/news/${encodeURIComponent(newsItem.slug)}</loc>\n`;
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
          'Cache-Control': 'public, max-age=1800' // کش هوشمند ۳۰ دقیقهای
        }
      });
      
    } catch (error) {
      return new Response('Error generating dynamic sitemap', { status: 500 });
    }
  }
};
