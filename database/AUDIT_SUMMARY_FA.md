# 📊 گزارش ممیزی تفکیک‌شده و تحلیل ساختاری پایگاه‌داده (Database Audit Report)
**پروژه:** Etesal Hub  
**محیط اجرا:** Supabase PostgreSQL 17.6 Production  
**تاریخ گزارش:** ۲۰۲۶-۰۸-۲۷  
**وضعیت کلی سلامت دیتابیس:** 🟢 **سبز و استاندارد (Fully Compliant with Zero-Trust Architecture)**

---

## 📑 فهرست تفکیک بخش‌ها
1. [وضعیت قفل‌های امنیتی RLS](#1-وضعیت-قفلهای-امنیتی-rls)
2. [پالیسی‌های دسترسی (RLS Policies)](#2-پالیسیهای-دسترسی-rls-policies)
3. [گاردریل‌ها و محدودیت‌ها (Constraints)](#3-گاردریلها-و-محدودیتها-constraints)
4. [ایندکس‌ها و بهینه‌سازی کارایی (Indexes)](#4-ایندکسها-و-بهینهسازی-کارایی-indexes)
5. [تریگرها و توابع سرورساید (Functions & Triggers)](#5-تریگرها-و-توابع-سرورساید-functions--triggers)
6. [حجم، ردیف‌ها و آمار جداول (Tables Statistics)](#6-حجم-ردیفها-و-آمار-جداول-tables-statistics)
7. [یافته‌های امنیتی (Security Analysis)](#7-یافتههای-امنیتی-security-analysis)

---

## 1. وضعیت قفل‌های امنیتی RLS
تمامی **۹ جدول عمومی (Public)** پروژه تحت کنترل کامل **Row Level Security** قرار دارند و به صورت پیش‌فرض دسترسی مستقیم هکرها یا کلاینت‌ها بدون احراز هویت مسدود است:

| نام جدول (Table) | وضعیت RLS | سطح ریسک دسترسی خام |
| :--- | :---: | :---: |
| `public.configs` | 🟢 فعال (`true`) | امن |
| `public.proxies` | 🟢 فعال (`true`) | امن |
| `public.news` | 🟢 فعال (`true`) | امن |
| `public.articles` | 🟢 فعال (`true`) | امن |
| `public.profiles` | 🟢 فعال (`true`) | امن |
| `public.support_tickets` | 🟢 فعال (`true`) | امن |
| `public.telegram_media_queue` | 🟢 فعال (`true`) | امن |
| `public.user_subscriptions` | 🟢 فعال (`true`) | امن |
| `public.wallet_transactions` | 🟢 فعال (`true`) | امن |

---

## 2. پالیسی‌های دسترسی (RLS Policies)
بررسی قوانین نشان می‌دهد اصل **کمترین دسترسی (Least Privilege)** کاملاً رعایت شده است:

* **کانفیگ‌ها (`configs`):**
  * `Public Read Active Configs`: کاربران عادی و مهمانان فقط کانفیگ‌های `is_active = true` و `is_vip = false` را می‌بینند.
  * `Admin Full Access Configs`: تنها کاربرانی که تابع `is_admin()` برای آن‌ها تایید شود دسترسی نوشتن و تغییر دارند.
* **پروکسی‌ها (`proxies`):**
  * `Public Read Active Proxies`: عموم کاربران فقط پروکسی‌های فعال (`is_active = true`) را می‌بینند.
  * `Admin Full Access Proxies`: تغییر و درج مستقیم مخصوص ادمین با اعتبارسنجی `is_admin()`.
* **پروفایل و کیف‌پول (`profiles` / `wallet_transactions`):**
  * هر کاربر فقط به سوابق تراکنش‌ها و اشتراک‌های اختصاصی خود (`user_id = auth.uid()`) دسترسی دارد.
* **تیکت‌های پشتیبانی (`support_tickets`):**
  * ثبت تیکت هم برای کاربران لاگین‌شده (`auth.uid()`) و هم برای مهمانان (`anon` با شرط `user_id IS NULL`) مجاز است اما خواندن اطلاعات محدود به صاحب تیکت یا ادمین است.

---

## 3. گاردریل‌ها و محدودیت‌ها (Constraints)
دیتابیس در لایه هسته (Database Core) مجهز به گاردریل‌های سخت‌گیرانه برای جلوگیری از ورود دیتای خراب است:

1. **پروتکل‌های مجاز (`configs_protocol_check`):**  
   `protocol IN ('vless', 'vmess', 'hysteria2', 'trojan', 'tuic', 'shadowtls', 'ss')`
2. **اپراتورهای معتبر (`configs_operator_check`):**  
   `operator IN ('all', 'mci', 'irancell', 'rightel', 'wifi', 'shatel', 'mokhaberat')`
3. **یکتایی و جلوگیری از تکرار:**
   * `configs_config_string_key`: یکتایی ۱۰۰٪ رشته کانفیگ V2Ray.
   * `unique_host_port`: جلوگیری قطعی از ثبت پروکسی تلگرام با ترکیب IP و Port تکراری.
   * `proxies_port_check`: پورت باید در بازه استاندارد `1 <= port <= 65535` باشد.
4. **ایمنی کیف پول و اشتراک‌ها:**
   * `wallet_transactions_amount_toman_check`: مبلغ تراکنش باید مثبت باشد (`> 0`).
   * `user_subscriptions_total_traffic_gb_check`: ترافیک کل حتماً باید بزرگتر از صفر باشد.

---

## 4. ایندکس‌ها و بهینه‌سازی کارایی (Indexes)
تمام فیلدهای پرکاربرد فیلترینگ و مرتب‌سازی دارای ایندکس‌های درخت B-Tree هستند:
* ایندکس‌های اختصاصی روی `country_code` و `operator` و `is_active` در جدول `configs`.
* ایندکس ترکیبی روی `(host, port)` در جدول `proxies`.
* ایندکس `slug` روی جداول `news` و `articles` برای واکشی سریع در زمان سئو و رندر صفحات.
* ایندکس `ticket_code` و `user_id` در جدول `support_tickets`.

---

## 5. تریگرها و توابع سرورساید (Functions & Triggers)
* **`trg_*_updated_at`**: بروزرسانی خودکار زمان فیلد `updated_at` در تمامی جداول هنگام ویرایش ردیف.
* **`handle_new_user()`**: به محض ثبت‌نام در `auth.users`، به طور خودکار پروفایل اولیه کاربر در `public.profiles` بدون دخالت کلاینت ایجاد می‌شود.
* **`prevent_role_change_by_non_admin()`**: از ارتقای خودسرانه نقش‌ها (مثلاً تبدیل کاربر به ادمین) توسط کلاینت جلوگیری می‌کند.
* **`purge_expired_nodes_and_media()`**: تابع نگهداری دیتابیس که کانفیگ‌ها و پروکسی‌های منقضی‌شده را Soft-Delete (`is_active = false`) و مدیاهای قدیمی را پاکسازی می‌کند.

---

## 6. حجم، ردیف‌ها و آمار جداول (Tables Statistics)
* **جداول آماده پذیرش دیتا:** تمامی جداول در وضعیت عملیاتی با سربار ذخیره‌سازی استاندارد (اندازه بسیار سبک) قرار دارند.
* **جدول `configs`:** دارای ۶ کانفیگ اولیه تست و ایندکس فعال.
* **جدول `profiles` / `auth.users`:** کاربر ادمین به درستی ایجاد شده و ارتباط کلید خارجی `profiles_id_fkey` برقرار است.

---

## 7. یافته‌های امنیتی (Security Analysis)
* **بررسی توابع `SECURITY DEFINER`:**  
  تمام توابع حساس پروژه (`is_admin`, `handle_new_user`, `purge_expired_nodes_and_media`, `get_ticket_by_code`) دارای عبارت صریح `SET search_path = 'public'` هستند که آسیب‌پذیری تزریق Search Path در PostgreSQL را به طور کامل خنثی می‌کند.
* **نتیجه نهایی ممیزی:** دیتابیس ۱۰۰٪ سالم، بدون باگ ساختاری و آماده اتصال مستقیم به کلاینت و موتورهای اتوماسیون است.
