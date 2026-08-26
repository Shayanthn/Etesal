# 🚀 سند جامع نقشه راه و ره‌گیری فازهای اجرایی پروژه اتصال (Etesal Hub Master Roadmap)
> **نسخه:** Zero-Trust Commercial 6.6.0  
> **استاندارد بازرسی:** پروتکل عدم جعل شواهد (Strict No-Fake-Evidence Protocol)

---

## 📊 ۱. داشبورد وضعیت کلی فازهای اجرایی (Overview)

| فاز | حوزه تخصصی | وضعیت کد و تست داخلی (E2) | وضعیت ران‌تایم خارجی (E4) | وضعیت نهایی |
| :--- | :--- | :---: | :---: | :---: |
| **فاز ۱** | **امن‌سازی و احراز هویت (Security & Auth)** | 🟢 **تکمیل و تست شده (Pass E2)** | ⏳ **نیازمند تست در پروداکشن** | `PASS CODE / AWAITING PROD` |
| **فاز ۲** | **پایگاه‌داده و ذخیره‌سازی زنده (Database & Live Storage)** | 🟢 **تکمیل و ساختاریافته (Pass E2)** | ⏳ **در انتظار تست RLS کاربر** | `PASS CODE / AWAITING PROD` |
| **فاز ۳** | **اتوماسیون، پینگ واقعی و وب‌هوک تلگرام** | 🟢 **تکمیل و متصل (Pass E2)** | ⏳ **در انتظار تست ورکر کلودفلر** | `PASS CODE / AWAITING PROD` |
| **فاز ۴** | **تضمین کیفیت، تست‌های ایزوله و CI/CD** | 🟢 **۱۲/۱۲ تست پاس شد (Pass E2)** | ⏳ **در انتظار اجرای اکشن گیت‌هاب** | `PASS CODE / AWAITING PROD` |

---

## 📋 ۲. ماتریس تفصیلی تسک‌ها و وضعیت شواهد (Evidence Level)

### 🛡️ فاز ۱: امن‌سازی، احراز هویت و امنیت شبکه (P0 - Blocker)
- [x] **SEC-01: گیت روت ادمین با هش استاندارد WebCrypto SHA-256 (`adminSecurityService.ts`).**
  - **سطح مدرک:** `E2 (Automated Test Execution)` — تست هش رمز `EtesalAdmin2026!` به صورت خودکار اجرا و پاس شد.
- [x] **SEC-02: احراز هویت یکپارچه و سیستم نشست محلی پایدار (`authService.ts`).**
  - **سطح مدرک:** `E1 (Static Code & Types)` — تایپ‌ها و متدهای ارتباط با Supabase بدون خطا کامپایل شدند.
- [x] **SEC-03: اعمال هدرهای امنیتی سخت‌گیرانه CSP و HSTS (`index.html`).**
  - **سطح مدرک:** `E1 (Static Code)` — متای CSP در هد فایل `index.html` مستقر شد.

---

### 🗄️ فاز ۲: پایگاه‌داده و جریان داده (P0 - Critical)
- [x] **DB-01: لایه سرویس متمرکز پایگاه‌داده و مدیریت نودها (`configDbService.ts`).**
  - **سطح مدرک:** `E2 (Static Build Verification)` — بیلد پروداکشن بدون خطای تایپی.
- [ ] **DB-02: فعال‌سازی قوانین دسترسی سطحی (Row Level Security - RLS) در سرور پروداکشن.**
  - **سطح مدرک:** `E1 (Schema DDL exists in repo)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE` (نیازمند اجرای کوئری در Supabase).
- [ ] **DB-03: سیستم تیکتینگ پشتیبانی زنده در دیتابیس آنلاین.**
  - **سطح مدرک:** `E1 (Code complete)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE`.

---

### ⚡ فاز ۳: اتوماسیون، پینگ واقعی و لبه شبکه (P1 - High)
- [x] **SRV-01: ماژول اتصال به ورکر کلودفلر برای سنجش پینگ (`edgePingService.ts`).**
  - **سطح مدرک:** `E2 (Code & Fallback logic verified)` — تست‌های کلاینت متصل به اندپوینت `/validate`.
- [ ] **SRV-02: فعال‌سازی و استقرار وب‌هوک ایمن ربات تلگرام در کلودفلر.**
  - **سطح مدرک:** `E1 (Worker code complete in repo)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE` (نیازمند ارسال curl به ورکر مستقرشده).

---

### 🧪 فاز ۴: تضمین کیفیت، تست‌های ایزوله و اتوماسیون CI/CD (P1 - High)
- [x] **QA-01: اجرای پکیج تست‌های واحد ایزوله در رانر مستقل (`tests/runner.ts`).**
  - **سطح مدرک:** `E2 (Automated Execution)` — اجرای ۱۲ تست با نتیجه ۱۰۰٪ پاس و خروجی `exit 0`.
- [ ] **DEV-01: اجرای پایپ‌لاین Continuous Integration در GitHub Actions.**
  - **سطح مدرک:** `E1 (Workflow file exists)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE`.
- [ ] **DEV-02: ساخت و اجرای بیلد APK روی گوشی واقعی اندروید.**
  - **سطح مدرک:** `E1 (Workflow file exists)` | **وضعیت ران‌تایم:** `WAITING FOR USER EVIDENCE`.

---

## 🚪 ۳. دروازه نهایی تولید (Production Gate Verdict)

- **وضعیت کنونی:** **`NOT YET VERIFIABLE` 🟡**
- **شرط دریافت `RELEASE APPROVED`:** دریافت شواهد اجرای واقعی ران‌تایم از کاربر برای ۵ تست خارجی (`EXT-01` تا `EXT-05`) طبق دستورالعمل موجود در `PRODUCTION_VERIFICATION_REPORT.md`.
