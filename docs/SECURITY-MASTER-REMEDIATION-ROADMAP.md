# 🚨 SECURITY MASTER REMEDIATION ROADMAP (v7 - Evidence-Based & DB-Hardened)

این سند مرجع نهایی است. بر اساس **شواهد قطعی و تست‌های نفوذ (curl)** اثبات شد که دیتابیس در سطح جدول `profiles` به شدت آسیب‌پذیر است و فرض قبلی مبنی بر امنیت RLS اشتباه بوده است. این نقشه راه بر اساس این شواهد به‌روزرسانی شده است.

## 🛑 قوانین اجرایی (Zero-Trust)
1. **قانون توقف:** من (هوش مصنوعی) حق تیک زدن (`[x]`) هیچ موردی را ندارم مگر با تایید خروجی تست دستی (Console, Network, SQL) توسط شما.
2. **بدون فرض پیش‌فرض:** کدهای ظاهر-امن (مثل گارد فرانت‌اند) تا زمانی که بک‌اند امن نباشد، فاقد ارزش هستند.

---

## 🔴 فاز ۱: مسدودکننده‌های بحرانی دیتابیس و منطق مالی (CRITICAL BLOCKERS)

### [x] TICKET-1: انسداد دسترسی نوشتن `anon` روی جدول `profiles` (RLS Bypass)
- **وضعیت فعلی:** تست `curl` نشان داد کاربر ناشناس (`anon`) می‌تواند `role` را به `super_admin` و `wallet_balance` را تغییر دهد (خروجی 204 دریافت شد).
- **فایل هدف:** `workflows/schema.sql` (تنظیمات RLS جدول profiles)
- **اقدام مورد نیاز:** بازنویسی `POLICY` های جدول `profiles`. کاربر فقط باید حق خواندن پروفایل خود و ویرایش فیلدهای غیرحساس را داشته باشد. تغییر `role` و `wallet_balance` باید برای آپدیت کلاینت-ساید مسدود شود (فقط Service Role حق تغییر دارد).
- **تست تایید:** اجرای مجدد دستور `curl -X PATCH ... -d '{"role": "super_admin"}'` با توکن `anon`. **باید خطای 401 یا 403 برگرداند.**

### [x] TICKET-2: انتقال کامل تراکنش‌های کیف پول به سمت سرور (RPC و Atomic Transaction)
- **وضعیت فعلی:** `walletService.ts` با کامنت صریح کدنویس قبلی، خریدها را لوکال سیمولیت می‌کند. هیچ تراکنشی در جدول `wallet_transactions` ثبت نمی‌شود و RPC وجود ندارد.
- **فایل هدف:** `workflows/schema.sql` (ساخت RPC با `SECURITY DEFINER`) و `src/services/walletService.ts`.
- **اقدام مورد نیاز:** ساخت RPC واقعی در Postgres (`process_wallet_deposit` یا `purchase_dedicated_config`) که در یک تراکنش اتمیک (Atomic)، موجودی کاربر را چک کند، کسر کند، رکورد در `wallet_transactions` بسازد و رکورد اشتراک در `user_subscriptions` درج کند.
- **تست تایید:** دستکاری `walletBalance` در `localStorage` به `999999` و تلاش برای خرید. **باید خطای سرور دریافت شود که موجودی کافی نیست.**

### [ ] TICKET-3: رفع خطای ۴۰۴ کلودفلر (Missing Routing Fallback)
- **فایل هدف:** `public/_redirects`
- **شرح مشکل:** رفرش دستی در مسیر `/dashboard` خطای ۴۰۴ سرور می‌دهد.
- **اقدام مورد نیاز:** ایجاد فایل `public/_redirects` با محتوای `/* /index.html 200`.
- **تست تایید:** دیپلوی و باز کردن مستقیم لینک `/dashboard`. **باید خروجی کد 200 در تب Network دریافت شود.**

