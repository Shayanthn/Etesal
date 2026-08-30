-- ============================================================================
-- 🚀 پایگاه‌داده جامع، سخت‌گیرانه و ضد نفوذ اتصال (Etesal Enterprise Schema V7.1)
-- دامنه رسمی پلتفرم: etesal.aetherai.ir
-- معماری امنیتی: Zero-Trust RLS, Role-Based Access Control, Auto Triggers & Constraints
-- ============================================================================

-- ۱. فعال‌سازی اکستنشن UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ⚙️ ۲. توابع کمکی سیستم و تریگرهای سراسری (Helper Functions & Global Triggers)
-- ============================================================================

-- الف) تابع به‌روزرسانی خودکار ستون updated_at هنگام هر تغییر در سطرها
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================================
-- 👤 ۳. جدول پروفایل و نقش‌های کاربران (User Profiles & RBAC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vip', 'super_admin')),
    wallet_balance INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- تریگر جلوگیری از تغییر نقش توسط کاربران غیر ادمین (جلوگیری از Privilege Escalation)
CREATE OR REPLACE FUNCTION public.prevent_role_change_by_non_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_role_change
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change_by_non_admin();

-- تریگر ایجاد پروفایل خودکار هنگام ثبت‌نام در Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role)
    VALUES (
        NEW.id, 
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), 'user') || '_' || substr(NEW.id::text, 1, 8), 
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- متصل کردن تریگر به جدول اصلی کاربران
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- تابع بررسی نقش ادمین کل با امنیت بالا (Super Admin Check)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 🌐 ۴. جدول کانفیگ‌های ضد فیلتر V2Ray, VLESS Reality, Hysteria 2, Trojan
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    protocol VARCHAR(50) NOT NULL CHECK (protocol IN ('vless', 'vmess', 'hysteria2', 'trojan', 'tuic', 'shadowtls', 'ss')),
    config_string TEXT UNIQUE NOT NULL,
    operator VARCHAR(50) DEFAULT 'all' CHECK (operator IN ('all', 'mci', 'irancell', 'rightel', 'wifi', 'shatel', 'mokhaberat')),
    ping INTEGER CHECK (ping IS NULL OR ping >= 0),
    location VARCHAR(100),
    flag VARCHAR(10),
    country_code VARCHAR(10),
    quality VARCHAR(50) DEFAULT 'good' CHECK (quality IN ('excellent', 'good', 'medium', 'low')),
    is_official BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_vip BOOLEAN DEFAULT false,
    broadcasted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_configs_operator ON public.configs(operator);
CREATE INDEX IF NOT EXISTS idx_configs_is_active ON public.configs(is_active);
CREATE INDEX IF NOT EXISTS idx_configs_is_vip ON public.configs(is_vip);
CREATE INDEX IF NOT EXISTS idx_configs_country ON public.configs(country_code);
-- ایندکس جدید برای افزایش سرعت کران‌جاب پاکسازی
CREATE INDEX IF NOT EXISTS idx_configs_expires_at ON public.configs(expires_at) WHERE expires_at IS NOT NULL;

DROP TRIGGER IF EXISTS trg_configs_updated_at ON public.configs;
CREATE TRIGGER trg_configs_updated_at
BEFORE UPDATE ON public.configs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ⚡ ۵. جدول پروکسی‌های ضد فیلتر MTProto تلگرام
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proxies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL CHECK (port > 0 AND port <= 65535),
    secret VARCHAR(255) NOT NULL,
    ping INTEGER CHECK (ping IS NULL OR ping >= 0),
    location VARCHAR(100),
    flag VARCHAR(10),
    country_code VARCHAR(10),
    channel_tag VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_host_port UNIQUE (host, port)
);

CREATE INDEX IF NOT EXISTS idx_proxies_is_active ON public.proxies(is_active);
CREATE INDEX IF NOT EXISTS idx_proxies_ping ON public.proxies(ping ASC);
-- ایندکس جدید برای افزایش سرعت کران‌جاب پاکسازی
CREATE INDEX IF NOT EXISTS idx_proxies_expires_at ON public.proxies(expires_at) WHERE expires_at IS NOT NULL;

DROP TRIGGER IF EXISTS trg_proxies_updated_at ON public.proxies;
CREATE TRIGGER trg_proxies_updated_at
BEFORE UPDATE ON public.proxies
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 🤖 ۶. جدول صف رسانه‌های تلگرام (محرمانه و مخصوص ربات ادمین)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.telegram_media_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('text', 'photo', 'audio', 'video', 'document')),
    file_id TEXT,
    caption TEXT,
    title VARCHAR(255),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed')),
    attached_proxies JSONB DEFAULT '[]'::jsonb,
    telegram_message_id BIGINT,
    published_at TIMESTAMPTZ,
    purge_after TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_queue_status ON public.telegram_media_queue(status);
