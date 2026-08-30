# نقشه راه اجرایی رفع اشکالات امنیتی — پروژه Etesal
**فایل:** `SECURITY-MASTER-REMEDIATION-ROADMAP.md`
**نسخه:** v4 (نسخه اجرایی نهایی — شامل دستورات دقیق SQL/Postman/CLI برای هر آیتم انسانی)
**نوع سند:** Master Remediation Plan + Playbook اجرایی
**مبنا:** ادغام ۳ گزارش ممیزی مستقل (Database/Supabase، Cloudflare، Frontend) + بازبینی سنیور + دستورالعمل گام‌به‌گام برای هر کاری که خود شما باید انجام دهید
**اجراکننده فنی:** Google AI Studio / Claude Code (ادیت کد و تحلیل)
**ناظر و تاییدکننده نهایی:** شما (مالک پروژه)

> 🆕 = تغییر نسبت به نسخه قبلی. 🔧 = بخش دستورات دقیق اجرایی (SQL/Postman/CLI/DevTools).

---

## 🔑 پیش‌نیاز صفر — قبل از شروع هر تستی این‌ها را پیدا کنید

این مقادیر در طول کل سند تکرار استفاده می‌شوند؛ یک‌بار پیدا کنید و جایی امن (نه در چت با AI Studio!) یادداشت کنید:

| متغیر | کجا پیدا می‌شود |
|---|---|
| `<SUPABASE_URL>` | Supabase Dashboard → Settings → API → Project URL (چیزی شبیه `https://xxxx.supabase.co`) |
| `<ANON_KEY>` | همان صفحه → Project API keys → `anon` `public` |
| `<SERVICE_ROLE_KEY>` | همان صفحه → `service_role` `secret` — **هرگز در Postman برای شبیه‌سازی anon استفاده نشود؛ فقط برای SQL Editor** |
| `<USER_JWT>` | لاگین با یک کاربر عادی تستی در اپ → DevTools (F12) → تب Application → Local Storage → کلید `sb-<project-ref>-auth-token` → مقدار `access_token` |
| `<ADMIN_JWT>` | همان کار با یک اکانت ادمین تستی (اگر ندارید، بسازید) |

**نحوه اجرای هر کوئری SQL در این سند:** Supabase Dashboard → SQL Editor → New query → پیست کد → Run.
**نحوه اجرای هر تست Postman:** Postman باز کنید → New → HTTP Request → Method و URL را طبق دستور زیر تنظیم کنید → در تب Headers مقادیر خواسته‌شده را اضافه کنید → Send → پاسخ واقعی (status code + body) را کپی و به AI Studio/Claude Code بدهید.

⚠️ **این سند باید همیشه در کنار ۳ گزارش اصلی ممیزی (Database، Cloudflare، Frontend) خوانده شود.** هرجا مدل به جزئیاتی نیاز داشت که در این سند نبود (مثلاً نام دقیق یک تابع یا خط کد)، باید ابتدا آن گزارش‌ها را چک کند؛ اگر باز هم چیزی روشن نبود، **باید از شما بپرسد و منتظر جواب بماند، نه اینکه حدس بزند و ادامه دهد.**

---

## ⚠️ قوانین طلایی — غیرقابل‌مذاکره

1. **مدرک = دیف واقعی کد.** فایل + شماره خط دقیق قبل/بعد، نه توضیح کلامی.
2. **تست واقعی، نه شبیه‌سازی.** اگر مدل نمی‌تواند تستی را اجرا کند، باید بنویسد `UNTESTED — نیاز به تایید انسانی` و آن را Blocking نگه دارد. **هیچ آیتمی «فرض» PASS نمی‌شود.**
3. **کد deploy‌شده = کد ممیزی‌شده.** تا تایید با `git diff`/`wrangler deployments`، هیچ فازی نهایی نیست.
4. **ممنوعیت حدس‌زدن.** اگر چیزی نامشخص است (نام ستون، ساختار جدول، رفتار یک تابع)، مدل باید **صریحاً بپرسد و متوقف شود**، نه اینکه با فرض ادامه دهد. مثال درست: *"من نام دقیق ستون موجودی در جدول profiles را نمی‌دانم — لطفاً خروجی این کوئری schema discovery را برایم بفرستید تا کوئری بعدی را درست بنویسم."*
5. **هیچ فیکسی مستقیم روی Production تست نمی‌شود** — ابتدا Staging.
6. **هر فیکس دیتابیسی یک اسکریپت Rollback آماده دارد.**
7. **فرض بر این است که تا خلافش با فاز -۱ ثابت نشود، این باگ‌ها ممکن است قبلاً استفاده شده باشند.**
8. 🆕 **قانون بستن یک آیتم (Definition of "Done"):** یک آیتم فقط در یکی از این دو حالت `DONE` می‌شود:
   - (الف) خود مدل یک تست خودکار واقعی (یونیت‌تست در کد پروژه) نوشته، اجرا کرده، و خروجی واقعی ترمینال را نشان داده است؛ **یا**
   - (ب) شما خروجی واقعی یک تست دستی (نتیجه‌ی واقعی Postman/SQL/DevTools — نه توضیح، بلکه response/output واقعی کپی‌شده) را به مدل داده‌اید، و مدل آن خروجی را تحلیل کرده و صراحتاً توضیح داده چرا این خروجی یعنی PASS یا FAIL.
   هیچ آیتمی صرفاً با نوشتن «انجام شد» یا «باید کار کند» بسته نمی‌شود.
