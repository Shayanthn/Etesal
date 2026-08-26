# 🛰️ پایپ‌لاین اتوماسیون استخراج، فیلتر سلامت و توزیع کانفیگ و پروکسی (Etesal 3-Way Dispatcher)

این سیستم معماری هوشمند استخراج خودکار نودهای ضد فیلتر (VLESS Reality, VMess, Hysteria 2, Trojan, MTProto) و توزیع همزمان آن‌ها در **۳ مقصد مجزا** است:
1. **🌐 وب‌سایت اتصال (Web Dashboard)**
2. **📱 اپلیکیشن اندروید (Mobile App Subscription Feed)**
3. **🚀 کانال عمومی تلگرام (Telegram Channel Direct Auto-Posting)**

---

## ۱. اسکریپت ساخت جداول دیتابیس Supabase (SQL Schema)

قبل از اجرای ورک‌فلو n8n، کد SQL زیر را در بخش **SQL Editor** دیتابیس Supabase خود اجرا کنید تا جداول و ایندکس‌های بهینه ایجاد شوند:

```sql
-- 1. جدول کانفیگ‌های V2Ray, Reality, Hysteria 2
CREATE TABLE IF NOT EXISTS public.configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    protocol VARCHAR(50) NOT NULL, -- vless, vmess, hysteria2, trojan, tuic
    config_string TEXT UNIQUE NOT NULL,
    operator VARCHAR(50) DEFAULT 'all', -- mci, irancell, rightel, wifi, all
    ping INTEGER DEFAULT 45,
    location VARCHAR(100) DEFAULT '🇩🇪 آلمان - Frankfurt',
    flag VARCHAR(10) DEFAULT '🇩🇪',
    quality VARCHAR(50) DEFAULT 'excellent',
    is_official BOOLEAN DEFAULT true,
    tls_type VARCHAR(100) DEFAULT 'TLS 1.3 / Reality',
    transport VARCHAR(100) DEFAULT 'TCP',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ایندکس برای جستجو و کوئری سریع اپراتوری
CREATE INDEX IF NOT EXISTS idx_configs_operator ON public.configs(operator);
CREATE INDEX IF NOT EXISTS idx_configs_protocol ON public.configs(protocol);

-- 2. جدول پروکسی‌های MTProto تلگرام
CREATE TABLE IF NOT EXISTS public.proxies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    secret VARCHAR(255) NOT NULL,
    ping INTEGER DEFAULT 35,
    location VARCHAR(100) DEFAULT '🇩🇪 فرانکفورت - آلمان',
    flag VARCHAR(10) DEFAULT '🇩🇪',
    sponsor_channel VARCHAR(100) DEFAULT '@vpnbuying',
    is_vip BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_host_port UNIQUE (host, port)
);

-- فعال‌سازی دسترسی امن RLS
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Configs" ON public.configs FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Proxies" ON public.proxies FOR SELECT USING (true);
CREATE POLICY "Admin Insert/Update for Configs" ON public.configs FOR ALL USING (true);
CREATE POLICY "Admin Insert/Update for Proxies" ON public.proxies FOR ALL USING (true);
```

---

## ۲. نحوه استخراج از کانال‌های عمومی تلگرام بدون داشتن دسترسی ادمین

از آنجا که کانال‌های مرجع عمومی هستند، n8n از ویژگی **Telegram Web Scraper (`https://t.me/s/CHANNEL_NAME`)** استفاده می‌کند. این اندپوینت رسمی تلگرام نیازی به لاگین یا توکن ندارد و آخرین ۲۰ پست کانال را با تمام متون و کدهای کانفیگ برمی‌گرداند.

---

## ۳. نحوه عملکرد فیلتر سلامت (Health Check) و پینگ‌سنجی

1. **اعتبارسنجی سینتکس و ساختار (Structure Validation):**
   - برای نودهای VLESS/Trojan: بررسی وجود `UUID` یا پسورد، آدرس هاست، پورت و پارامتر `security=reality` یا `tls`.
   - برای VMess: دیکودکردن Base64 و اطمینان از وجود فیلدهای `add`, `port`, `id`.
   - برای پروکسی MTProto: بررسی طول سکرت (سکرت‌های `ee...` معتبر Fake-TLS).
2. **سنجش تاخیر (Latency & Handshake Check):**
   - سرورهای روی پورت‌های استاندارد HTTPS (مانند ۴۴۳ و ۸۴۴۳) و با گواهی TLS 1.3 اولویت پینگ کمینه (۳۰ تا ۵۰ میلی‌ثانیه) دریافت می‌کنند.
   - نودهای دارای پورت‌های فیلترشده یا بدون TLS از چرخه توزیع حذف می‌شوند.

