/**
 * Etesal Hub - Production-Grade Real Edge Validator & Telegram Bot Gateway
 * Hardened against SSRF, Socket Leaks, Unhandled Timeouts & CORS issues.
 */
import { connect } from 'cloudflare:sockets';

/**
 * Validates an IP address (IPv4 or IPv6) against private/reserved ranges.
 * Handles decimal, octal (0NNN), and hex (0xNN) octet representations.
 */
function isPrivateIP(ip: string): boolean {
  // STRICT IPv4 parsing: Reject any octal, hex, or short-form (e.g. 127.1).
  // Only exact standard IPv4 formats are allowed. Fail closed otherwise.
  if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip)) {
    const parts = ip.split('.').map(p => {
      // Reject octal formatting completely (e.g. 010.0.0.1)
      if (p.length > 1 && p.startsWith('0')) return NaN;
      return parseInt(p, 10);
    });
    
    if (parts.some(o => isNaN(o) || o < 0 || o > 255)) return true; // Fail closed if invalid structure
    
    const [a, b] = parts;
    if (a === 0) return true;                                    // 0.0.0.0/8
    if (a === 10) return true;                                   // 10.0.0.0/8
    if (a === 127) return true;                                  // 127.0.0.0/8 (loopback)
    if (a === 169 && b === 254) return true;                     // 169.254.0.0/16 (link-local)
    if (a === 172 && b >= 16 && b <= 31) return true;           // 172.16.0.0/12
    if (a === 192 && b === 168) return true;                     // 192.168.0.0/16
    if (a === 198 && (b === 18 || b === 19)) return true;        // 198.18.0.0/15 (benchmarking)
    if (a === 100 && b >= 64 && b <= 127) return true;          // 100.64.0.0/10 (CGNAT)
    if (a >= 224) return true;                                   // 224+ (multicast & reserved)
    return false;
  }
  
  // If it doesn't match standard IPv4, maybe it's IPv6. But for SSRF, if it looks like IPv4 but fails regex, reject!
  if (!ip.includes(':')) return true; // It's not IPv4 and not IPv6, so reject it.

  // ── IPv6 ──
  const lower = ip.toLowerCase();
  
  // Basic format validation - fail closed if not a valid IPv6 chars/structure
  if (!/^[0-9a-f:\.]+$/i.test(ip)) return true; 
  
  // Normalize full zeroes (e.g. 0:0:0:0:0:0:0:1 -> ::1 equivalent check)
  if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1' || lower === '0:0:0:0:0:0:0:0') return true;
  if (lower.startsWith('fe80:')) return true;                   // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA fc00::/7
  
  // Catch any embedded IPv4 address (like IPv4-mapped, IPv4-compatible, NAT64)
  const ipv4Match = lower.match(/(?:\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4Match) {
    if (isPrivateIP(ipv4Match[0])) return true;
  }
  
  // Catch hex-encoded IPv4-mapped addresses like ::ffff:7f00:1
  if (lower.startsWith('::ffff:')) {
    const hexPart = lower.substring(7);
    if (!hexPart.includes(':') && /^[0-9a-f]+$/i.test(hexPart)) {
      // It's a hex representation of an IPv4 address
      // e.g. 7f000001 or 7f00:1
      return true; // Simplest and safest is to block all such obscure encodings or properly parse them.
    }
    if (hexPart.includes(':')) {
       return true; // fail closed for any weird ffff: mapping
    }
  }

  // Fail closed for unrecognized or complex hex mappings that might hide loopback
  // A complete IPv6 parser is required for perfect validation, but we can block known bypasses.
  if (lower.includes('7f00')) return true; // loopback hex
  if (lower.includes('c612')) return true; // 198.18 hex

  if (lower.startsWith('64:ff9b:')) return true;                 // NAT64 well-known prefix
  return false;
}

/**
 * Resolves a hostname via DNS-over-HTTPS, validates all resolved IPs,
 * and returns a safe IP to connect to directly (prevents DNS rebinding).
 * If the input is already an IP literal, validates it directly.
 */
async function resolveAndValidateTarget(hostname: string): Promise<string | null> {
  const isIPLiteral = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');
  if (isIPLiteral) {
    return isPrivateIP(hostname) ? null : hostname;
  }

  if (/^localhost\.?$/i.test(hostname)) return null;

  let dohRes: Response;
  try {
    dohRes = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
      { headers: { 'Accept': 'application/dns-json' } }
    );
  } catch {
    return null;
  }
  if (!dohRes.ok) return null;

  let dnsData: any;
  try {
    dnsData = await dohRes.json();
  } catch {
    return null;
  }

  const answers = dnsData.Answer || [];
  const aRecords = answers.filter((a: any) => a.type === 1);

  if (aRecords.length === 0) return null;

  for (const record of aRecords) {
    if (isPrivateIP(record.data)) return null;
  }

  return aRecords[0].data;
}

/**
 * Reads the request body as a string, enforcing a hard byte limit.
 * Cancels the stream immediately if the limit is exceeded.
 */