9. 🆕 **همیشه بر مبنای کد واقعی پیش برود.** قبل از هر فیکس، فایل واقعی را باز/بخواند (نه بر اساس حافظه یا فرض از روی نام فایل)، خط دقیق مشکل را پیدا کند، و بعد از فیکس، فایل را دوباره بخواند تا مطمئن شود دقیقاً همان چیزی است که فکر می‌کند.
10. 🆕 این فایل، به‌همراه ۳ گزارش اصلی ممیزی، **مرجع واحد اجرا (Single Source of Truth)** است. هر انحراف از این سند باید صریحاً توضیح داده و از شما تایید گرفته شود.

---

## 🧭 نقشه کلی فازها

| فاز | عنوان | مجری | پیش‌نیاز |
|---|---|---|---|
| فاز -۱ | ارزیابی جرم‌شناسانه | **فقط شما (با کوئری‌های آماده)** | هیچ‌کدام |
| فاز ۰ | پیش‌نیازهای غیرقابل واگذاری به AI | **فقط شما** | فاز -۱ |
| فاز ۱ | رفع بحرانی‌های مسدودکننده | AI + شما (تست با دستورات آماده) | فاز ۰ شروع‌شده |
| فاز ۲ | رفع پرخطرهای غیرمسدودکننده | AI + شما | فاز ۱ کامل |
| فاز ۳ | سخت‌سازی Low/Info | AI | فاز ۲ کامل |
| فاز ۴ | تست نفوذ نهایی (Postman/curl Playbook کامل) | **فقط شما** | فاز ۱–۳ کامل |
| فاز ۵ | تصمیم نهایی + امتیازدهی | شما + مدل | فاز ۴ کامل |
| فاز ۶ | مانیتورینگ پس از انتشار | شما + AI | فاز ۵ = GO |

**قانون توقف:** حتی یک UNKNOWN/UNTESTED در فاز -۱، ۰ یا ۴ ⇒ `ABORT`، صرف‌نظر از باقی فازها.

---

## فاز -۱ — ارزیابی جرم‌شناسانه (آیا قبلاً سوءاستفاده شده؟)

> توجه: چون پروژه هنوز به‌صورت عمومی در دسترس کاربران واقعی نبوده، احتمال یافتن سوءاستفاده واقعی کم است — اما این فاز باید همچنان **رسمی و با مدرک واقعی** بسته شود، نه با حدس. نیازی به فایل جداگانه‌ی Incident نیست؛ نتیجه را همین‌جا (در پاسخ خودتان به AI Studio) گزارش کنید.

### 🔧 گام صفر (اجباری قبل از هر کوئری): کشف ساختار واقعی جداول

نام دقیق ستون‌های `wallet_transactions` و ستون موجودی در `profiles` را از قبل مطمئن نیستیم. **این کوئری را اول اجرا کنید و خروجی را نگه دارید:**

```sql
-- ساختار دقیق جدول تراکنش‌های کیف‌پول
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'wallet_transactions'
ORDER BY ordinal_position;

-- ساختار دقیق جدول profiles (برای پیدا کردن ستون موجودی)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```

⚠️ کوئری‌های زیر (-1.1 و -1.2) بر اساس نام‌های **فرضی و رایج** (`user_id`, `amount`, `type`, `status`, `payment_reference`, `created_at` برای wallet_transactions و `wallet_balance` برای profiles) نوشته شده‌اند. **اگر خروجی گام صفر نام‌های متفاوتی نشان داد، قبل از اجرای بقیه کوئری‌ها نام‌ها را اصلاح کنید یا از AI Studio/Claude Code بخواهید بر اساس خروجی واقعی، کوئری را بازنویسی کند.**

### 🔧 -1.1 — تراکنش‌های واریز مشکوک

```sql
-- الف) واریزهایی که کد رهگیری ندارند (نباید ممکن باشد چون tracking_code UNIQUE NOT NULL است؛
--     اگر ردیفی برگشت یعنی یک مسیر دور زده‌شده برای این قید وجود دارد)
SELECT * FROM public.wallet_transactions
WHERE type = 'deposit' AND (tracking_code IS NULL OR tracking_code = '')
ORDER BY created_at DESC LIMIT 500;

-- ب) کاربران با تعداد واریز غیرعادی بالا
SELECT user_id, COUNT(*) AS deposit_count, SUM(amount_toman) AS total_deposited_toman
FROM public.wallet_transactions
WHERE type = 'deposit'
GROUP BY user_id
ORDER BY deposit_count DESC LIMIT 50;

-- ج) بزرگترین واریزهای ثبت‌شده
SELECT * FROM public.wallet_transactions
WHERE type = 'deposit'
ORDER BY amount_toman DESC LIMIT 50;

-- د) هر تراکنشی با status='completed' که gateway آن مقادیر غیرمنتظره دارد
--     (برای این پروژه gateway های معتبر: card_to_card, crypto_usdt, direct_payment, bonus, manual)
SELECT * FROM public.wallet_transactions
WHERE status = 'completed'
ORDER BY created_at DESC LIMIT 200;
```