### [x] TICKET-10: رفع آسیب‌پذیری SSRF در ورکر Cloudflare
- **فایل هدف:** `workflows/cloudflare-worker/validator-worker.ts`
- **وضعیت فعلی:** تابع `isPrivateIP` در برابر فرمت‌های کوتاه IPv4 (مثل `127.1`) یا اعداد صحیح دور می‌خورد و امکان اسکن شبکه داخلی کلودفلر وجود دارد.
- **اقدام مورد نیاز:** اصلاح لاجیک بررسی IP با استفاده از Regex سخت‌گیرانه برای فرمت کامل IPv4 و رد کردن تمام درخواست‌های دارای فرمت غیرمعمول.
- **تست تایید:** ارسال Payload مخرب `127.1` به ورکر و اطمینان از بلاک شدن درخواست (Fail closed).

### [x] TICKET-11: جلوگیری از حمله DoS در ثبت تیکت (مسدودسازی درج توسط anon)
- **فایل هدف:** `workflows/schema.sql` (پالیسی Guest Ticket Submission) و `src/services/ticketsService.ts`
- **وضعیت فعلی:** سیاست RLS در `schema.sql` هنوز `FOR INSERT TO anon WITH CHECK (user_id IS NULL)` باز است — یک حلقه curl می‌تواند دیتابیس را پر کند.
- **اقدام مورد نیاز:** انتقال ثبت تیکت‌های ناشناس به یک ورکر/اج‌فانکشن مجهز به Rate Limit و Turnstile یا مسدودسازی کامل RLS درج برای نقش `anon`.
- **تست تایید:** اجرای حلقه Bash برای ارسال 100 درخواست ثبت تیکت پی‌درپی با نقش `anon`؛ باید ارور دریافت شود و هیچکدام ثبت نشوند.

### [ ] TICKET-21: حذف کدهای پنل ادمین فانتوم (اتصال ماژول‌های ادمین به دیتابیس)
- **فایل هدف:** `src/modules/admin/*.tsx` (Configs, News, Proxies, Music) و توابع در `configDbService.ts`/`contentService.ts`.
- **وضعیت فعلی:** توابعی مثل `saveConfigsBatch` در ماژول‌های ادمین هرگز `await` و صدا زده نمی‌شوند (Dead code). توابع `saveNews` و `saveProxies` اصلاً وجود ندارند. آپدیت‌های ادمین با رفرش از بین می‌روند.
- **اقدام مورد نیاز:** ایجاد توابع بک‌اند (`saveNews`, `deleteNews`, `saveProxiesBatch` و غیره) با الگوبرداری از `AdminArticlesManager`. اتصال این توابع در کامپوننت‌ها به جای `setState` محلی صرف.
- **تست تایید:** ثبت یک کانفیگ/خبر جدید به عنوان ادمین، رفرش صفحه؛ **باید دیتای ثبت شده مستقیماً از Supabase خوانده شود و موجود باشد.**

---

## 🟠 فاز ۲: اولویت بالا (امنیت کلاینت، بیلد و یکپارچگی)

### [ ] TICKET-4: جلوگیری از نشت سورس کد و بهینه‌سازی باندل (Vite Build Security)
- **فایل هدف:** `vite.config.ts`
- **اقدام مورد نیاز:** تنظیم `build.sourcemap: false`، `esbuild.drop: ['console', 'debugger']` و اضافه کردن `manualChunks`.

### [ ] TICKET-5: سخت‌سازی CSP (جلوگیری از XSS با وجود DOMPurify)
- **فایل هدف:** `public/_headers` و `index.html`
- **اقدام مورد نیاز:** حذف `'unsafe-inline'` و `'unsafe-eval'` از هدر `Content-Security-Policy` در بخش `script-src` و `style-src` (داینامیک استایل‌ها باید حذف/تبدیل شوند).

### [ ] TICKET-13: رفع تداخل Sitemap و Canonical در SEO
- **فایل هدف:** `index.html` و `public/sitemap.xml`
- **وضعیت فعلی:** اسکیما JSON-LD دامین اشتباه `etesal.vpnbuying.workers.dev` دارد و سایت‌مپ استاتیک با سایت‌مپ ورکر تداخل دارد.
- **اقدام مورد نیاز:** حذف `public/sitemap.xml`، اصلاح URL در `index.html` به `https://etesal.aetherai.ir/`.

