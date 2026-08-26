# 🚀 سند جامع نقشه راه و ره‌گیری فازهای اجرایی پروژه اتصال (Etesal Hub Master Roadmap)
> **نسخه:** Zero-Trust Commercial 7.1.0  
> **استاندارد بازرسی:** پروتکل عدم جعل شواهد (Strict No-Fake-Evidence Protocol)

---

## 📊 ۱. داشبورد وضعیت کلی فازهای اجرایی (Overview)

| فاز | حوزه تخصصی | وضعیت کد و تست داخلی (E2) | وضعیت ران‌تایم خارجی (E4) | وضعیت نهایی |
| :--- | :--- | :---: | :---: | :---: |
| **فاز ۱** | **امن‌سازی و احراز هویت (Security & Auth)** | 🟢 **تکمیل و تست شده (Pass E2)** | ⏳ **نیازمند تست در پروداکشن** | `PASS CODE / AWAITING PROD` |
| **فاز ۲** | **پایگاه‌داده و مدیریت محتوا (Database, CMS & Tables V7.1)** | 🟢 **اسکیما و کدهای کلاینت آماده (Pass E2)** | 🟢 **تایید شده با شواهد دیتابیس (Verified E4)** | `VERIFIED IN SUPABASE 🟢` |
| **فاز ۳** | **سئو لبه شبکه، پینگ واقعی و ورکر کلودفلر** | 🟢 **کدهای ورکر و متادیتاها آماده (Pass E2)** | ⏳ **در انتظار استقرار روی Cloudflare** | `AWAITING CLOUDFLARE DEPLOY` |
| **فاز ۴** | **تضمین کیفیت، تست‌های ایزوله و CI/CD** | 🟢 **۱۲/۱۲ تست پاس شد (Pass E2)** | ⏳ **در انتظار اجرای اکشن گیت‌هاب** | `PASS CODE / AWAITING PROD` |

---

## 📋 ۲. ماتریس تفصیلی تسک‌ها و وضعیت شواهد (Evidence Level)

### 🛡️ فاز ۱: امن‌سازی، احراز هویت و امنیت شبکه (P0 - Blocker)
- [x] **SEC-01: گیت روت ادمین با هش استاندارد WebCrypto SHA-256 (`adminSecurityService.ts`).**
  - **سطح مدرک:** `E2 (Automated Test Execution)` — تست هش رمز `EtesalAdmin2026!` به صورت خودکار اجرا و پاس شد.
- [x] **SEC-02: احراز هویت یکپارچه و سیستم نشست محلی پایدار (`authService.ts`).**
  - **سطح مدرک:** `E1 (Static Code & Types)` — تایپ‌ها و متدهای ارتباط با Supabase بدون خطا کامپایل شدند.
- [x] **SEC-03: اعمال هدرهای امنیتی سخت‌گیرانه CSP و HSTS (`index.html`) و تگ‌های NoIndex صفحات حساس.**
  - **سطح مدرک:** `E1 (Static Code)` — متای CSP و `noindex, nofollow` در صفحات ادمین، داشبورد و پشتیبانی مستقر شد.

---

### 🗄️ فاز ۲: پایگاه‌داده و لایه ذخیره‌سازی داده‌ها (P0 - Critical — 🟢 تکمیل و تایید شده)
- [x] **DB-01: لایه سرویس متمرکز پایگاه‌داده و مدیریت نودها (`configDbService.ts`, `articlesDbService.ts`).**
  - **سطح مدرک:** `E2 (Static Build Verification)` — بیلد پروداکشن بدون خطای تایپی.
- [x] **DB-02: اسکریپت جامع PostgreSQL V7.1 شامل ۹ جدول و RLS (`workflows/schema.sql`).**
  - **جداول تایید شده در ران‌تایم:** `profiles`, `configs`, `proxies`, `telegram_media_queue`, `support_tickets`, `wallet_transactions`, `user_subscriptions`, `articles`, `news`.
  - **سطح مدرک:** `E4 (Live Evidence provided by user)` | **وضعیت ران‌تایم:** `PASS IN SUPABASE`.
- [x] **DB-03: راستی‌آزمایی فعال‌سازی قوانین دسترسی سطحی (Row Level Security - RLS) و ایندکس‌ها.**
  - **سطح مدرک:** `E4 (Runtime Schema Inspector Evidence)` | **شواهد:** ۹ جدول دارای `rls_enabled: true`، پالیسی‌های تفکیک‌شده مهمان/کاربر/ادمین، ایندکس‌های B-Tree روی فیلدهای پرکاربرد و توابع تریگری `handle_updated_at` و `prevent_role_change`.

---

### ⚡ فاز ۳: اتوماسیون، سئوی داینامیک، پینگ واقعی و لبه شبکه (P1 - High — 🎯 اقدام جاری)
- [x] **SRV-01: ماژول اتصال به ورکر کلودفلر برای سنجش پینگ (`edgePingService.ts`).**
  - **سطح مدرک:** `E2 (Code & Fallback logic verified)` — تست‌های کلاینت متصل به اندپوینت `/validate`.
- [x] **SRV-02: اسکریپت ورکر نقشه سایت پویا (`cloudflare-workers/sitemap.js`).**
  - **سطح مدرک:** `E1 (Worker code complete)` — آماده استقرار روی Cloudflare Workers برای پوشش `/sitemap.xml`.
- [x] **SRV-03: وب‌هوک ایمن ربات تلگرام در ورکر کلودفلر (`workflows/cloudflare-worker/validator-worker.ts`).**
  - **سطح مدرک:** `E1 (Worker code complete in repo)` — آماده استقرار در کلودفلر.

---

### 🧪 فاز ۴: تضمین کیفیت، تست‌های ایزوله و اتوماسیون CI/CD (P1 - High)
- [x] **QA-01: اجرای پکیج تست‌های واحد ایزوله در رانر مستقل (`tests/runner.ts`).**
  - **سطح مدرک:** `E2 (Automated Execution)` — اجرای ۱۲ تست با نتیجه ۱۰۰٪ پاس و خروجی `exit 0`.
- [ ] **DEV-01: اجرای پایپ‌لاین Continuous Integration در GitHub Actions.**
  - **سطح مدرک:** `E1 (Workflow file exists)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE`.
- [ ] **DEV-02: ساخت و اجرای بیلد APK روی گوشی واقعی اندروید.**
  - **سطح مدرک:** `E1 (Workflow file exists)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE`.

---

## 🎯 ۳. گام‌های عملیاتی جاری (Next Actionable Steps)

1. **گام اول (اکنون - متولی: کاربر):** اجرای فایل `workflows/schema.sql` در SQL Editor سوپابیس.
2. **گام دوم (متولی: کاربر):** اجرای کوئری تست RLS و ارسال نتیجه.
3. **گام سوم (متولی: کاربر):** دیپلوی ورکر کلودفلر برای نقشه سایت و ولیدیتور.
4. **گام چهارم (متولی: کاربر):** تست بیلد اندروید و پایپ‌لاین CI.

---

## 🚪 ۴. دروازه نهایی تولید (Production Gate Verdict)

- **وضعیت کنونی:** **`NOT YET VERIFIABLE` 🟡**
- **شرط دریافت `RELEASE APPROVED`:** دریافت شواهد اجرای واقعی ران‌تایم از کاربر برای تست‌های خارجی (`EXT-01` تا `EXT-05`) طبق دستورالعمل موجود در `PRODUCTION_VERIFICATION_REPORT.md`.