**خروجی مورد انتظار برای PASS:** هر سه کوئری یا نتیجه خالی برمی‌گردانند، یا تمام ردیف‌های برگشتی با بررسی دستی قابل توجیه‌اند.

### 🔧 -1.2 — Mismatch بین موجودی ذخیره‌شده و مجموع تراکنش‌های واقعی

```sql
SELECT
    user_id,
    COALESCE(SUM(CASE WHEN type IN ('deposit','gift','refund') AND status='completed' THEN amount_toman ELSE 0 END), 0)
  - COALESCE(SUM(CASE WHEN type = 'plan_purchase' AND status='completed' THEN amount_toman ELSE 0 END), 0)
    AS calculated_balance_toman
FROM public.wallet_transactions
GROUP BY user_id
ORDER BY calculated_balance_toman DESC;
```

**خروجی مورد انتظار برای PASS:** صفر ردیف. هر ردیفی که برگردد، یعنی موجودی آن کاربر با تراکنش‌های تاییدشده هم‌خوانی ندارد و باید دستی بررسی شود.

### 🔧 -1.3 — الگوی Scraping روی `profiles`

Supabase Dashboard → **Logs** → **Logs Explorer** (نه Postgres Logs معمولی) → یک New Query بسازید و این را پیست کنید:

```sql
select
  timestamp, event_message, request.method, request.path, response.status_code
from edge_logs
cross join unnest(metadata) as m
cross join unnest(m.request) as request
cross join unnest(m.response) as response
where request.path like '%/rest/v1/profiles%'
order by timestamp desc
limit 200;
```

**چه چیزی را نگاه کنید:** آیا در یک بازه زمانی کوتاه، تعداد بسیار زیادی درخواست GET به `/profiles` از یک IP یا بدون هیچ `Authorization` هدر معتبر ثبت شده؟ اگر Logs Explorer محدودیت نگهداری کوتاه دارد (پلن رایگان معمولاً ۱ روز)، این را در گزارش قید کنید: `UNKNOWN — لاگ‌های قدیمی‌تر در دسترس نیست`.

### 🔧 -1.4 — Brute-force احتمالی روی `get_ticket_by_code`

همان Logs Explorer، کوئری جدید:

```sql
select
  timestamp, event_message, request.method, request.path, response.status_code
from edge_logs
cross join unnest(metadata) as m
cross join unnest(m.request) as request
cross join unnest(m.response) as response
where request.path like '%get_ticket_by_code%'
order by timestamp desc
limit 200;
```

**چه چیزی را نگاه کنید:** فراخوانی‌های مکرر و متوالی با کدهای تیکت مختلف از یک منبع، در بازه زمانی کوتاه.

> نتیجه فاز -۱ (خلاصه‌ای از خروجی هر ۴ کوئری، حتی اگر «چیزی یافت نشد» باشد) را مستقیماً در پیام بعدی به AI Studio/Claude Code بدهید تا فاز ۰ شروع شود.

---

## فاز ۰ — کارهای غیرقابل‌واگذاری به AI

### 0.1 بررسی PITR
Supabase Dashboard → پروژه خود → **Settings** → **Add-ons** یا **Database** → بخش **Point in Time Recovery**. اسکرین‌شات بگیرید یا وضعیت (Enabled/Disabled + تعداد روز نگهداری) را یادداشت کنید.

### 🔧 0.2 شناسایی لایه ۴۰۳
**گام ۱ (Dashboard):** Cloudflare Dashboard → دامنه `aetherai.ir` → **Security** → **WAF** → **Custom rules** — لیست قوانین را ببینید، آیا قانونی هست که مسیرهای `/api/*` یا `/validate` را بلاک می‌کند؟
سپس: **Zero Trust** → **Access** → **Applications** — آیا اپلیکیشنی برای این دامنه/ساب‌دامنه تعریف شده که نیاز به احراز هویت قبل از رسیدن به Worker دارد؟

**گام ۲ (تایید با curl):** بعد از هر تغییر احتمالی، این را اجرا کنید:
```bash
curl -i -X POST https://etesal.aetherai.ir/api/validate \
  -H "Content-Type: application/json" \
  -d '{}'
```
اگر همچنان `403 Forbidden` با هدر مشخصه‌ی WAF/Access برگشت، لایه هنوز فعال است.

### 🔧 0.3 تطابق کد Deploy شده با کد ممیزی‌شده
```bash
# لیست تمام دیپلوی‌های worker با تاریخ و هش
npx wrangler deployments list --name etesal-validator

# دانلود کد فعلی که واقعا روی Cloudflare اجراست (در صورت پشتیبانی نسخه wrangler شما)
npx wrangler download --name etesal-validator > deployed-current.js

# مقایسه با نسخه‌ی موجود در ریپو
diff deployed-current.js src/index.ts   # مسیر فایل واقعی worker را جایگزین کنید
```
اگر دستور `download` در نسخه wrangler شما نبود، حداقل هش/تاریخ آخرین دیپلوی را با آخرین commit مرتبط در `git log --oneline -10` مقایسه کنید تا مطمئن شوید dیپلوی جدیدتر از commit ممیزی‌شده نیست (یعنی چیز ناشناخته‌ای دیپلوی نشده).

