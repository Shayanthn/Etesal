# 🖥️ مستند جامع ممیزی، معماری و تست فرانت‌اند (Frontend Architecture & QA Audit)
**پروژه:** سامانه هوشمند اتصال (Etesal Hub)  
**نسخه:** Production 6.0  
**محیط اجرا:** React 19 + TypeScript + Vite + Tailwind CSS (v4) + Motion  
**تاریخ استخراج مستقیم از سورس‌کد:** ۲۰۲۶-۰۸-۲۸  

---

## 🏛️ ۱. معماری لایه فرانت‌اند (Frontend Architecture Breakdown)

معماری فرانت‌اند بر پایه الگوی **Modular Component-Service Architecture** در ۱۲ ماژول مستقل پیاده‌سازی شده است:

```
src/
├── App.tsx                     # روتینگ SPA، مدیریت سشن سراسری، Toast و مودال‌ها
├── main.tsx                    # نقطه ورود React 19، StrictMode و HelmetProvider
├── index.css                   # ایمپورت Tailwind v4 و فونت‌های استاندارد فارسی
├── components/                 # کامپوننت‌های اتمیک و عمومی (LoadingScreen, NotFoundPage, BrandLogo)
│   └── auth/AdminRouteGuard.tsx# گارد امنیتی مسیرهای ادمین با اعتبارسنجی سشن
├── modules/                    # ماژول‌های دامنه‌محور و مستقل (Domain Modules)
│   ├── layout/                 # سربرگ، پانوشت، هدر چسبان، بنر جامعه، رادیو و پرسش‌ها
│   ├── configs/                # جعبه کانفیگ‌های زنده V2Ray (Reality, Vless, Vmess, Hy2, Trojan)
│   ├── proxies/                # جعبه پروکسی‌های تلگرام MTProto با اتصال ۱-کلیکه
│   ├── news/                   # هاب اخبار هوش مصنوعی و فناوری، صفحات تک‌خبر و ریدایرکت‌ها
│   ├── articles/               # پایگاه دانش و مقالات فنی دور زدن اختلالات و امنیت
│   ├── android-app/            # شبیه‌ساز اپلیکیشن اندروید و هسته Sing-Box Core
│   ├── download/               # مرکز دانلود کلاینت‌ها (v2rayNG, Nekoray, Hiddify, Streisand)
│   ├── support/                # سامانه تیکتینگ و پشتیبانی کاربران
│   ├── dashboard/              # پنل کاربری، کیف پول تستی، تست سرعت و کانفیگ‌های سفارشی
│   ├── admin/                  # داشبورد مدیریت جامع، رصد لاگ‌ها، ایجاد و ویرایش کانفیگ/خبر
│   ├── feedback/               # سامانه Toast و آلرت‌های غیرمسدودکننده
│   └── auth/                   # مودال ورود/ثبت‌نام با اعتبارسنجی ایمیل و رمز
├── services/                   # لایه دسترسی به داده و سرویس‌های خارجی (Service Layer)
│   ├── supabaseClient.ts       # کلاینت ایزوله و Singleton پایگاه‌داده Supabase
│   ├── edgePingService.ts      # ارتباط با ورکر کلودفلر جهت پینگ واقعی سوکت TCP
│   ├── configDbService.ts      # واکشی و فیلتر کانفیگ‌ها و پروکسی‌ها از دیتابیس
│   ├── contentService.ts       # واکشی اخبار و مقالات با Fallback لوکال
│   ├── authService.ts          # مدیریت ورود، خروج، ثبت‌نام و ذخیره ایمن سشن
│   ├── adminSecurityService.ts # اعتبارسنجی امنیتی ادمین و هشینگ SHA-256
│   ├── ticketsService.ts       # ثبت و پیگیری تیکت‌های پشتیبانی
│   └── walletService.ts        # مدیریت تراکنش‌ها و اعتبار کیف پول
└── utils/                      # موتورهای پردازشی و کمکی خالص (Pure Utility Engines)
    ├── configProxyEngine.ts    # پارسر عمیق لینک‌های کانفیگ، تشخیص کشور و اپراتور
    ├── telegramPublisherEngine.ts # فرمت‌کننده کپشن مدیا و قوانین ۳ پروکسی ضداسپم
    ├── seoScorer.ts            # محاسبه امتیاز سئو و بررسی خوانایی مقالات
    └── audioMetadata.ts        # استخراج متادیتا و کاور فایل‌های صوتی
```

---

## 🔒 ۲. امنیت و حریم خصوصی در کلاینت (Frontend Security Hardening)

1. **مدیریت ایمن کلیدها (Safe Environment Access):**
   * استفاده از تابع چندمحیطی `getEnvVar` در `supabaseClient.ts` و `edgePingService.ts` جهت سازگاری کامل همزمان با کلاینت مرورگر (`import.meta.env`) و محیط تست‌های سروری (`process.env`).
   * هیچ کلید حساسی (از جمله `service_role_key` یا توکن‌های ادمین تلگرام) در سورس فرانت‌اند وجود ندارد.
2. **محافظت از مسیرهای ادمین (`AdminRouteGuard`):**
   * دسترسی به مسیر `/admin` نیازمند بررسی سشن رمزنگاری‌شده در دیتابیس سوپابیس است و دسترسی مستقیم بدون احراز هویت بلافاصله مسدود می‌شود.
3. **مکانیزم Graceful Degradation (تحمل خطا):**
   * در صورت قطعی اینترنت کاربر یا عدم پاسخگویی دیتابیس، تمام بخش‌ها (کانفیگ‌ها، پروکسی‌ها، اخبار، مقالات) به دیتاهای معتبر پیش‌فرض محلی (`src/data/`) سوئیچ کرده و صفحه سفید یا کرش رخ نمی‌دهد.

---

## 🧪 ۳. نتایج ممیزی و تست‌های خودکار فرانت‌اند (Automated QA Test Results)

تست‌های ماژول‌های حیاتی با اجرای فرمان `npm run test` (فایل `tests/runner.ts`) با موفقیت ۱۰۰٪ اجرا شدند:

```text
======================================================
🛡️ ETESAL HUB QUALITY ASSURANCE & TEST SUITE (PHASE 4)
======================================================

🧪 Starting Config Engine Tests...
  ✅ PASS: Country parser correctly identifies Germany (DE)
  ✅ PASS: Country parser correctly identifies Finland (FI)
  ✅ PASS: Operator detection selects Irancell for Hysteria 2 UDP
  ✅ PASS: Operator detection honors explicit #همراه_اول hashtag
  ✅ PASS: Country parser returns fallback for unknown node

🧪 Starting Telegram Publisher Tests...
  ✅ PASS: Generates default channel footer when proxy list is empty
  ✅ PASS: Generates dot-separated inline proxy links
  ✅ PASS: Enforces 3-proxy minimum requirement for photo posts
  ✅ PASS: Allows audio posts even with less than 3 proxies

🧪 Starting Admin Security Tests...
  ✅ PASS: Derives correct standard SHA-256 hex string for baseline passcode
  ✅ PASS: Trims leading and trailing whitespace safely before hashing
  ✅ PASS: Produces valid 64-character hex hash representation

======================================================
📊 FINAL QA SUMMARY:
   🟢 PASSED: 12
   🔴 FAILED: 0
======================================================
✅ ALL QA AND SECURITY TEST SUITES PASSED 100%!
```
