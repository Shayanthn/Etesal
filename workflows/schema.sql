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
    recovery_email VARCHAR(255),
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

-- تریگر جلوگیری از تغییر نقش و موجودی کیف پول توسط کاربران غیر ادمین (جلوگیری از Privilege Escalation & Financial Fraud)
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if sensitive fields are being modified
    IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance) THEN
        -- Only allow changes if the request is made using the service_role key
        IF current_setting('request.jwt.claims', true)::jsonb->>'role' <> 'service_role' THEN
            RAISE EXCEPTION 'Sensitive fields (role, wallet_balance) can only be modified by the backend system (Service Role).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.profiles;
DROP TRIGGER IF EXISTS trg_prevent_sensitive_profile_changes ON public.profiles;
CREATE TRIGGER trg_prevent_sensitive_profile_changes
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_profile_changes();

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
FOR SELECT USING (id = auth.uid() OR public.is_admin());

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
-- CREATE POLICY "Guest Ticket Submission" ON public.support_tickets 
-- FOR INSERT TO anon WITH CHECK (user_id IS NULL);

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



-- ============================================================================
-- 🛒 تراکنش اتمیک کیف پول برای خرید کانفیگ (TICKET-2)
-- این تابع با استفاده از امنیت SECURITY DEFINER، مستقیماً از سمت بک‌اند موجودی را کسر می‌کند.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.purchase_dedicated_config(
    p_plan_name VARCHAR,
    p_price_toman INTEGER,
    p_duration_days INTEGER,
    p_traffic_gb NUMERIC,
    p_speed_limit_mbps INTEGER
) RETURNS json AS $$
DECLARE
    v_user_id UUID;
    v_username VARCHAR;
    v_wallet_balance INTEGER;
    v_token VARCHAR;
    v_sub_url TEXT;
    v_tx_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Lock the user profile for update to prevent race conditions
    SELECT username, wallet_balance INTO v_username, v_wallet_balance
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_wallet_balance < p_price_toman THEN
        RAISE EXCEPTION 'Insufficient wallet balance / موجودی کافی نیست';
    END IF;

    -- Update balance
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - p_price_toman,
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Generate a unique token
    v_token := encode(gen_random_bytes(16), 'hex');
    v_sub_url := 'https://etesal.aetherai.ir/sub/' || v_token;

    -- Record transaction
    INSERT INTO public.wallet_transactions (
        user_id, amount_toman, type, gateway, status, tracking_code, description
    ) VALUES (
        v_user_id, p_price_toman, 'plan_purchase', 'direct_payment', 'completed', 
        'PURCHASE-' || substr(md5(random()::text), 1, 10), 
        'خرید اشتراک ' || p_plan_name
    ) RETURNING id INTO v_tx_id;

    -- Create subscription
    INSERT INTO public.user_subscriptions (
        user_id, username, plan_name, subscription_token, subscription_url, 
        total_traffic_gb, speed_limit_mbps, expires_at, status
    ) VALUES (
        v_user_id, v_username, p_plan_name, v_token, v_sub_url, 
        p_traffic_gb, p_speed_limit_mbps, NOW() + (p_duration_days || ' days')::INTERVAL, 'active'
    );

    RETURN json_build_object(
        'success', true,
        'new_balance', v_wallet_balance - p_price_toman,
        'subscription_url', v_sub_url,
        'token', v_token
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.purchase_dedicated_config FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_dedicated_config TO authenticated, service_role;
-- ============================================================================
-- 📦 1. جدول پلن‌های اشتراک (جلوگیری از دستکاری قیمت توسط کلاینت)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    price_toman BIGINT NOT NULL,
    duration_days INTEGER NOT NULL,
    traffic_gb NUMERIC NOT NULL,
    speed_limit_mbps INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO public.subscription_plans (id, title, price_toman, duration_days, traffic_gb)
VALUES 
    ('cfg-basic-1m', 'کانفیگ اختصاصی ۱ ماهه پایه', 89000, 30, 50),
    ('cfg-pro-1m', 'کانفیگ اختصاصی ۱ ماهه حرفه‌ای (پیشنهاد ویژه)', 149000, 30, 120),
    ('cfg-ultra-3m', 'کانفیگ اختصاصی ۳ ماهه نامحدود سرعتی', 389000, 90, 350)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title, price_toman = EXCLUDED.price_toman, duration_days = EXCLUDED.duration_days, traffic_gb = EXCLUDED.traffic_gb;

-- ارتقای ستون‌های مالی
ALTER TABLE public.profiles ALTER COLUMN wallet_balance TYPE BIGINT;
ALTER TABLE public.wallet_transactions ALTER COLUMN amount_toman TYPE BIGINT;
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS balance_before BIGINT DEFAULT 0;
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS balance_after BIGINT DEFAULT 0;

-- ============================================================================
-- 🛒 2. تراکنش اتمیک کیف پول برای خرید کانفیگ (ویرایش شده و کاملا امن)
-- ============================================================================
DROP FUNCTION IF EXISTS public.purchase_dedicated_config(VARCHAR, INTEGER, INTEGER, NUMERIC, INTEGER);

CREATE OR REPLACE FUNCTION public.purchase_dedicated_config(
    p_plan_id VARCHAR
) RETURNS json AS $$
DECLARE
    v_user_id UUID;
    v_username VARCHAR;
    v_wallet_balance BIGINT;
    v_token VARCHAR;
    v_sub_url TEXT;
    v_tx_id UUID;
    v_plan RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Fetch plan securely from DB (Server-Side Pricing)
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan not found or inactive / پلن نامعتبر است';
    END IF;

    -- Lock the user profile for update to prevent race conditions
    SELECT username, wallet_balance INTO v_username, v_wallet_balance
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_wallet_balance < v_plan.price_toman THEN
        RAISE EXCEPTION 'Insufficient wallet balance / موجودی کافی نیست';
    END IF;

    -- Update balance
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - v_plan.price_toman,
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Generate a unique token
    v_token := encode(gen_random_bytes(16), 'hex');
    v_sub_url := 'https://etesal.aetherai.ir/sub/' || v_token;

    -- Record transaction with ledger
    INSERT INTO public.wallet_transactions (
        user_id, amount_toman, type, gateway, status, tracking_code, description, balance_before, balance_after
    ) VALUES (
        v_user_id, v_plan.price_toman, 'plan_purchase', 'direct_payment', 'completed', 
        'PURCHASE-' || substr(md5(random()::text), 1, 10), 
        'خرید اشتراک ' || v_plan.title, v_wallet_balance, v_wallet_balance - v_plan.price_toman
    ) RETURNING id INTO v_tx_id;

    -- Create subscription
    INSERT INTO public.user_subscriptions (
        user_id, username, plan_name, subscription_token, subscription_url, 
        total_traffic_gb, speed_limit_mbps, expires_at, status
    ) VALUES (
        v_user_id, v_username, v_plan.title, v_token, v_sub_url, 
        v_plan.traffic_gb, v_plan.speed_limit_mbps, NOW() + (v_plan.duration_days || ' days')::INTERVAL, 'active'
    );

    RETURN json_build_object(
        'success', true,
        'new_balance', v_wallet_balance - v_plan.price_toman,
        'subscription_url', v_sub_url,
        'token', v_token
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- امضای دقیق در REVOKE و GRANT
REVOKE ALL ON FUNCTION public.purchase_dedicated_config(VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_dedicated_config(VARCHAR) TO authenticated, service_role;

-- ============================================================================
-- 🛡️ 3. جلوگیری از افشای Secret پروکسی‌ها
-- ============================================================================
DROP POLICY IF EXISTS "Public Read Active Proxies" ON public.proxies;
-- ایجاد یک View امن برای استفاده کلاینت‌های عمومی
CREATE OR REPLACE VIEW public.vw_active_proxies AS
SELECT id, name, host, port, ping, location, flag, country_code, channel_tag, expires_at
FROM public.proxies WHERE is_active = true;

GRANT SELECT ON public.vw_active_proxies TO anon, authenticated;

-- ============================================================================
-- 🎟️ 4. محدودسازی شدید درج تیکت مهمان
-- ============================================================================
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS guest_token_hash TEXT;

DROP POLICY IF EXISTS "Guest Ticket Submission" ON public.support_tickets;
CREATE POLICY "Guest Ticket Submission" ON public.support_tickets 
FOR INSERT TO anon WITH CHECK (
    user_id IS NULL AND 
    status = 'pending' AND
    reply_message IS NULL
);

-- ============================================================================
-- 🕒 5. کران‌جاب پاکسازی خودکار
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- اجرای تابع پاکسازی هر 1 ساعت (در صورت پشتیبانی دیتابیس از pg_cron)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule('purge_expired_nodes', '0 * * * *', 'SELECT public.purge_expired_nodes_and_media()');
  END IF;
END $$;
-- ============================================================================
-- 🛠️ 1. اصلاح تریگر امنیتی برای اجازه به توابع داخلی (مثل خرید)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- اجازه عبور در صورت ست شدن متغیر محلی توسط توابع امن دیتابیس (مانند تابع خرید)
    IF current_setting('etesal.bypass_trigger', true) = 'true' THEN
        RETURN NEW;
    END IF;

    -- در غیر این صورت، تغییر فیلدهای حساس فقط برای service_role مجاز است
    IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance) THEN
        IF current_setting('request.jwt.claims', true)::jsonb->>'role' <> 'service_role' THEN
            RAISE EXCEPTION 'Sensitive fields (role, wallet_balance) can only be modified by the backend system (Service Role).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 🛒 2. به روز رسانی تابع خرید برای دور زدن تریگر و ارتقای کاربر به VIP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.purchase_dedicated_config(
    p_plan_id VARCHAR
) RETURNS json AS $$
DECLARE
    v_user_id UUID;
    v_username VARCHAR;
    v_wallet_balance BIGINT;
    v_token VARCHAR;
    v_sub_url TEXT;
    v_tx_id UUID;
    v_plan RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- پیدا کردن پلن
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan not found or inactive / پلن نامعتبر است';
    END IF;

    -- قفل کردن ردیف کاربر
    SELECT username, wallet_balance INTO v_username, v_wallet_balance
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_wallet_balance < v_plan.price_toman THEN
        RAISE EXCEPTION 'Insufficient wallet balance / موجودی کافی نیست';
    END IF;

    -- ✨ ست کردن متغیر محلی برای دور زدن تریگر امنیتی
    PERFORM set_config('etesal.bypass_trigger', 'true', true);

    -- کسر موجودی و ارتقای کاربر به VIP
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - v_plan.price_toman,
        role = 'vip',
        updated_at = NOW()
    WHERE id = v_user_id;

    -- تولید توکن
    v_token := encode(gen_random_bytes(16), 'hex');
    v_sub_url := 'https://etesal.aetherai.ir/sub/' || v_token;

    -- ثبت تراکنش
    INSERT INTO public.wallet_transactions (
        user_id, amount_toman, type, gateway, status, tracking_code, description, balance_before, balance_after
    ) VALUES (
        v_user_id, v_plan.price_toman, 'plan_purchase', 'direct_payment', 'completed', 
        'PURCHASE-' || substr(md5(random()::text), 1, 10), 
        'خرید اشتراک ' || v_plan.title, v_wallet_balance, v_wallet_balance - v_plan.price_toman
    ) RETURNING id INTO v_tx_id;

    -- ثبت سابسکریپشن
    INSERT INTO public.user_subscriptions (
        user_id, username, plan_name, subscription_token, subscription_url, 
        total_traffic_gb, speed_limit_mbps, expires_at, status
    ) VALUES (
        v_user_id, v_username, v_plan.title, v_token, v_sub_url, 
        v_plan.traffic_gb, v_plan.speed_limit_mbps, NOW() + (v_plan.duration_days || ' days')::INTERVAL, 'active'
    );

    -- ✨ پاک کردن متغیر محلی
    PERFORM set_config('etesal.bypass_trigger', 'false', true);

    RETURN json_build_object(
        'success', true,
        'new_balance', v_wallet_balance - v_plan.price_toman,
        'subscription_url', v_sub_url,
        'token', v_token,
        'new_role', 'vip'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- در صورت بروز هرگونه خطا، متغیر محلی ریست شود تا امنیت به خطر نیفتد
        PERFORM set_config('etesal.bypass_trigger', 'false', true);
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 🎟️ 3. اصلاح تابع تیکت برای بررسی هش امنیتی کاربران مهمان
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP FUNCTION IF EXISTS public.get_ticket_by_code(TEXT);
DROP FUNCTION IF EXISTS public.get_ticket_by_code(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_ticket_by_code(
    p_ticket_code TEXT,
    p_guest_token TEXT DEFAULT NULL
)
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
        t.ticket_code, t.subject, t.category, t.status, t.message, t.reply_message, t.replied_at, t.created_at
    FROM public.support_tickets t
    WHERE t.ticket_code = p_ticket_code
      AND (
          -- ۱. دسترسی ادمین
          public.is_admin()
          -- ۲. دسترسی کاربر لاگین شده به تیکت خودش
          OR (auth.uid() IS NOT NULL AND t.user_id = auth.uid())
          -- ۳. دسترسی مهمان با توکن صحیح (با استفاده از هش)
          OR (
              t.user_id IS NULL 
              AND p_guest_token IS NOT NULL 
              AND t.guest_token_hash = crypt(p_guest_token, t.guest_token_hash)
          )
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_ticket_by_code(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ticket_by_code(TEXT, TEXT) TO anon, authenticated;
-- ============================================================================
-- 🛠️ 1. اصلاح قطعی تریگر Profile برای مقاومت در برابر خطای JSON NULL
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- اجازه عبور در صورت ست شدن متغیر محلی توسط توابع امن دیتابیس (مانند تابع خرید)
    IF current_setting('etesal.bypass_trigger', true) = 'true' THEN
        RETURN NEW;
    END IF;

    -- استخراج ایمن role از JWT برای جلوگیری از خطای null در کلاینت‌های بدون توکن
    BEGIN
        v_role := COALESCE(
            NULLIF(current_setting('request.jwt.claims', true), ''),
            '{}'
        )::jsonb->>'role';
    EXCEPTION WHEN OTHERS THEN
        v_role := 'anon';
    END;

    -- در غیر این صورت، تغییر فیلدهای حساس فقط برای service_role مجاز است
    IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.wallet_balance IS DISTINCT FROM OLD.wallet_balance) THEN
        IF v_role <> 'service_role' THEN
            RAISE EXCEPTION 'Sensitive fields (role, wallet_balance) can only be modified by the backend system (Service Role).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 🛒 2. ارتقای قطعی تابع خرید (تجمع اشتراک‌ها و برگشت کامل دیتای سروری)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.purchase_dedicated_config(
    p_plan_id VARCHAR
) RETURNS json AS $$
DECLARE
    v_user_id UUID;
    v_username VARCHAR;
    v_wallet_balance BIGINT;
    v_token VARCHAR;
    v_sub_url TEXT;
    v_tx_id UUID;
    v_plan RECORD;
    v_existing_sub RECORD;
    v_new_traffic NUMERIC;
    v_new_expiry TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- جلوگیری از تغییر نقش ادمین کل
    IF public.is_admin() THEN
        RAISE EXCEPTION 'Super admins cannot purchase plans this way';
    END IF;

    -- پیدا کردن پلن
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan not found or inactive / پلن نامعتبر است';
    END IF;

    -- قفل کردن ردیف کاربر
    SELECT username, wallet_balance INTO v_username, v_wallet_balance
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_wallet_balance < v_plan.price_toman THEN
        RAISE EXCEPTION 'Insufficient wallet balance / موجودی کافی نیست';
    END IF;

    -- ✨ ست کردن متغیر محلی برای دور زدن تریگر امنیتی
    PERFORM set_config('etesal.bypass_trigger', 'true', true);

    -- کسر موجودی و ارتقای کاربر به VIP
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - v_plan.price_toman,
        role = 'vip',
        updated_at = NOW()
    WHERE id = v_user_id;

    -- ثبت تراکنش
    INSERT INTO public.wallet_transactions (
        user_id, amount_toman, type, gateway, status, tracking_code, description, balance_before, balance_after
    ) VALUES (
        v_user_id, v_plan.price_toman, 'plan_purchase', 'direct_payment', 'completed', 
        'PURCHASE-' || substr(md5(random()::text), 1, 10), 
        'خرید اشتراک ' || v_plan.title, v_wallet_balance, v_wallet_balance - v_plan.price_toman
    ) RETURNING id INTO v_tx_id;

    -- بررسی وجود سابسکریپشن فعال برای تمدید/افزایش حجم
    SELECT * INTO v_existing_sub FROM public.user_subscriptions 
    WHERE user_id = v_user_id AND status = 'active' 
    ORDER BY created_at DESC LIMIT 1;

    IF FOUND THEN
        -- تمدید اشتراک موجود
        v_new_traffic := v_existing_sub.total_traffic_gb + v_plan.traffic_gb;
        v_new_expiry := GREATEST(v_existing_sub.expires_at, NOW()) + (v_plan.duration_days || ' days')::INTERVAL;
        v_token := v_existing_sub.subscription_token;
        v_sub_url := v_existing_sub.subscription_url;

        UPDATE public.user_subscriptions
        SET total_traffic_gb = v_new_traffic,
            expires_at = v_new_expiry,
            plan_name = v_plan.title,
            speed_limit_mbps = GREATEST(speed_limit_mbps, v_plan.speed_limit_mbps),
            updated_at = NOW()
        WHERE id = v_existing_sub.id;
    ELSE
        -- ساخت اشتراک جدید
        v_new_traffic := v_plan.traffic_gb;
        v_new_expiry := NOW() + (v_plan.duration_days || ' days')::INTERVAL;
        v_token := encode(gen_random_bytes(16), 'hex');
        v_sub_url := 'https://etesal.aetherai.ir/sub/' || v_token;

        INSERT INTO public.user_subscriptions (
            user_id, username, plan_name, subscription_token, subscription_url, 
            total_traffic_gb, speed_limit_mbps, expires_at, status
        ) VALUES (
            v_user_id, v_username, v_plan.title, v_token, v_sub_url, 
            v_new_traffic, v_plan.speed_limit_mbps, v_new_expiry, 'active'
        );
    END IF;

    -- ✨ پاک کردن متغیر محلی
    PERFORM set_config('etesal.bypass_trigger', 'false', true);

    -- برگرداندن دیتای کامل برای ری‌اکت تا نیازی به محاسبه کلاینت‌ساید نباشد
    RETURN json_build_object(
        'success', true,
        'new_balance', v_wallet_balance - v_plan.price_toman,
        'new_role', 'vip',
        'subscription', json_build_object(
            'planName', v_plan.title,
            'totalTrafficGB', v_new_traffic,
            'expiresAt', v_new_expiry,
            'subscriptionUrl', v_sub_url,
            'status', 'active'
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        PERFORM set_config('etesal.bypass_trigger', 'false', true);
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 🎟️ 3. اجباری کردن توکن برای تیکت‌های مهمان در سطح دیتابیس
-- ============================================================================
DROP POLICY IF EXISTS "Guest Ticket Submission" ON public.support_tickets;
CREATE POLICY "Guest Ticket Submission" ON public.support_tickets 
FOR INSERT TO anon WITH CHECK (
    user_id IS NULL AND 
    status = 'pending' AND
    reply_message IS NULL AND
    guest_token_hash IS NOT NULL
);

-- ============================================================================
-- 🕒 4. مدیریت نقش VIP در کران‌جاب (پایان اشتراک) و مدیریت امن Cron
-- ============================================================================
CREATE OR REPLACE FUNCTION public.purge_expired_nodes_and_media()
RETURNS void AS $$
BEGIN
    UPDATE public.configs SET is_active = false, updated_at = NOW()
    WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true;

    UPDATE public.proxies SET is_active = false, updated_at = NOW()
    WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true;

    DELETE FROM public.telegram_media_queue 
    WHERE status = 'published' AND purge_after IS NOT NULL AND purge_after < NOW();

    -- انقضای سابسکریپشن‌ها
    UPDATE public.user_subscriptions SET status = 'expired', updated_at = NOW()
    WHERE expires_at < NOW() AND status = 'active';

    -- داون‌گرید کاربران VIP که هیچ سابسکریپشن فعالی ندارند (اثرش روی ادمین‌ها نیست)
    UPDATE public.profiles p
    SET role = 'user', updated_at = NOW()
    WHERE p.role = 'vip' 
      AND NOT EXISTS (
          SELECT 1 FROM public.user_subscriptions s 
          WHERE s.user_id = p.id AND s.status = 'active'
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- جلوگیری از اجرای خطای کران در صورت اجرا شدن چندین باره‌ی فایل
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge_expired_nodes') THEN
        PERFORM cron.schedule('purge_expired_nodes', '0 * * * *', 'SELECT public.purge_expired_nodes_and_media()');
    END IF;
  END IF;
END $$;
-- ============================================================================
-- 🕒 1. امن کردن کامل تابع کران‌جاب و افزودن قابلیت Bypass تریگر
-- ============================================================================
CREATE OR REPLACE FUNCTION public.purge_expired_nodes_and_media()
RETURNS void AS $$
BEGIN
    -- قفل کردن دسترسی تریگر برای جلوگیری از رول‌بک (Rolled Back) شدن پروسه
    PERFORM set_config('etesal.bypass_trigger', 'true', true);

    UPDATE public.configs SET is_active = false, updated_at = NOW()
    WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true;

    UPDATE public.proxies SET is_active = false, updated_at = NOW()
    WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true;

    DELETE FROM public.telegram_media_queue 
    WHERE status = 'published' AND purge_after IS NOT NULL AND purge_after < NOW();

    -- انقضای سابسکریپشن‌ها
    UPDATE public.user_subscriptions SET status = 'expired', updated_at = NOW()
    WHERE expires_at < NOW() AND status = 'active';

    -- داون‌گرید کاربران VIP که هیچ سابسکریپشن فعالی ندارند
    UPDATE public.profiles p
    SET role = 'user', updated_at = NOW()
    WHERE p.role = 'vip' 
      AND NOT EXISTS (
          SELECT 1 FROM public.user_subscriptions s 
          WHERE s.user_id = p.id AND s.status = 'active'
      );

    -- آزادسازی تریگر
    PERFORM set_config('etesal.bypass_trigger', 'false', true);
EXCEPTION
    WHEN OTHERS THEN
        PERFORM set_config('etesal.bypass_trigger', 'false', true);
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- جلوگیری از اجرای توسط کاربران عادی (فقط سرور/کران مجاز است)
REVOKE ALL ON FUNCTION public.purge_expired_nodes_and_media() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_nodes_and_media() TO service_role;