### [ ] TICKET-15: پیاده‌سازی تست‌رانر واقعی (Vitest) و CI/CD
- **فایل هدف:** `tests/runner.ts`، `package.json` و `.github/workflows/ci.yml`
- **وضعیت فعلی:** اسکریپت تست‌رانر فیک است (`console.log('PASSED')`). گیت‌هاب اکشن به اشتباه به آن اتکا می‌کند.
- **اقدام مورد نیاز:** نصب `vitest`، اجرای تست‌های واقعی `tests/unit/*.test.ts`.

### [ ] TICKET-22: رفع باگ ساخت APK بدون امضا (Unsigned Android Build)
- **فایل هدف:** `.github/workflows/build-apk.yml`
- **وضعیت فعلی:** اجرای `gradlew assembleRelease` بدون تنظیمات `keystore`. در نتیجه APK خروجی غیرقابل نصب/هشداردار است.
- **اقدام مورد نیاز:** افزودن گام Signing با استفاده از کلیدهای مخفی تعریف‌شده در GitHub Secrets (`KEYSTORE_FILE`, `KEY_ALIAS`, `KEY_PASSWORD`).

### [ ] TICKET-23: حذف یا بازنویسی ورکر مرده تلگرام (telegramAdminBot.ts)
- **فایل هدف:** `cloudflare-workers/telegramAdminBot.ts`
- **وضعیت فعلی:** این ورکر از یک آرایه (حافظه محلی) برای مدیریت صف رسانه استفاده می‌کند که در محیط Stateless کلودفلر ورکر یک Anti-Pattern است.
- **اقدام مورد نیاز:** در صورت وجود n8n، این ورکر کاملاً حذف شود؛ در غیر این صورت با اتصال به جدول `telegram_media_queue` بازنویسی شود. جلوگیری از تداخل مسیرهای `wrangler.toml` (مثل `/validate` و `/api/*`).

### [ ] TICKET-24: حل مشکل SQL Injection / Prompt Injection در تیکت پشتیبانی
- **فایل هدف:** `src/services/ticketsService.ts` (تابع `replyToSupportTicket`)
- **وضعیت فعلی:** در کوئری PostgREST مستقیماً از `.or(id.eq.${ticketId},ticket_code.eq.${ticketId})` استفاده شده که آسیب‌پذیر است.
- **اقدام مورد نیاز:** تشخیص نوع آیدی و استفاده از ترکیب امن `eq('id', ticketId)` یا `eq('ticket_code', ticketId)`.

---

## 🟡 فاز ۳: اولویت متوسط (معماری، پرفورمنس و PWA)

### [ ] TICKET-6: بارگذاری تنبل مگاکامپوننت `UserDashboard` (Code Splitting)
- **فایل هدف:** `src/App.tsx`
- **اقدام مورد نیاز:** تبدیل ایمپورت استاتیک داشبورد به `React.lazy()`.
- **تست تایید:** بررسی تب Network در لندینگ پیج؛ اثبات اینکه فایل JS باندل داشبورد در لندینگ دانلود نمی‌شود.

### [ ] TICKET-7: تجزیه (Refactor) فایل ۱۱۵۰ خطی `UserDashboard`
- **فایل هدف:** `src/modules/dashboard/UserDashboard.tsx`
- **اقدام مورد نیاز:** شکستن فایل به زیرماژول‌های کوچکتر برای جلوگیری از آبشار رندرها.
- **تست تایید:** فعال‌سازی React DevTools "Highlight renders" و تایید اینکه با تغییر یک تب، کل داشبورد رندر نمی‌شود.