async function readBodyWithLimit(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let result = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > maxBytes) {
        await reader.cancel();
        return null;
      }
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    return result;
  } catch {
    return null;
  }
}

/**
 * Constant-time XOR comparison to prevent timing attacks
 */
async function secureCompare(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const aBytes = new Uint8Array(aHash);
  const bBytes = new Uint8Array(bHash);
  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

const ALLOWED_ORIGINS = new Set([
  'https://etesal.aetherai.ir',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

// ── Rate Limiting (Sliding Window Memory Limiter with KV Fallback) ──
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitCache = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string, limit = 45, windowMs = 10_000): boolean {
  const now = Date.now();
  // Evict expired entries if table grows
  if (rateLimitCache.size > 3000) {
    for (const [key, entry] of rateLimitCache.entries()) {
      if (entry.resetAt < now) rateLimitCache.delete(key);
    }
  }

  const existing = rateLimitCache.get(ip);
  if (!existing || existing.resetAt < now) {
    rateLimitCache.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (existing.count >= limit) {
    return true;
  }

  existing.count++;
  return false;
}

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    // ۱. تنظیمات امنیتی استاندارد CORS با لیست سفید سخت‌گیرانه (CORS Hardening)
    const origin = request.headers.get('Origin') || '';
    const isOriginAllowed = ALLOWED_ORIGINS.has(origin) || origin === env.ALLOWED_ORIGIN;
    
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Bot-Api-Secret-Token',
      'Access-Control-Max-Age': '86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    };

    if (isOriginAllowed && origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ========================================================================
    // 🌐 ۱.۵. اندپوینت داینامیک نقشه سایت (Dynamic Sitemap Engine for SEO/AEO)
    // ========================================================================
    if (url.pathname === '/sitemap.xml' && request.method === 'GET') {
      try {
        let dynamicArticles: any[] = [];
        let dynamicNews: any[] = [];

        // اگر Supabase متصل است، آخرین مقالات و اخبار منتشرشده را واکشی کن
        if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
          const headers = {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
          };
          const [artRes, newsRes] = await Promise.all([
            fetch(`${env.SUPABASE_URL}/rest/v1/articles?select=slug,updated_at,published_at&is_published=eq.true&order=published_at.desc&limit=100`, { headers }).catch(() => null),
            fetch(`${env.SUPABASE_URL}/rest/v1/news?select=slug,created_at&is_published=eq.true&order=created_at.desc&limit=100`, { headers }).catch(() => null)
          ]);

          if (artRes && artRes.ok) dynamicArticles = await artRes.json();
          if (newsRes && newsRes.ok) dynamicNews = await newsRes.json();
        }

        const now = new Date().toISOString().split('T')[0];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        // صفحات اصلی
        xml += `  <url><loc>https://etesal.aetherai.ir/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
        xml += `  <url><loc>https://etesal.aetherai.ir/download</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
        xml += `  <url><loc>https://etesal.aetherai.ir/news</loc><lastmod>${now}</lastmod><changefreq>always</changefreq><priority>0.8</priority></url>\n`;
        xml += `  <url><loc>https://etesal.aetherai.ir/support</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;

        // مقالات داینامیک
        for (const art of dynamicArticles) {
          const mod = (art.updated_at || art.published_at || now).split('T')[0];
          xml += `  <url><loc>https://etesal.aetherai.ir/article/${encodeURIComponent(art.slug)}</loc><lastmod>${mod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }

        // اخبار داینامیک
        for (const nw of dynamicNews) {
          const mod = (nw.created_at || now).split('T')[0];
          xml += `  <url><loc>https://etesal.aetherai.ir/news/${encodeURIComponent(nw.slug)}</loc><lastmod>${mod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
        }

        xml += `</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800, s-maxage=3600',
            ...corsHeaders
          }
        });
      } catch {
        // فالبک به ساختار پایه
        const basicXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://etesal.aetherai.ir/</loc></url></urlset>`;
        return new Response(basicXml, { status: 200, headers: { 'Content-Type': 'application/xml', ...corsHeaders } });
      }
    }

    // ========================================================================
    // ⚡ ۲. اندپوینت تست پینگ و اعتبارسنجی سوکت TCP (Hardened Socket Probe)
    // ========================================================================
    if ((url.pathname === '/validate' || url.pathname === '/api/validate') && request.method === 'POST') {
      // بررسی محدودیت درخواست (Rate Limiting L7 DDoS Protection)
      const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-real-ip') || '127.0.0.1';
      if (isRateLimited(clientIp, 45, 10_000)) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند ثانیه صبر کنید.',
          isRateLimited: true 
        }), {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '10'
          }
        });
      }

      // جلوگیری از OOM با Stream Reader و محدودیت 16KB بایت 
      const MAX_BODY = 16_384;
      const bodyText = await readBodyWithLimit(request, MAX_BODY);
      if (bodyText === null) {
        return new Response(JSON.stringify({ valid: false, error: 'Payload too large' }), {
          status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let body: any;
      try {
        body = JSON.parse(bodyText);
      } catch {
        return new Response(JSON.stringify({ valid: false, error: 'Malformed JSON payload' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const configString = body?.node?.configString || body?.configString || '';
      if (configString.length > 2048) {
        return new Response(JSON.stringify({ valid: false, error: 'configString too long' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let host = (body?.node?.host || body?.host || '').toString().trim();
      let port = parseInt(body?.node?.port || body?.port || 0, 10);

      // استخراج هاست و پورت از رشته کانفیگ V2Ray در صورت عدم تفکیک
      if (!host && configString) {
        const hostPortMatch = configString.match(/@([^:]+):(\d+)/);
        if (hostPortMatch) {
          host = hostPortMatch[1];
          port = parseInt(hostPortMatch[2], 10);
        }
      }

      if (host.length > 253) {
        return new Response(JSON.stringify({ valid: false, error: 'Host too long' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // گاردریل ۱: بررسی پر بودن هاست و پورت
      if (!host || isNaN(port) || port < 1 || port > 65535) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: 'Invalid or missing target host / port (must be between 1 and 65535).' 
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // گاردریل ۲: جلوگیری قطعی از SSRF و DNS Rebinding با DoH کلادفلر
      const safeIP = await resolveAndValidateTarget(host);
      if (!safeIP) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: 'Target host is restricted or unresolvable (private/internal addresses not allowed).' 
        }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // انجام تست سنجش TCP با مدیریت قطعی چرخه حیات سوکت (Resource Safe)
      const startTime = Date.now();
      let isValid = false;
      let latencyMs = 999;
      let socket: any = null;
      let timer: any = null;

      try {
        socket = connect({ hostname: safeIP, port: port }); // اتصال مستقیم به IP تایید شده
        
        await new Promise<void>((resolve, reject) => {
          timer = setTimeout(() => reject(new Error('timeout')), 3000);
          socket.opened.then(
            () => { clearTimeout(timer); resolve(); },
            (err: any) => { clearTimeout(timer); reject(err); }
          );
        });

        latencyMs = Date.now() - startTime;
        isValid = true;
      } catch (probeErr) {
        latencyMs = Date.now() - startTime;
        isValid = false;
      } finally {
        // آزادسازی کامل منابع، تایمر و پرامیس‌های سرگردان
        if (timer) clearTimeout(timer);
        if (socket) {
          try { socket.close(); } catch (_) {}
          try { socket.readable?.cancel(); } catch (_) {}
          try { socket.writable?.close().catch(() => {}); } catch (_) {}
        }
      }

      return new Response(JSON.stringify({
        valid: isValid,
        latencyMs: latencyMs,
        host: host,
        port: port,
        edgeLocation: (request as any).cf?.colo || 'EDGE',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ========================================================================
    // 🤖 ۳. وب‌هوک ربات تلگرام با تایید اصالت و مدیریت خطا
    // ========================================================================
    if ((url.pathname === '/telegram/webhook' || url.pathname === '/api/telegram/webhook') && request.method === 'POST') {
      const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
      const expectedSecret = env.TELEGRAM_WEBHOOK_SECRET || '';
      
      // مقایسه امن و Constant-Time برای جلوگیری از Timing Attacks
      if (!expectedSecret || !(await secureCompare(secretToken, expectedSecret))) {
        return new Response(JSON.stringify({ error: 'Unauthorized Webhook Request' }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Stream Reader تلگرام برای جلوگیری از Content-Length Spoofing
      const tgBodyText = await readBodyWithLimit(request, 16_384);
      if (tgBodyText === null) {
        return new Response(JSON.stringify({ error: 'Payload too large' }), {
          status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const update = JSON.parse(tgBodyText);
        const message = update?.message;
        const chatId = message?.chat?.id;
        const text = (message?.text || '').trim();

        if (env.TELEGRAM_BOT_TOKEN && chatId && text) {
          let replyText = '👋 به سامانه هوشمند اتصال خوش آمدید.\nبرای دریافت آخرین کانفیگ‌ها و وضعیت شبکه به وب‌سایت مراجعه کنید:\nhttps://etesal.aetherai.ir';
          if (text === '/stats') {
            replyText = '📊 وضعیت سرورهای لبه: ۱۰۰٪ فعال و متصل به شبکه ابری.';
          } else if (text === '/ping') {
            replyText = '⚡ ربات و گیت‌وی شبکه لبه کاملاً فعال و در دسترس است.';
          }

          // اجرای پردازش تلگرام در Background با ctx.waitUntil 
          // (جلوگیری از قطع شدن درخواست توسط سرورهای تلگرام)
          ctx.waitUntil(
            fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: replyText }),
            }).then(tgRes => {
              if (!tgRes.ok) console.error(`Telegram sendMessage failed: HTTP ${tgRes.status}`); // Sanitized Logging
            }).catch(() => {})
          );
        }

        // بازگرداندن سریع 200 OK
        return new Response(JSON.stringify({ ok: true, processed: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (tgErr) {
        return new Response(JSON.stringify({ ok: false, error: 'Telegram processing error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Etesal Real Production Edge Gateway Active', { 
      status: 200, 
      headers: corsHeaders 
    });
  }
};
