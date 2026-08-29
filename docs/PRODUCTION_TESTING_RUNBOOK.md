# 🧪 کتابچه راهنمای تست و سناریوهای اعتبارسنجی زنده (Production Testing Runbook)
**پروژه:** سامانه هوشمند اتصال (Etesal Hub)  
**نسخه:** Production 6.0  
**تاریخ برنامه آزمون:** ۲۰۲۶-۰۸-۲۸ (فردا)  

این سند شامل تمام دستورات اجرایی، داده‌های ورودی نمونه و سناریوهای مثبت/منفی جهت اعتبارسنجی سیستم قبل و بعد از استقرار نهایی است.

---

## 🎯 بخش ۱: سناریوهای تست پایگاه‌داده (Database Verification Tests)

### تست ۱.۱: بررسی قیدهای یکتایی (Uniqueness Constraints)
* **هدف:** مطمئن شویم ثبت کانفیگ یا پروکسی تکراری ناممکن است.
* **دستور تست (SQL در Supabase SQL Editor):**
```sql
-- تست درج دو رکورد با config_string یکسان
INSERT INTO public.configs (name, protocol, config_string, is_active)
VALUES ('Test 1', 'vless', 'vless://test-unique-key-123@example.com:443', true);

-- این دستور دوم باید با خطای duplicate key error مواجه شود:
INSERT INTO public.configs (name, protocol, config_string, is_active)
VALUES ('Test 2', 'vless', 'vless://test-unique-key-123@example.com:443', true);
```
* **نتیجه مورد انتظار:** `ERROR: duplicate key value violates unique constraint "configs_config_string_key"`

---

## 🌐 بخش ۲: سناریوهای تست ورکرها و لبه کلودفلر (Cloudflare Edge Tests)

### تست ۲.۱: تست سنجش پورت و پینگ سوکت TCP (Happy Path)
* **دستور اجرایی (ترمینال یا Postman):**
```bash
curl -X POST https://etesal.aetherai.ir/api/validate \
  -H "Content-Type: application/json" \
  -d '{"host": "1.1.1.1", "port": 443}'
```
* **پاسخ مورد انتظار (HTTP 200):**
```json
{
  "valid": true,
  "latencyMs": 85
}
```

### تست ۲.۲: تست شبیه‌سازی حمله SSRF و مسدودسازی IP محلی (Security / Edge Case)
* **دستور اجرایی:**
```bash
curl -X POST https://etesal.aetherai.ir/api/validate \
  -H "Content-Type: application/json" \
  -d '{"host": "127.0.0.1", "port": 80}'
```
* **پاسخ مورد انتظار (HTTP 400):**
```json
{
  "valid": false,
  "error": "Access to local or private IP addresses is forbidden"
}
```

### تست ۲.۳: تست خروجی سایت‌مپ و فایل robots.txt (SEO Health Check)
* **دستور اجرایی:**
```bash
curl -I https://etesal.aetherai.ir/robots.txt
curl -I https://etesal.aetherai.ir/sitemap.xml
```
* **نتیجه مورد انتظار:**
  - وضعیت `HTTP 200 OK`
  - وجود هدر `Content-Type: application/xml` برای sitemap و `text/plain` برای robots.txt
  - هدر کش `stale-while-revalidate` فعال باشد.

### تست ۲.۴: تست رفرش فرانت‌اند SPA (بدون ارور ۴۰۴)
* **روش تست:** باز کردن آدرس `https://etesal.aetherai.ir/admin` و فشردن کلیدهای `Ctrl + F5`.
* **نتیجه مورد انتظار:** صفحه مستقیماً لود شده و خطای ۴۰۴ کلودفلر ظاهر نشود.

---

## ⚙️ بخش ۳: سناریوهای تست موتور اتوماسیون (n8n Execution Tests)

### تست ۳.۱: اجرای دستی پایپ‌لاین کانفیگ‌ها (`1-config-ingestion.json`)
* **روش تست:** باز کردن ورک‌فلو در n8n و کلیک روی دکمه **Test Workflow** یا **Execute Node**.
* **مواردی که باید چک شوند:**
  1. نود ۳ بدون تایم‌اوت، HTML صفحات تلگرام را برگرداند.
  2. نود ۶ به درستی کانفیگ‌های تکراری را حذف کرده و لیست یکتا را به نود ۷ بدهد.
  3. رکوردها در جدول `public.configs` در سوپابیس اضافه شوند.

### تست ۳.۲: اجرای دستی پایپ‌لاین پروکسی‌ها (`2-proxy-ingestion.json`)
* **روش تست:** اجرای ورک‌فلو در n8n.
* **نتیجه مورد انتظار:** پروکسی‌های سالم و تازه با تفکیک سرور، پورت و سکرت در جدول `public.proxies` ذخیره شوند.

### تست ۳.۳: تست هوش مصنوعی اخبار ایران و جهان (`4-news` و `5-news`)
* **روش تست:** اجرای پایپ‌لاین اخبار در n8n.
* **مواردی که باید چک شوند:**
  1. نود OpenRouter با موفقیت به مدل Llama-3.3 متصل شود (بدون ارور ۴۰۰).
  2. نود ۵ خروجی JSON را با موفقیت پارس کند.
  3. خبر با عنوان، متن مارک‌داون، خلاصه و منبع در جدول `public.news` درج گردد.

### تست ۳.۴: تست ربات ادمین وایرال تلگرام (`3-telegram-viral-bot.json`)
* **روش تست:** ارسال یک عکس یا متن تستی به ربات تلگرام از اکانت ادمین.
* **نتیجه مورد انتظار:** ربات ۳ پروکسی فعال از جدول `proxies` واکشی کرده، لینک‌ها را به انتهای کپشن پیوست کند و پست را در کانال مقصد فوروارد نماید.