### 🔧 0.4 و 0.6 تست دود اولیه + بررسی هدرهای امنیتی
```bash
curl -I https://etesal.aetherai.ir/
curl -I https://etesal.aetherai.ir/sitemap.xml
curl -I https://etesal.aetherai.ir/robots.txt
```
بررسی کنید هدرهای `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy` وجود دارند یا نه — یادداشت کنید کدام‌ها موجودند و کدام غایب.

### 🔧 0.5 تست anon/JWT (Postman) — نسخه مقدماتی
Postman → New Request:
- Method: `GET`
- URL: `<SUPABASE_URL>/rest/v1/profiles?select=*`
- Headers: `apikey: <ANON_KEY>` (بدون Authorization — یعنی anon واقعی)
- Send

نتیجه را نگه دارید؛ این دقیقاً همان تستی است که در فاز ۱.C دوباره (بعد از فیکس) تکرار می‌شود تا قبل/بعد مقایسه شود.

### 🔧 0.9 چرخش کلیدهای حساس
- **Supabase:** Dashboard → Settings → API → کنار `service_role` و `anon` دکمه Regenerate (⚠️ بعد از این، تمام جاهایی که از کلید قدیمی استفاده می‌کردند — Worker secrets، کد کلاینت اگر anon تغییر کرده — باید آپدیت شوند).
- **Cloudflare Worker secret جدید:**
```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name etesal-validator
# سپس مقدار جدید را وقتی prompt پرسید paste کنید
```
- **توکن ربات تلگرام:** در BotFather → `/mybots` → انتخاب ربات → API Token → Revoke current token → دریافت توکن جدید → جایگزینی در Worker secret مشابه دستور بالا.

### 🔧 0.10 اسکن Git history برای Secret نشتی‌شده
```bash
# نصب gitleaks (یک‌بار)
brew install gitleaks   # یا برای لینوکس: از github.com/gitleaks/gitleaks/releases باینری را دانلود کنید

# اجرای اسکن کامل روی تاریخچه ریپو
cd /path/to/repo
gitleaks detect --source . --verbose --report-path gitleaks-report.json
```
خروجی `gitleaks-report.json` را کامل به AI Studio/Claude Code بدهید تا هر finding را دانه‌به‌دانه بررسی و طبقه‌بندی کند (واقعی/false-positive).

### 0.11 محیط Staging
یک پروژه دوم و مجزا در Supabase بسازید (Free tier کافیست) و یک Cloudflare Worker با نام متفاوت (`etesal-validator-staging`) دیپلوی کنید. تمام فیکس‌های فاز ۱ تا ۳ ابتدا اینجا اعمال و تست می‌شوند.

### 0.12 بررسی بیلدهای قدیمی
اگر روی Cloudflare Pages هاست شده: Dashboard → Pages پروژه → **Deployments** → چند دیپلوی قدیمی را باز کنید → View build → در فایل‌های JS منتشرشده جستجو کنید (Ctrl+F در Source واقعی مرورگر) به‌دنبال رشته `ADMIN_PASSWORD_HASH` یا هر secret دیگر.

---

## فاز ۱ — بحرانی و مسدودکننده

### 1.A فرانت‌اند

**F-01 (Admin Guard) — 🔧 تست بعد از فیکس:**
1. با یک اکانت کاملاً عادی (غیرادمین) لاگین کنید.
2. در آدرس‌بار مرورگر مستقیماً به `https://etesal.aetherai.ir/admin` بروید.
3. انتظار: ریدایرکت یا صفحه‌ی دسترسی غیرمجاز — **نه** داشبورد ادمین.
4. اضافی (DevTools Console بعد از لاگین با کاربر عادی):
```js
const { data, error } = await supabase.rpc('is_admin');
console.log({ data, error });
// انتظار: data === false
```

**F-02 (Wallet) — 🔧 تست بعد از فیکس (هم DevTools هم Postman):**

DevTools Console (بعد از لاگین با کاربر عادی، در صفحه داشبورد):
```js
const { data, error } = await supabase.rpc('process_wallet_deposit', { amount: 999999999 });
console.log({ data, error });
// انتظار: error غیر-null (رد شده)، موجودی نمایشی صفحه تغییر نکند
```

Postman:
- Method: `POST`
- URL: `<SUPABASE_URL>/rest/v1/rpc/process_wallet_deposit`
- Headers: `apikey: <ANON_KEY>` و `Authorization: Bearer <USER_JWT>` و `Content-Type: application/json`
- Body (raw JSON): `{ "amount": 999999999 }`
- انتظار: کد پاسخ `4xx` (نه `200` با موجودی افزایش‌یافته)

