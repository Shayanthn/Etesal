# 🔄 پایپ‌لاین اتوماسیون اخبار n8n (Etesal News Ingestion Pipeline)

این ورک‌فلو کاملاً ماژولار، استاندارد و آماده استفاده در پنل کاربری **n8n** است.

---

## ۱. نحوه ایمپورت و اجرا در n8n (روش ۱ کلیک)

1. فایل `news-ingestion-workflow.json` را باز کرده و تمام محتوای متنی آن را کپی کنید (`Ctrl+A` سپس `Ctrl+C`).
2. وارد پنل **n8n** خود شوید و یک ورک‌فلو جدید (`New Workflow`) باز کنید.
3. در فضای خالی بوم (Canvas)، کلیدهای **`Ctrl + V`** (یا راست‌کلیک و Paste) را بزنید.
4. تمام نودها به صورت خودکار، متصل، مرتب و آماده نمایش داده می‌شوند!

---

## ۲. متغیرهای محیطی مورد نیاز (Environment Variables / Credentials)

در بخش تنظیمات n8n یا نودهای مربوطه، این ۳ متغیر را وارد کنید:

| نام متغیر | توضیح | مقدار پیش‌فرض / پیشنهادی |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | کلید دسترسی رایگان به OpenRouter | دریافت رایگان از [openrouter.ai](https://openrouter.ai/keys) |
| `SUPABASE_URL` | آدرس پروژه Supabase شما | مثلاً `https://xyzcompany.supabase.co` |
| `SUPABASE_ANON_KEY` | کلید پابلیک یا Service Role دیتابیس | از بخش API Settings در Supabase |

---

## ۳. مراحل جریان داده در این ورک‌فلو (Workflow Flow)

```
[۱. کرون جاب زمان‌بندی‌شده (هر ۲ ساعت)]
                  │
                  ▼
[۲. واکشی فیدهای RSS معتبر (دیجیاتو، BleepingComputer، Cloudflare Blog)]
                  │
                  ▼
[۳. فیلتر موضوعی و کلمات کلیدی + حذف تکراری‌ها]
    (بررسی کلمات: VPN, Reality, TLS, Linux, Security, BGP, فیلترینگ، فیبر نوری)
                  │
                  ▼
          [۴. بررسی زبان مقاله]
         ┌────────┴────────┐
         ▼                 ▼
   [مقاله فارسی]     [مقاله انگلیسی]
         │                 │
         │                 ▼
         │          [۵. ترجمه و سئو هوشمند با OpenRouter Free AI]
         │          (مدل رایگان: DeepSeek / Llama 3)
         │          - تولید تیتر جذاب فارسی
         │          - تولید اسلاگ انگلیسی تمیز برای URL
         │          - استخراج ۵ تگ کلیدی
         │                 │
         └────────┬────────┘
                  ▼
[۶. ساختاردهی در فرمت استاندارد NewsArticle]
                  │
                  ▼
[۷. ذخیره آنی در جدول news دیتابیس Supabase (Upsert)]
```

---

## ۴. اسکریپت ساخت جدول `news` در دیتابیس Supabase (SQL Schema)

وقتی در فاز نهایی دیتابیس Supabase را باز کردید، کافیست دستور SQL زیر را در بخش **SQL Editor** دیتابیس اجرا کنید:

```sql
CREATE TABLE IF NOT EXISTS public.news (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  categoryLabelFa TEXT NOT NULL,
  sourceName TEXT NOT NULL,
  sourceUrl TEXT NOT NULL,
  sourceType TEXT NOT NULL DEFAULT 'international',
  author TEXT NOT NULL DEFAULT 'تحریریه اتصال',
  publishedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  readTimeMinutes INT DEFAULT 3,
  imageUrl TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  isBreaking BOOLEAN DEFAULT FALSE,
  viewsCount INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایندکس برای جستجوی سریع و سئو
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news (slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news (category);
CREATE INDEX IF NOT EXISTS idx_news_publishedAt ON public.news (publishedAt DESC);

-- فعال‌سازی دسترسی خواندن عمومی (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public.news FOR SELECT USING (true);
```

---

## ۵. تست و بررسی در n8n
- برای تست سریع، کافیست دکمه **"Test Step"** را روی نود `Filter Niche & Deduplicate` یا `OpenRouter AI` بزنید تا خروجی ساختاریافته ترجمه و تولید اسلاگ را مشاهده کنید.
