# 🚀 راهنمای جامع استقرار نهایی و انتشار لایو (Deployment & Go-Live Guide)
**پروژه:** سامانه هوشمند اتصال (Etesal Hub)  
**نسخه:** Production 6.0  
**تاریخ به‌روزرسانی:** ۲۰۲۶-۰۸-۲۷  

این سند ترتیب دقیق مراحل راه‌اندازی (Step-by-Step Release Workflow)، چک‌لیست انتشار و پلن بازگشت به عقب (Rollback Strategy) را تشریح می‌کند.

---

## 🧭 ترتیب الزامی استقرار اجزای سیستم (Deployment Sequence)

برای جلوگیری از هرگونه ناهماهنگی یا قطعی سرویس، مراحل استقرار باید **دقیقاً به این ترتیب** اجرا شوند:

```
[گام ۱: دیتابیس Supabase] ➔ [گام ۲: ورکرها Cloudflare] ➔ [گام ۳: گردش‌کارهای n8n] ➔ [گام ۴: فرانت‌اند Pages] ➔ [گام ۵: مانیتورینگ نهایی]
```

---

### 🗄️ گام ۱: آماده‌سازی و بررسی پایگاه‌داده (Supabase Database)
1. وارد داشبورد پروژه Supabase خود شوید.
2. در بخش **SQL Editor**، فایل مایگریشن نهایی `database/001_initial_schema.sql` (یا جداول موجود) را بررسی کنید.
3. مطمئن شوید که جداول `configs`, `proxies`, `news`, `telegram_media_queue`, `health_checks`, `system_logs` فعال هستند و قیدهای یکتایی روی ستون‌های `config_string` و `secret` و `slug` وجود دارند.
4. سطح RLS جداول را چک کنید:
   * جداول `configs`, `proxies`, `news`: خواندن (SELECT) برای کاربران `anon` عمومی، نوشتن (INSERT/UPDATE) فقط برای `service_role`.

---

### ☁️ گام ۲: استقرار ورکرهای کلودفلر (Cloudflare Workers Deploy)
1. **ورکر ولیدیتور (`etesal-validator`):**
   * کد `workflows/cloudflare-worker/validator-worker.ts` را در ورکر قرار دهید یا با دستور `npx wrangler deploy` در پوشه مربوطه دیپلوی کنید.
   * متغیرها و سکرت‌ها را در بخش **Settings > Variables**:
     - `ALLOWED_ORIGIN` = `https://etesal.aetherai.ir`
     - `TELEGRAM_BOT_TOKEN` (Encrypted)
     - `TELEGRAM_WEBHOOK_SECRET` (Encrypted)
2. **ورکر سایت‌مپ (`etesal-sitemap-worker`):**
   * کد `cloudflare-workers/sitemap.js` را دیپلوی کنید.
   * متغیرها:
     - `BASE_URL` = `https://etesal.aetherai.ir`
     - `SUPABASE_URL` (Encrypted)
     - `SUPABASE_ANON_KEY` (Encrypted)
3. در تنظیمات دامنه‌ها (Custom Domains)، روت‌های مربوطه را به ورکر متصل کنید:
   * `etesal.aetherai.ir/api/*` ➔ `etesal-validator`
   * `etesal.aetherai.ir/sitemap.xml` و `robots.txt` ➔ `etesal-sitemap-worker`

---

### ⚙️ گام ۳: ایمپورت و فعال‌سازی گردش‌کارها در n8n
1. وارد پنل n8n شوید.
2. ۶ فایل موجود در پوشه `workflows/n8n/` را ایمپورت (Import) کنید:
   * `1-config-ingestion.json`
   * `2-proxy-ingestion.json`
   * `3-telegram-viral-bot.json`
   * `4-news-ingestion-iran.json`
   * `5-news-ingestion-global.json`
   * `6-system-error-logger.json`
3. در منوی **Variables** در n8n، مقادیر جدول `docs/MASTER_SECRETS_AND_ENV_MATRIX.md` را وارد کنید.
4. در تنظیمات هر ورک‌فلو، **Error Workflow** را روی پایپ‌لاین ۶ تنظیم کنید.
5. سوئیچ وضعیت همه ورک‌فلوها را روی **Active** (روشن) قرار دهید.

---

### 💻 گام ۴: استقرار فرانت‌اند در Cloudflare Pages
1. پروژه گیت را به Cloudflare Pages متصل کنید.
2. تنظیمات بیلد:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
   * **Root directory:** `/`
3. در تب **Environment Variables** (بخش Production):
   * `NODE_VERSION` = `22`
   * `VITE_SUPABASE_URL` = آدرس پروژه سوپابیس
   * `VITE_SUPABASE_ANON_KEY` = کلید Anon سوپابیس
   * `VITE_APP_URL` = `https://etesal.aetherai.ir`
4. کلیک روی **Save and Deploy**.
5. تایید اینکه فایل‌های `dist/_redirects` و `dist/_headers` در خروجی بیلد قرار گرفته‌اند.

---

### 🩺 گام ۵: چک‌لیست ارزیابی سلامت بعد از انتشار (Post-Release Health Check)
بلافاصله پس از انتشار، ۴ مورد زیر را با مرورگر چک کنید:
- [ ] باز شدن صفحه اصلی سایت بدون ارور در کنسول مرورگر.
- [ ] نمایش لیست کانفیگ‌ها و پروکسی‌ها از دیتابیس.
- [ ] تست دکمه پینگ کانفیگ و دریافت پاسخ سبز رنگ.
- [ ] تست لود `/sitemap.xml` و `/robots.txt`.
- [ ] رفرش صفحه `/admin` بدون مواجهه با ارور ۴۰۴.

---

## 🔄 استراتژی بازگشت به عقب (Rollback Plan)
در صورت بروز هرگونه مشکل پیش‌بینی‌نشده:
1. **فرانت‌اند:** در داشبورد Cloudflare Pages، نسخه قبلی را با یک کلیک (Rollback to this deployment) فعال کنید.
2. **ورکرها:** در تب Deployments در داشبورد ورکر، به نسخه قبل بازگردید.
3. **n8n:** ورک‌فلوهای مربوطه را با تغییر وضعیت به Inactive موقتاً متوقف کنید.