**F-03 (XSS) — 🔧 تست بعد از فیکس:**
1. با اکانت ادمین (یا هرکسی که اجازه‌ی درج/ویرایش مقاله دارد) یک مقاله تستی بسازید یا یکی موجود را ویرایش کنید.
2. در فیلد محتوا این را بگذارید: `<img src=x onerror="alert('XSS-TEST-'+document.cookie)">`
3. مقاله را ذخیره کنید و به‌عنوان یک خواننده‌ی معمولی (یا حالت Incognito) صفحه مقاله را باز کنید.
4. انتظار: هیچ alert بازی نمی‌شود؛ در View Source محتوای تگ `img` باید حذف/escape شده باشد.
5. **حتماً بعد از تست، محتوای تستی را از دیتابیس پاک کنید.**

**F-04 (دامنه غلط) — 🔧 تایید:**
```bash
grep -rn "aeherai" src/
# انتظار: هیچ خروجی (صفر نتیجه)
```

### 1.B Cloudflare Worker — SSRF (🔧 یونیت‌تست‌های اجباری)

از AI Studio بخواهید این ۴ تست را عیناً به فایل تست پروژه (مثلاً `isPrivateIP.test.ts`) اضافه و اجرا کند؛ خروجی واقعی ترمینال (`PASS`/`FAIL`) باید نشان داده شود:

```ts
import { isPrivateIP } from '../src/isPrivateIP'; // مسیر واقعی را جایگزین کنید

describe('isPrivateIP - SSRF regression tests', () => {
  it('F-01: full-form IPv6 loopback must be detected as private', () => {
    expect(isPrivateIP('0:0:0:0:0:0:0:1')).toBe(true);
  });

  it('F-02: IPv4-compatible IPv6 loopback must be detected as private', () => {
    expect(isPrivateIP('::127.0.0.1')).toBe(true);
  });

  it('F-03: IPv4-mapped IPv6 with extra zero group must be detected as private', () => {
    expect(isPrivateIP('::ffff:0:127.0.0.1')).toBe(true);
  });

  it('F-04: unknown/unparseable format must Fail-Closed (treated as private/unsafe)', () => {
    expect(isPrivateIP('not-a-valid-ip-format')).toBe(true);
  });

  it('F-06: benchmarking range 198.18.0.0/15 must be detected as private', () => {
    expect(isPrivateIP('198.18.0.1')).toBe(true);
    expect(isPrivateIP('198.19.255.254')).toBe(true);
  });
});
```

اجرا: `npm test isPrivateIP` — خروجی واقعی (تعداد PASS/FAIL) باید کپی و ضمیمه شود.

**F-05 (Rate Limiting) — 🔧 تست:**
```bash
for i in $(seq 1 50); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://etesal.aetherai.ir/api/validate \
    -H "Content-Type: application/json" -d '{"url":"https://example.com"}'
done
```
انتظار: بعد از چند درخواست اول، کدهای `429` شروع شوند.

### 1.C دیتابیس — Public Profiles (🔧 تست قبل/بعد با Postman)

**قبل از فیکس (برای مستندسازی مشکل):**
- Method: `GET`, URL: `<SUPABASE_URL>/rest/v1/profiles?select=*`
- Headers: فقط `apikey: <ANON_KEY>` (بدون Authorization)
- انتظار قبل از فیکس: `200` با تمام ردیف‌های جدول profiles.

**بعد از فیکس:** همان درخواست را دوباره بفرستید.
- انتظار بعد از فیکس: `200` با آرایه خالی `[]`، یا `401`/`403` — بسته به روش رمدییشن انتخابی.

### 🔧 1.D بررسی بدنه توابع SECURITY DEFINER

```sql
-- تعریف کامل تابع is_admin
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace;

-- دامپ کامل RLS تمام جداول
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'wallet_transactions','user_subscriptions','support_tickets',
    'proxies','configs','news','articles','telegram_media_queue'
  )
ORDER BY tablename, policyname;

-- بررسی Storage buckets (اگر استفاده می‌شود)
SELECT id, name, public, created_at FROM storage.buckets;

SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

خروجی این ۳ کوئری را کامل به AI Studio/Claude Code بدهید تا هرکدام را جداگانه تحلیل و برای هر جدول یک ردیف در گزارش نهایی مثل بخش 1.C اضافه کند.

---

## فاز ۲ — پرخطر/متوسط

### 2.A دیتابیس

**#2 (REVOKE) — 🔧 اعمال و تایید:**
```sql
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_change_by_non_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_expired_nodes_and_media() FROM anon, authenticated;

-- تایید که واقعا اعمال شد
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user','prevent_role_change_by_non_admin','purge_expired_nodes_and_media')
ORDER BY routine_name, grantee;
-- انتظار: هیچ ردیفی با grantee = 'anon' یا 'authenticated' دیگر نباشد
```
**🔧 تست رگرسیون بعد از REVOKE:** یک اکانت جدید در اپ ثبت‌نام کنید (signup واقعی از UI). اگر ثبت‌نام موفق بود و پروفایل ساخته شد یعنی trigger داخلی `handle_new_user` (که مستقل از EXECUTE grant کار می‌کند) سالم مانده است.

### 2.D سخت‌سازی احراز هویت

**🔧 NEW-5 تست Rate Limit روی لاگین:**
```bash
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "<SUPABASE_URL>/auth/v1/token?grant_type=password" \
    -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
