/**
 * Etesal Hub - Dynamic Sitemap Generator (Cloudflare Worker)
 * 
 * This worker intercepts requests to `/sitemap.xml`, connects to your 
 * Supabase database securely via the REST API, fetches all published 
 * articles and news, and generates an up-to-date XML sitemap on the fly.
 * 
 * Environment Variables Required in Cloudflare Worker settings:
 * - SUPABASE_URL: Your Supabase Project URL (e.g. https://xyz.supabase.co)
 * - SUPABASE_ANON_KEY: Your Supabase public anon key
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only respond to /sitemap.xml
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
      // Fetch Published Articles
      const articlesResponse = await fetch(`${SUPABASE_URL}/rest/v1/articles?is_published=eq.true&select=slug,updated_at`, { headers });
      const articles = articlesResponse.ok ? await articlesResponse.json() : [];

      // Fetch Published News
      const newsResponse = await fetch(`${SUPABASE_URL}/rest/v1/news?is_published=eq.true&select=slug,updated_at`, { headers });
      const news = newsResponse.ok ? await newsResponse.json() : [];

      // Generate XML
      const baseUrl = 'https://etesal.aeherai.ir'; // Your production domain

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // 1. Static Home Page
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;

      // 2. Dynamic Articles
      articles.forEach(article => {
        const lastMod = article.updated_at ? article.updated_at.split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      // 3. Dynamic News
      news.forEach(newsItem => {
        const lastMod = newsItem.updated_at ? newsItem.updated_at.split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/news/${newsItem.slug}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      // Return the XML with correct Content-Type so Google recognizes it
      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour to reduce DB load
        }
      });
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return new Response('Error generating sitemap', { status: 500 });
    }
  }
};