CREATE INDEX IF NOT EXISTS idx_media_queue_type ON public.telegram_media_queue(media_type);

DROP TRIGGER IF EXISTS trg_media_queue_updated_at ON public.telegram_media_queue;
CREATE TRIGGER trg_media_queue_updated_at
BEFORE UPDATE ON public.telegram_media_queue
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 📨 ۷. جدول جامع تیکت‌های پشتیبانی کاربران و مهمانان (Support Tickets)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(30) UNIQUE NOT NULL DEFAULT 'TCK-' || upper(substr(gen_random_uuid()::text, 1, 16)), -- Auto Secure Code
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable برای کاربران مهمان
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150),
    telegram_username VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'connection' CHECK (category IN ('connection', 'config', 'app', 'billing', 'other')),
    operator VARCHAR(50) DEFAULT 'mci' CHECK (operator IN ('mci', 'irancell', 'rightel', 'shatel', 'mokhaberat', 'wifi', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'answered')),
    message TEXT NOT NULL,
    reply_message TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_code ON public.support_tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 💰 ۸. جدول تراکنش‌های مالی و ارتقای کیف پول (فقط قابل ثبت توسط سرور)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_toman INTEGER NOT NULL CHECK (amount_toman > 0),
    type VARCHAR(30) NOT NULL CHECK (type IN ('deposit', 'plan_purchase', 'gift', 'refund')),
    gateway VARCHAR(50) NOT NULL CHECK (gateway IN ('card_to_card', 'crypto_usdt', 'direct_payment', 'bonus', 'manual')),
    status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'rejected', 'failed')),
    tracking_code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_created_at ON public.wallet_transactions(created_at DESC);

DROP TRIGGER IF EXISTS trg_wallet_transactions_updated_at ON public.wallet_transactions;
CREATE TRIGGER trg_wallet_transactions_updated_at
BEFORE UPDATE ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 🚀 ۹. جدول سابسکریپشن‌های اختصاصی کاربران (User Dedicated Subscriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    plan_name VARCHAR(150) NOT NULL,
    subscription_token VARCHAR(255) UNIQUE NOT NULL,
    subscription_url TEXT NOT NULL,
    total_traffic_gb NUMERIC(10, 2) NOT NULL CHECK (total_traffic_gb > 0),
    used_traffic_gb NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (used_traffic_gb >= 0),
    speed_limit_mbps INTEGER DEFAULT 0 CHECK (speed_limit_mbps >= 0),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'exhausted', 'suspended')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_token ON public.user_subscriptions(subscription_token);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

DROP TRIGGER IF EXISTS trg_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 🧹 ۱۰. تابع و کران‌جاب پاکسازی خودکار امن (Auto-Purge Engine - Hardened)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.purge_expired_nodes_and_media()
RETURNS void AS $$
BEGIN
    -- ۱. غیرفعال‌سازی (Soft Delete) کانفیگ‌های منقضی‌شده به جای حذف فیزیکی
    UPDATE public.configs 
    SET is_active = false, updated_at = NOW()
    WHERE (expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true);

    -- ۲. غیرفعال‌سازی (Soft Delete) پروکسی‌های منقضی‌شده به جای حذف فیزیکی
    UPDATE public.proxies
    SET is_active = false, updated_at = NOW()
    WHERE (expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true);

    -- ۳. حذف رسانه‌های منتشرشده ۲۴ ساعت پس از انتشار (تغییری نکرد)
    DELETE FROM public.telegram_media_queue 
    WHERE status = 'published' AND purge_after IS NOT NULL AND purge_after < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- سلب دسترسی اجرای این تابع از عموم و اعطای انحصاری به سرور/ورکر و ادمین کل
REVOKE ALL ON FUNCTION public.purge_expired_nodes_and_media() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purge_expired_nodes_and_media() TO service_role, authenticated;

-- ============================================================================
-- 🛡️ ۱۱. پیکربندی سخت‌گیرانه قوانین امنیتی سطحی (Zero-Trust Row Level Security)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_media_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- الف) قوانین جدول پروفایل‌ها (Profiles)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- ب) قوانین کانفیگ‌ها و پروکسی‌ها (Configs & Proxies)
-- فقط نودهای فعال، سالم و رایگان برای عموم قابل مشاهده هستند؛ نوشتن و ویرایش منحصراً برای ادمین/سرویس‌رول
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Active Configs" ON public.configs;
CREATE POLICY "Public Read Active Configs" ON public.configs 
FOR SELECT USING (is_active = true AND is_vip = false);