done
```
انتظار: بعد از چند تلاش، محدودیت اعمال شود (429 یا قفل موقت اکانت).

**🔧 NEW-6 بررسی JWT expiry:** Supabase Dashboard → Authentication → Settings → **JWT expiry limit** — مقدار فعلی را یادداشت و بسنجید آیا منطقی است (مثلاً ۳۶۰۰ ثانیه معمول است؛ اعداد خیلی بزرگ ریسک‌زا هستند).

**🔧 NEW-7 فعال‌سازی MFA برای ادمین:** Supabase Dashboard → Authentication → Providers → **Multi-Factor Authentication** را فعال کنید؛ سپس در منطق فرانت‌اند، برای نقش‌های admin/super_admin ورود بدون MFA کامل را مسدود کنید (نیاز به تغییر کد دارد — تیکت مجزا برای AI Studio بسازید).

---

## فاز ۳ — سخت‌سازی

**🔧 NEW-8 اسکن Dependency:**
```bash
npm audit --production
# در صورت وجود آسیب‌پذیری قابل رفع:
npm audit fix
```
خروجی کامل (تعداد و شدت هر آسیب‌پذیری) را ضمیمه کنید.

---

## فاز ۴ — Playbook کامل تست نفوذ نهایی (Postman/curl)

هر آیتم زیر باید با نتیجه واقعی (status code واقعی + بخشی از body واقعی) گزارش شود، نه صرفاً ✅.

| # | تست | روش دقیق |
|---|---|---|
| 1 | `POST /api/validate` با anon | Postman: `POST https://etesal.aetherai.ir/api/validate`, Header `Content-Type: application/json`, Body `{"url":"http://127.0.0.1/"}` — باید رد شود (نه 200 موفق) |
| 2 | `GET /sitemap.xml`, `/robots.txt` | `curl -i https://etesal.aetherai.ir/sitemap.xml` و مشابه برای robots.txt |
| 3 | `GET /` صفحه اصلی | `curl -i https://etesal.aetherai.ir/` |
| 4 | `GET /admin` بدون لاگین ادمین | مرورگر Incognito → مستقیم به `/admin` بروید |
| 5 | `GET /some-random-route` (SPA fallback) | `curl -i https://etesal.aetherai.ir/this-route-does-not-exist` — باید 200 + index.html برگرداند |
| 6 | Path Traversal | `curl -i "https://etesal.aetherai.ir/%2e%2e/admin"` |
| 7 | هدرهای امنیتی | `curl -I https://etesal.aetherai.ir/` — چک `nosniff`, `X-Frame-Options`, `HSTS`, `CSP` |
| 8 | CORS با Origin مخرب | Postman → Header دستی `Origin: https://evil.com` روی یک درخواست به API — باید در پاسخ `Access-Control-Allow-Origin` غایب یا متفاوت باشد |
| 9 | anon SELECT روی profiles | طبق بخش 1.C بالا |
| 10 | anon SELECT روی جداول دیگر | همان روش 1.C را برای هرکدام از سایر جداول تکرار کنید |
| 11 | فراخوانی SECURITY DEFINER با anon | Postman: `POST <SUPABASE_URL>/rest/v1/rpc/handle_new_user` با فقط apikey (بدون Bearer) — باید خطای دسترسی بدهد |
| 12 | SSRF واقعی | همان ۴ ورودی یونیت‌تست فاز ۱.B را این‌بار به‌صورت درخواست واقعی به `/api/validate` بفرستید |
| 13 | دستکاری کیف‌پول (DevTools + Postman) | طبق بخش F-02 بالا |
| 14 | XSS واقعی | طبق بخش F-03 بالا |
| 15 | PITR | طبق 0.1 |

---

## فاز ۵ — تصمیم نهایی و امتیازدهی سخت‌گیرانه

### 🔧 جدول امتیازدهی (Security Score) — هیچ عددی دلخواه نیست

شروع از **۱۰٫۰** و طبق این جدول کم می‌شود:

| شرط | کسر امتیاز |
|---|---|
| حتی یک آیتم Blocking در فاز ۱ باز/UNTESTED باشد | امتیاز بی‌معنی می‌شود → مستقیم `VERDICT: ABORT`، امتیاز گزارش نشود |
| هر آیتم فاز ۲ ناقص یا بدون تست واقعی | −۰٫۳ (حداکثر مجموع −۱٫۵) |
| هر آیتم فاز ۳ ناقص | −۰٫۱۵ (حداکثر مجموع −۱٫۰) |
| فاز ۶ (مانیتورینگ) راه‌اندازی نشده | −۰٫۵ |
| هر آیتم چک‌لیست فاز ۴ که واقعاً اجرا نشده (فقط ادعا شده) | −۱٫۰ به ازای هر مورد |
| گزارش نهایی بدون دیف/خروجی واقعی برای حداقل یک فیکس | −۲٫۰ |

### قالب خروجی نهایی الزامی

مدل فقط زمانی مجاز است این بلاک را بنویسد که چک‌لیست بالا را واقعاً مرور کرده باشد:

```
[ VERDICT: GO / CONDITIONAL-GO / ABORT ]
[ STATUS: READY FOR DEPLOYMENT / BLOCKED / NOT READY ]
[ SECURITY SCORE: X.X/10 ]
[ کسورات اعمال‌شده: لیست دقیق هر مورد که امتیاز کم کرده ]
```

قانون: اگر حتی یک Blocking باز باشد، ترکیب `VERDICT: GO` با هر عددی غیرقابل‌قبول است — این ترکیب یعنی مدل قانون را نقض کرده.

---

## فاز ۶ — مانیتورینگ پس از انتشار

| # | کار | 🔧 دستور |
|---|---|---|
| 6.1 | Alert روی دسترسی غیرعادی به profiles/wallet_transactions | در Logs Explorer کوئری‌های بخش -۱.۳ را ذخیره کنید (Save query) و اگر پلن اجازه می‌دهد، Alert بسازید |
| 6.2 | Audit log اقدامات ادمین | جدول جدید `admin_audit_log (admin_id, action, target, created_at)` + تریگر یا کد اپ که هر اکشن ادمین را ثبت کند (تیکت جدید برای AI Studio) |
| 6.3 | Alert روی برخورد به Rate Limit/WAF | Cloudflare Dashboard → Security → Events → فیلتر بر اساس Action=Block، بررسی روزانه/هفتگی |
| 6.4 | ممیزی دوره‌ای | یادآور تقویمی هر ۳ ماه برای تکرار همین سند |
| 6.5 | تست واقعی Restore از PITR | Supabase Dashboard → Database → Backups → Restore به یک پروژه تستی جدا (نه production!) و تایید سالم‌بودن داده |

---

## 📋 تمپلیت پرامپت برای AI Studio / Claude Code

```
نقش تو: مهندس امنیت senior که فقط بر اساس کد و مدارک واقعی کار می‌کند.

قوانین سخت‌گیرانه:
1. قبل از هر فیکس، فایل واقعی را بخوان (نه از حافظه)؛ خط دقیق را پیدا کن.
2. قبل از هر ادعای "درست شد"، دیف دقیق کد (قبل/بعد) با شماره خط نشان بده.
3. اگر برای تست این فیکس نیاز به چیزی داری که در اختیارت نیست (HTTP request،
   دسترسی Dashboard، داده production)، بنویس: "UNTESTED — نیاز به تایید انسانی."
   هرگز وانمود نکن تستی را اجرا کرده‌ای که نکرده‌ای.
4. اگر چیزی درباره ساختار پروژه (نام ستون، رفتار یک تابع، معماری) نامشخص است،
   از من بپرس و منتظر جواب من بمان — حدس نزن و ادامه نده.
5. این فایل (SECURITY-MASTER-REMEDIATION-ROADMAP.md) و ۳ گزارش اصلی ممیزی
   مرجع تو هستند. هرجا لازم بود آن‌ها را دوباره بخوان.
6. یک آیتم فقط با یکی از این دو حالت DONE می‌شود: (الف) تو خودت یک تست خودکار
   واقعی نوشتی و اجرا کردی و خروجی واقعی نشان دادی، یا (ب) من نتیجه واقعی یک
   تست دستی (SQL/Postman/DevTools) را به تو دادم و تو آن را تحلیل کردی.
7. در پایان هر تیکت خروجی را در این قالب بده:
   - فایل تغییر یافته
   - دیف کامل
   - یونیت‌تست نوشته شد؟ (بله/خیر + کد)
   - نیاز به تایید دستی من دارد؟ (بله/خیر + دقیقاً چه تستی طبق این سند)

تیکت:
[شماره فاز و ID را از این سند کپی کنید]
```

---

## خلاصه مسئولیت‌ها

| مسئول | کارها |
|---|---|
| **AI Studio/Claude Code** | ادیت کد در فازهای ۱–۳ + نوشتن یونیت‌تست‌ها |
| **شما** | اجرای تمام کوئری‌های SQL و تست‌های Postman/DevTools/curl بالا و برگرداندن نتیجه واقعی؛ تمام فاز -۱، ۰، ۴، ۶؛ تصمیمات محصولی |
| **مشترک** | تحلیل نتایج واقعی‌ای که شما می‌دهید، توسط مدل |

پایان سند — نسخه v4.

---

## 🆕 موارد اضافه‌شده از گزارش‌های جدید (ادغام یکپارچه)
این بخش شامل تمامی آیتم‌های عملیاتی، تست‌ها و آسیب‌پذیری‌های استخراج‌شده از ۸ گزارش مکمل است که در ساختار اولیه نقشه راه قرار نداشتند.