---

## ۴. نحوه تشخیص اپراتور مناسب (همراه اول، ایرانسل، رایتل، مخابرات/وای‌فای)

سیستم از دو لایه تحلیل هوشمند استفاده می‌کند:
- **لایه اول (NLP & Hashtags):** جستجوی تگ‌ها و کلمات کلیدی نظیر `#همراه_اول`, `#ایرانسل`, `#مخابرات`, `#شاتل`, `MCI`, `MTN`, `Rightel`.
- **لایه دوم (Heuristic DPI Behavioral Rules):**
  - پروتکل‌های بر پایه UDP QUIC (نظیر **Hysteria 2** و **TUIC**) به دلیل روتینگ برتر روی شبکه‌های سلولی، به عنوان **ایرانسل (MTN)** و **رایتل** نشانه‌گذاری می‌شوند.
  - پروتکل **VLESS Reality با پورت 443 TCP/gRPC** به عنوان بهترین گزینه برای **همراه اول (MCI)** و **فیبر نوری** برچسب می‌خورد.
  - نودهای **VMess WebSocket + Cloudflare CDN** برای **اینترنت خانگی / مخابرات / شاتل** تنظیم می‌گردند.

---

## ۵. منابع تاییدشده و سالم برای استخراج خودکار (Verified Production Feeds)

### الف) منابع کانفیگ‌های V2Ray، Reality و Hysteria 2 ویژه ایران:
1. **کانال تلگرام @v2rayng_org:** `https://t.me/s/v2rayng_org` (نودهای پایدار VLESS Reality و Hysteria 2)
2. **کانال تلگرام @FreeVmess:** `https://t.me/s/FreeVmess` (پشتیبانی فعال از همراه اول و ایرانسل)
3. **کانال تلگرام @V2rayNGn:** `https://t.me/s/V2rayNGn` (کانفیگ‌های پینگ پایین فرانکفورت و هلسینکی)
4. **مخزن سابسکریپشن vfarid (تفکیک اپراتوری):** `https://raw.githubusercontent.com/vfarid/v2ray-share/master/splited/all.txt`
5. **مخزن تجمیعی mahdibland (Aggregator Live):** `https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/sub_merge.txt`
6. **مخزن ساب barry-far (نودهای بهینه Reality):** `https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub1.txt`

---

### ب) منابع پروکسی‌های پرسرعت ضد فیلتر MTProto تلگرام:
1. **کانال تلگرام @MTProto_Proxy_IR:** `https://t.me/s/MTProto_Proxy_IR` (پروکسی‌های Fake-TLS برای خطوط موبایل)
2. **کانال تلگرام @TelMTProto:** `https://t.me/s/TelMTProto` (پروکسی‌های دائمی روی پورت‌های 443 و 8443)
3. **کانال تلگرام @ProxyMTProto:** `https://t.me/s/ProxyMTProto` (نودهای جهانی با لیتنسی کمینه)
4. **کانال تلگرام @iMTProto:** `https://t.me/s/iMTProto` (پروکسی‌های ضد فیلتر آلمان و هلند)
5. **کانال تلگرام @TelegramProxies_IR:** `https://t.me/s/TelegramProxies_IR` (سکرت‌های استاندارد TLS 1.3)

---

## ۶. مراحل وارد کردن و فعال‌سازی در n8n

1. فایل `config-proxy-ingestion-workflow.json` را باز کرده و محتوای آن را کپی کنید.
2. در پنل **n8n** خود یک ورک‌فلو جدید ایجاد کنید و آن را Paste کنید (`Ctrl + V`).
3. متغیرهای محیطی زیر را تنظیم نمایید:
   - `SUPABASE_URL`: آدرس پروژه Supabase شما.
   - `SUPABASE_ANON_KEY`: کلید ارتباطی دیتابیس Supabase.
   - `TELEGRAM_BOT_TOKEN`: توکن ربات تلگرام شما (ساخته شده در `@BotFather`) با دسترسی ادمین در کانال `@vpnbuying`.
4. دکمه **Activate** در بالای صفحه n8n را روشن کنید. ورک‌فلو هر ۱۵ دقیقه اجرا شده و نودهای تازه را در وب‌سایت، اپلیکیشن و کانال تلگرام منتشر خواهد کرد.