### [ ] TICKET-8: راه‌اندازی Rate Limiting برای جلوگیری از حملات L7 DDoS
- **فایل هدف:** `workflows/cloudflare-worker/validator-worker.ts`
- **وضعیت فعلی:** ورکر پردازش‌کننده وضعیت کانفیگ‌ها هیچ‌گونه محدودیت درخواستی (Rate Limiting) بر اساس IP ندارد و مستعد حمله DDoS برای مصرف پهنای باند و منابع است.
- **اقدام مورد نیاز:** پیاده‌سازی مکانیزم Rate Limit ایمن با استفاده از Cloudflare KV یا الگوریتم‌های Token Bucket محلی.
- **تست تایید:** اجرای حلقه ۵۰ درخواستی پشت سر هم و دریافت خطای 429 Too Many Requests در خروجی تب Network.

### [ ] TICKET-9: استراتژی PWA و کش (vite-plugin-pwa)
- **فایل هدف:** `public/sw.js` و `vite.config.ts`
- **اقدام مورد نیاز:** راه‌اندازی Workbox manifest برای آپدیت آفلاین خودکار.
- **تست تایید:** بررسی تیک Offline در Application tab مرورگر و رفرش صفحه با خروجی 200 از کش.

### [ ] TICKET-14: حل تداخل Helmet و DOM API (نشتی حافظه احتمالی)
- **فایل هدف:** `src/modules/news/NewsDetailPage.tsx`
- **وضعیت فعلی:** ایجاد تگ اسکریپت با `document.head.appendChild` همزمان با استفاده از `<Helmet>` باعث تداخل در رندرینگ React 18 می‌شود.
- **اقدام مورد نیاز:** حذف کد DOM Manipulation دستی و انتقال JSON-LD schema به داخل تگ `<Helmet>`.
- **تست تایید:** تغییر مسیر بین صفحات خبر و بررسی تگ‌های `<head>` مرورگر تا از عدم تکرار (Duplicate) تگ‌های اسکریپت مطمئن شویم.

### [ ] TICKET-25: رفع نواقص n8n و EdgePing Fallback
- **فایل هدف:** `workflows/n8n/1-config-ingestion.json`، `2-proxy-ingestion.json` و `src/services/edgePingService.ts`
- **وضعیت فعلی:** ورک‌فلوهای ۱ و ۲ نام (name) ندارند. فال‌بکِ پینگ با `Math.random()` انجام می‌شود بدون اطلاع به کاربر. تابع پاکسازی `purge_expired_nodes_and_media()` هرگز اتوماتیک اجرا نمی‌شود.
- **اقدام مورد نیاز:** نام‌گذاری ورک‌فلوها در n8n. اضافه کردن فلگ `isEstimated: true` برای پینگ‌های رندوم. ساخت یک Schedule (کرون‌جاب) در n8n یا دیتابیس برای فراخوانی `purge_expired_nodes_and_media`.

---

## 🟢 فاز ۴: پیش‌نیازهای رسیدن به کمال (Masterpiece 10/10)

برای رسیدن به نمره کامل ۱۰ از ۱۰ در تمامی دسته‌بندی‌ها (Enterprise Grade / 100 Lighthouse)، رفع باگ‌های فعلی به تنهایی کافی نیست. سیستم باید از نظر مقیاس‌پذیری، امنیت پیشگیرانه (Proactive Security)، و کمال مهندسی نرم‌افزار به سطح بانک‌ها و پلتفرم‌های جهانی برسد. 

### [ ] TICKET-16: امنیت لبه (Edge Security & WAF) در سطح Enterprise (نمره ۱۰ امنیت)
- **فایل هدف:** `cloudflare-workers/` و پنل کلودفلر
- **وضعیت فعلی:** نبود تایید هویت ضد-ربات پیشرفته و نبود محدودیت قطعی (Rate Limit) برای API های حساس.
- **اقدام مورد نیاز:** پیاده‌سازی `Cloudflare Turnstile (CAPTCHA)` برای تمامی فرم‌ها (لاگین، ثبت تیکت، ثبت نام). پیاده‌سازی `Cloudflare KV` یا `Durable Objects` برای Rate Limiting دقیق توزیع شده (مثلاً ۳ درخواست در دقیقه برای هر IP در فرم لاگین).
- **تست تایید:** شبیه‌سازی حمله Brute-force با ربات؛ سیستم باید IP را پس از ۳ بار تلاش ناموفق Ban کند.