### فاز ۰ (پیش‌نیازها و پیکربندی پایه اضافه شده)
* **[منبع: cloudflarelastreport.md - بخش Routing & Security]** بررسی وجود فایل `wrangler.toml` کامل برای اطمینان از اعمال صحیح پیکربندی‌های ورکرها و عدم استفاده از مقادیر پیش‌فرض ناامن.
* **[منبع: frontendlastreport.md - بخش F-08]** متغیر مرده `VITE_ADMIN_PASSWORD_HASH` باید از `.env.example` پاک شود تا منجر به سردرگمی و ریسک افشای الگوهای پسورد نشود.
* **[منبع: MASTER_SECRETS_AND_ENV_MATRIX.md - جدول سکرت‌ها]** اطمینان از تنظیم دقیق متغیرهای حیاتی علاوه بر کلیدهای دیتابیس شامل: `ALLOWED_ORIGIN`، `TELEGRAM_WEBHOOK_SECRET`، `BASE_URL`، `TELEGRAM_CHANNEL_ID`، `TELEGRAM_ADMIN_ID` و `OPENROUTER_API_KEY` در محیط‌های n8n و Cloudflare Workers (در صورت عدم مقداردهی، جریان‌های کاری متوقف می‌شوند).

### فاز ۱ (اقدامات بحرانی اضافه شده)
* **[منبع: supabaselastreport.md - بخش Brute-force]** محدودسازی و ایمن‌سازی تابع `get_ticket_by_code`. وجود شرط `t.user_id IS NULL` منجر به نشت اطلاعات تیکت‌های مهمان از طریق حملات Brute-force می‌شود (نیازمند اعمال Rate Limiting یا تغییر ساختار کد تیکت به UUID).
* **[منبع: frontendlastreport.md - بخش F-05 و cloudflarelastreport.md]** ایجاد فایل `public/_redirects` با محتوای `/* /index.html 200` برای حل مشکل خطای ۴۰۴ کلودفلر در مسیرهای SPA (مانند رفرش شدن روی مسیر `/admin`).
* **[منبع: cloudflarelastreport.md - بخش F-HR]** ایجاد فایل `public/_headers` با هدرهای امنیتی (nosniff, DENY, HSTS, CSP, Referrer-Policy) برای تمامی Assets تا از حملات Clickjacking و MIME-sniffing جلوگیری شود.

### فاز ۲ (اقدامات متوسط و پرخطر اضافه شده)
* **[منبع: frontendlastreport.md - بخش F-06]** پیاده‌سازی Code Splitting برای `MasterAdminDashboard` با استفاده از `React.lazy()` و `Suspense` تا منطق تجاری ادمین در باندل کلاینت عمومی نشت نکند.
* **[منبع: frontendlastreport.md - بخش F-07]** افزودن فیلد `server: { allowNavigation: ["etesal.aetherai.ir"] }` به فایل `capacitor.config.ts` جهت محدودسازی دامنه‌های مجاز در Webview اندروید و پیشگیری از هدایت به بدافزار.
* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۱]** ست کردن وب‌هوک تلگرام در API اصلی تلگرام همراه با هدر `X-Telegram-Bot-Api-Secret-Token` و تست اتصال با ارسال دستور `/ping` به ربات.
* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۱]** تنظیم دقیق متغیرهای `SUPABASE_URL` و `SUPABASE_ANON_KEY` به‌صورت اختصاصی برای ورکر سایت‌مپ (`etesal-sitemap-worker`).
* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۲]** فعال‌سازی Triggerهای زمان‌بندی (Cron) در n8n برای تمامی پایپ‌لاین‌های اسکرپ و اخبار، پس از اتمام تست‌های اولیه.

### فاز ۴ (تست‌های نهایی عملیاتی و n8n اضافه شده به Playbook)
* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۱]** اجرای دستی پایپ‌لاین `1-config-ingestion.json` در n8n: اطمینان از عدم تایم‌اوت نود ۳، حذف کانفیگ‌های تکراری در نود ۶ و درج موفقیت‌آمیز در جدول `configs`.
* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۲]** اجرای دستی پایپ‌لاین `2-proxy-ingestion.json` در n8n: اطمینان از استخراج و ذخیره صحیح پروکسی‌های سالم در جدول `proxies`.
* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۳]** اجرای دستی پایپ‌لاین‌های `4-news` و `5-news` در n8n: اطمینان از اتصال موفق به OpenRouter (بدون خطای ۴۰۰) و درج صحیح خبر به همراه مارک‌داون.
* **[منبع: PRODUCTION_TESTING_RUNBOOK.md - تست ۳.۴]** اجرای دستی `3-telegram-viral-bot.json`: ارسال متن/عکس از اکانت ادمین به ربات، بررسی واکشی ۳ پروکسی فعال، پیوست شدن آن‌ها به کپشن و فوروارد پست به کانال اصلی.
* **[منبع: cloudflarelastreport.md - تست ۲.۴]** تست رفرش سخت فرانت‌اند (SPA Refresh): باز کردن آدرس `/admin` و فشردن `Ctrl+F5` برای تایید اینکه مسیر مستقیماً لود می‌شود و خطای ۴۰۴ کلودفلر ظاهر نمی‌گردد.
* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۳]** تست عملکرد ابزار پینگ زنده کانفیگ‌ها در صفحه داشبورد از طریق API ورکر کلودفلر.
* **[منبع: ACTIVE_REMEDIATION_AND_TASKS.md - فاز ۲.۳]** کپی کردن کانفیگ از محیط کلاینت وب/اندروید و Paste کردن آن در تلگرام برای اطمینان از عدم حذف یا بهم‌ریختگی کاراکترهای خاص.
