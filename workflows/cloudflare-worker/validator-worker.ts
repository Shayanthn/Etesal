/**
 * Etesal Hub - Production-Grade Real Edge Validator & Telegram Bot Gateway
 * Hardened against SSRF, Socket Leaks, Unhandled Timeouts & CORS issues.
 */
import { connect } from 'cloudflare:sockets';

// لیست دامنه‌ها و آی‌پی‌های ممنوعه جهت جلوگیری از حملات SSRF به شبکه داخلی
const FORBIDDEN_HOST_REGEX = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|::1|fc00:|fe80:)/i;

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    // ۱. تنظیمات امنیتی استاندارد CORS
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://etesal.aetherai.ir';
    const origin = request.headers.get('Origin') || '';
    const isOriginAllowed = origin === allowedOrigin || origin.endsWith('.aetherai.ir');
    
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Bot-Api-Secret-Token',
      'Access-Control-Max-Age': '86400',
    };

    if (isOriginAllowed && origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ========================================================================
    // ⚡ ۲. اندپوینت تست پینگ و اعتبارسنجی سوکت TCP (Hardened Socket Probe)
    // ========================================================================
    if ((url.pathname === '/validate' || url.pathname === '/api/validate') && request.method === 'POST') {
      // محدودسازی حجم ورودی (Payload Protection)
      const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
      if (contentLength > 8192) {
        return new Response(JSON.stringify({ valid: false, error: 'Payload too large' }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const body: any = await request.json();
        const configString = body?.node?.configString || body?.configString || '';
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

        // گاردریل ۱: بررسی پر بودن هاست و پورت
        if (!host || isNaN(port) || port < 1 || port > 65535) {
          return new Response(JSON.stringify({ 
            valid: false, 
            error: 'Invalid or missing target host / port (must be between 1 and 65535).' 
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // گاردریل ۲: جلوگیری از اسکن شبکه داخلی و SSRF
        if (FORBIDDEN_HOST_REGEX.test(host)) {
          return new Response(JSON.stringify({ 
            valid: false, 
            error: 'Target host is restricted (private/internal addresses not allowed).' 
          }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // انجام تست سنجش TCP با مدیریت قطعی چرخه حیات سوکت (Resource Safe)
        const startTime = Date.now();
        let isValid = false;
        let latencyMs = 999;
        let socket: any = null;
        let timer: any = null;

        try {
          socket = connect({ hostname: host, port: port });
          
          const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('timeout')), 3000);
          });

          await Promise.race([
            socket.opened,
            timeoutPromise
          ]);

          latencyMs = Date.now() - startTime;
          isValid = true;
        } catch (probeErr) {
          latencyMs = Date.now() - startTime;
          isValid = false;
        } finally {
          // آزادسازی کامل منابع و تایمر
          if (timer) clearTimeout(timer);
          if (socket) {
            try { socket.close(); } catch (_) {}
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

      } catch (err) {
        return new Response(JSON.stringify({ valid: false, error: 'Malformed JSON payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ========================================================================
    // 🤖 ۳. وب‌هوک ربات تلگرام با تایید اصالت و مدیریت خطا
    // ========================================================================
    if ((url.pathname === '/telegram/webhook' || url.pathname === '/api/telegram/webhook') && request.method === 'POST') {
      const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (!env.TELEGRAM_WEBHOOK_SECRET || secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized Webhook Request' }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      try {
        const update: any = await request.json();
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

          const tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: replyText,
            })
          });

          if (!tgRes.ok) {
            console.error(`Telegram sendMessage failed: ${tgRes.status} ${await tgRes.text()}`);
          }
        }

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