### [ ] TICKET-17: کمال پرفورمنس و Core Web Vitals (نمره ۱۰ پرفورمنس)
- **فایل هدف:** تمام کامپوننت‌های UI، `index.html` و تصاویر
- **وضعیت فعلی:** تصاویری که بهینه نیستند، فونت‌هایی که بدون `font-display: swap` لود می‌شوند و رندرهای اضافه در کامپوننت‌های بزرگ.
- **اقدام مورد نیاز:** تبدیل تمام تصاویر (حتی اواتارها) به فرمت `WebP/AVIF`. استفاده تهاجمی از `useMemo` و `useCallback` در توابع سنگین داشبورد. استفاده از پیش‌بارگذاری هوشمند (Prefetching) فایل‌های حیاتی.
- **تست تایید:** دریافت نمره ۱۰۰ در هر ۴ بخش Google Lighthouse در محیط موبایل (Mobile 3G throttling).

### [ ] TICKET-18: کمال کیفیت کد (نمره ۱۰ کیفیت کد)
- **فایل هدف:** `tsconfig.json`، کامپوننت‌های عظیم (مثلاً `UserDashboard.tsx`) و `.github/workflows/`
- **وضعیت فعلی:** فایل `tsconfig.json` در حالت `strict: false` است و تایپ `any` به وفور استفاده شده. کامپوننت `UserDashboard` دارای ۱۱۵۰ خط کد (Anti-Pattern) است.
- **اقدام مورد نیاز:** فعال‌سازی `strict: true` در تایپ‌اسکریپت و رفع تمامی ارورهای تایپ. تجزیه کامل داشبورد به کامپوننت‌های اتمیک (Atomic Design). راه‌اندازی Pipeline های خودکار `ESLint` و بررسی آسیب‌پذیری Dependency ها در GitHub Actions.
- **تست تایید:** اجرای `npm run type-check` بدون دریافت حتی یک ارور و تایید شدن Pipeline ها در گیت‌هاب اکشن.

### [ ] TICKET-19: پوشش ۱۰۰٪ تست‌ها با E2E Testing (نمره ۱۰ قابلیت اطمینان)
- **فایل هدف:** پوشه `tests/e2e/`
- **وضعیت فعلی:** فقدان تست‌های سمت کاربر (End-to-End).
- **اقدام مورد نیاز:** نصب و راه‌اندازی `Playwright` یا `Cypress` برای شبیه‌سازی کامل جریان خرید اشتراک، لاگین، و ارسال تیکت در یک مرورگر واقعی.
- **تست تایید:** پاس شدن سناریوی کامل "ثبت نام کاربر > ورود به داشبورد > تلاش برای خرید > لاگ‌اوت" توسط Playwright در CI/CD.

### [ ] TICKET-20: دسترسی‌پذیری کامل (WCAG AAA) و چندزبانگی (نمره ۱۰ دسترسی‌پذیری)
- **فایل هدف:** فایل‌های `CSS`، تگ‌های `HTML` و پیکربندی i18n
- **وضعیت فعلی:** فقدان `aria-label` برای دکمه‌های آیکونی، تباین رنگ نامناسب در برخی بخش‌های مد دارک و عدم پشتیبانی کامل از زبان‌های دیگر به صورت ساختار یافته.
- **اقدام مورد نیاز:** بررسی کامل تباین رنگی با استاندارد WCAG AAA. اضافه کردن نقش‌های ARIA به صورت کامل برای Screen Reader ها. پیاده‌سازی سیستم مدیریت زبان ساختاریافته (مثل `react-i18next`).
- **تست تایید:** بررسی با افزونه‌های Axe Accessibility و تایید عدم وجود هیچ گونه هشدار دسترسی‌پذیری.