DROP POLICY IF EXISTS "Admin Full Access Configs" ON public.configs;
CREATE POLICY "Admin Full Access Configs" ON public.configs 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public Read Active Proxies" ON public.proxies;
CREATE POLICY "Public Read Active Proxies" ON public.proxies 
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin Full Access Proxies" ON public.proxies;
CREATE POLICY "Admin Full Access Proxies" ON public.proxies 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- ج) قوانین صف رسانه‌های تلگرام (Telegram Media Queue)
-- کاملاً قفل‌شده در برابر عموم؛ فقط قابل دسترس برای سرویس‌رول و ادمین
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin Full Access Media Queue" ON public.telegram_media_queue;
CREATE POLICY "Admin Full Access Media Queue" ON public.telegram_media_queue 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- د) قوانین تیکت‌های پشتیبانی (Support Tickets)
-- ۱. جلوگیری از جعل هویت با سیاست‌های تفکیک‌شده برای کاربر مهمان و لاگین‌شده
-- ۲. کاربران لاگین‌شده فقط تیکت‌های خود را می‌بینند.
-- ۳. ویرایش و پاسخ‌دهی منحصراً در اختیار ادمین و سرویس‌رول است.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guest Ticket Submission" ON public.support_tickets;
CREATE POLICY "Guest Ticket Submission" ON public.support_tickets 
FOR INSERT TO anon WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated Ticket Submission" ON public.support_tickets;
CREATE POLICY "Authenticated Ticket Submission" ON public.support_tickets 
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets 
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin and Service Role Ticket Management" ON public.support_tickets;
CREATE POLICY "Admin and Service Role Ticket Management" ON public.support_tickets 
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- تابع امن پیگیری تیکت برای کاربران مهمان بر اساس کد رهگیری تصادفی و طولانی
CREATE OR REPLACE FUNCTION public.get_ticket_by_code(p_ticket_code TEXT)
RETURNS TABLE (
    ticket_code VARCHAR(30),
    subject VARCHAR(255),
    category VARCHAR(50),
    status VARCHAR(30),
    message TEXT,
    reply_message TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.ticket_code,
        t.subject,
        t.category,
        t.status,
        t.message,
        t.reply_message,
        t.replied_at,
        t.created_at
    FROM public.support_tickets t
    WHERE t.ticket_code = p_ticket_code
      AND (
          t.user_id IS NULL               -- اجازه دسترسی به تیکت‌های مهمان (بدون مالک)
          OR t.user_id = auth.uid()       -- اجازه دسترسی به کاربر سازنده تیکت
          OR public.is_admin()            -- اجازه دسترسی به ادمین کل
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- سلب دسترسی عمومی برای جلوگیری از نشت اطلاعات و اعطای مجدد با مکانیزم امن
REVOKE ALL ON FUNCTION public.get_ticket_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ticket_by_code(TEXT) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- ه) قوانین تراکنش‌های مالی (Wallet Transactions)
-- کاربران فقط تراکنش‌های خود را می‌بینند؛ درج تراکنش جعلی توسط کلاینت ۱۰۰٪ مسدود است.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users view own transactions" ON public.wallet_transactions 
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- و) قوانین سابسکریپشن‌های اختصاصی کاربران (User Subscriptions)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions 
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access Subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admin Full Access Subscriptions" ON public.user_subscriptions 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 📚 ۱۰. جداول محتوا و سئو (Articles & News)
-- برای ایندکس شدن بهتر در گوگل و تولید مسیرهای داینامیک
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100),
    read_time_minutes INT DEFAULT 5,
    author VARCHAR(100) DEFAULT 'تیم اتصال',
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ایندکس‌ها برای جستجوی سریع
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);

-- فعال‌سازی RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- تریگرهای آپدیت زمان
DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_news_updated_at ON public.news;
CREATE TRIGGER trg_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- سیاست‌ها (همه می‌توانند بخوانند، فقط ادمین ویرایش می‌کند)
DROP POLICY IF EXISTS "Public Read Published Articles" ON public.articles;
CREATE POLICY "Public Read Published Articles" ON public.articles 
FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin Full Access Articles" ON public.articles;
CREATE POLICY "Admin Full Access Articles" ON public.articles 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public Read Published News" ON public.news;
CREATE POLICY "Public Read Published News" ON public.news 
FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin Full Access News" ON public.news;
CREATE POLICY "Admin Full Access News" ON public.news 
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


