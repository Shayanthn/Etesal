# 🚀 راهنمای عملیاتی و چک‌لیست اقدامات کلودفلر (Operational Action Matrix)

این سند دقیقا مشخص می‌کند که **چه کارهایی در کد انجام شده** و **چه کارهایی را شما باید در داشبورد کلودفلر انجام دهید**.

---

## 🟢 بخش ۱: کارهایی که در کد و مخزن ۱۰۰٪ انجام و نهایی شدند:

1. **فایل `public/_redirects`:** با محتوای `/* /index.html 200` ایجاد شد (حل قطعی مشکل ارور ۴۰۴ در رفرش صفحات).
2. **فایل `public/_headers`:** تنظیم تمام هدرهای امنیتی (CSP, X-Frame-Options, Strict-Transport-Security و کش هوشمند Assetها).
3. **فایل `workflows/cloudflare-worker/validator-worker.ts`:**
   - مسدودسازی IPهای داخلی و پرایوت (ضد SSRF).
   - رفع کامل نشت سوکت TCP با `finally { clearTimeout; socket.close() }`.
   - بررسی و اعتبارسنجی پاسخ تلگرام.
   - اصلاح هدرهای CORS.
4. **فایل `cloudflare-workers/sitemap.js`:**
   - واکشی موازی داده‌ها با `Promise.all`.
   - اضافه شدن هندلر اختصاصی `/robots.txt`.
   - هدر کش هوشمند `stale-while-revalidate`.
   - ساختار Fallback برای جلوگیری از ارور ۵۰۰ در گوگل بات.
5. **فایل‌های `wrangler.toml`:** روت‌ها و مقادیر Compatibility Date (نسخه ۲۰۲۶) در هر دو ورکر بروزرسانی شدند.

---

## 🟡 بخش ۲: کارهایی که باید در داشبورد کلودفلر (یا خط فرمان Wrangler) ست شوند:

### ۱. تنظیم متغیرها و کلیدهای ورکر اعتبارسنجی (`etesal-validator`):
وارد داشبورد ورکر `etesal-validator` شوید و در تب **Settings > Variables & Secrets**:
* **متغیر عادی (Text):**
  * `ALLOWED_ORIGIN` = `https://etesal.aetherai.ir`
* **متغیرهای مخفی (Encrypted Secrets):**
  * `TELEGRAM_BOT_TOKEN` = توکن ربات تلگرام شما
  * `TELEGRAM_WEBHOOK_SECRET` = یک عبارت امن و تصادفی برای تایید وب‌هوک

---

### ۲. تنظیم متغیرها و کلیدهای ورکر سایت‌مپ (`etesal-sitemap-worker`):
در داشبورد ورکر سایت‌مپ در بخش **Settings > Variables & Secrets**:
* **متغیر عادی (Text):**
  * `BASE_URL` = `https://etesal.aetherai.ir`
* **متغیرهای مخفی (Encrypted Secrets):**
  * `SUPABASE_URL` = آدرس پروژه سوپابیس شما (`https://xxx.supabase.co`)
  * `SUPABASE_ANON_KEY` = کلید Anon سوپابیس

---

### ۳. تنظیم متغیرهای بیلد فرانت‌اند در Cloudflare:
در تنظیمات بیلد فرانت‌اند (**Workers & Pages > etesal > Settings > Builds**):
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Build Variables:**
  * `NODE_VERSION` = `22`
  * `VITE_SUPABASE_URL` = آدرس سوپابیس
  * `VITE_SUPABASE_ANON_KEY` = کلید Anon سوپابیس
  * `VITE_APP_URL` = `https://etesal.aetherai.ir`

---

## 🧪 بخش ۳: دستورات اجرای تست‌های زنده (Live Test Commands):

پس از تنظیم کلیدها، این ۴ دستور ساده را اجرا کنید تا نتایج را ثبت کنیم:

#### تست ۱: تست پینگ و ولیدیتور سوکت TCP
```bash
curl -X POST https://etesal.aetherai.ir/api/validate \
  -H "Content-Type: application/json" \
  -d '{"host": "1.1.1.1", "port": 443}'
```
*(باید پاسخ `{"valid": true, "latencyMs": ...}` با وضعیت ۲۰۰ برگردد).*

#### تست ۲: فعال‌سازی وب‌هوک تلگرام
در مرورگر این لینک را باز کنید:
```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://etesal.aetherai.ir/api/telegram/webhook&secret_token=<YOUR_SECRET>
```
*(باید پاسخ `{"ok": true, "result": true}` برگردد).*

#### تست ۳: تست لود سایت‌مپ و robots.txt
آدرس‌های زیر را در مرورگر باز کنید:
- `https://etesal.aetherai.ir/robots.txt`
- `https://etesal.aetherai.ir/sitemap.xml`

#### تست ۴: تست رفرش فرانت‌اند (SPA)
صفحه `https://etesal.aetherai.ir/admin` را باز کرده و با کلیدهای `Ctrl + F5` رفرش کنید. (نباید ارور ۴۰۴ بدهد).
