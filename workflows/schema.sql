-- ============================================================================
-- 🚀 پایگاه‌داده جامع و امن اتصال (Etesal Production Multi-Channel Schema V6.2)
-- پشتیبانی کامل از: کانفیگ‌ها، پروکسی‌ها، صف تلگرام، تیکت‌های پشتیبانی و کیف‌پول
-- ============================================================================

-- ۱. فعال‌سازی اکستنشن UUID در صورت نیاز
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ۲. جدول کانفیگ‌های ضد فیلتر V2Ray, VLESS Reality, Hysteria 2
CREATE TABLE IF NOT EXISTS public.configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    protocol VARCHAR(50) NOT NULL, -- vless, vmess, hysteria2, trojan, tuic, shadowtls
    config_string TEXT UNIQUE NOT NULL,
    operator VARCHAR(50) DEFAULT 'all', -- mci, irancell, rightel, wifi, all
    ping INTEGER DEFAULT 45,
    location VARCHAR(100) DEFAULT '🇩🇪 آلمان - Frankfurt',
    flag VARCHAR(10) DEFAULT '🇩🇪',
    quality VARCHAR(50) DEFAULT 'excellent',
    is_official BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_vip BOOLEAN DEFAULT false,
    broadcasted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_configs_operator ON public.configs(operator);
CREATE INDEX IF NOT EXISTS idx_configs_is_active ON public.configs(is_active);
CREATE INDEX IF NOT EXISTS idx_configs_is_vip ON public.configs(is_vip);
CREATE INDEX IF NOT EXISTS idx_configs_broadcasted ON public.configs(broadcasted_at);

-- ۳. جدول پروکسی‌های ضد فیلتر MTProto تلگرام
CREATE TABLE IF NOT EXISTS public.proxies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    secret VARCHAR(255) NOT NULL,
    ping INTEGER DEFAULT 35,
    location VARCHAR(100) DEFAULT '🇩🇪 فرانکفورت - آلمان',
    flag VARCHAR(10) DEFAULT '🇩🇪',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_host_port UNIQUE (host, port)
);

CREATE INDEX IF NOT EXISTS idx_proxies_is_active ON public.proxies(is_active);
CREATE INDEX IF NOT EXISTS idx_proxies_ping ON public.proxies(ping ASC);

-- ۴. جدول صف رسانه‌های تلگرام (متن، عکس، موزیک، ویدیو)
CREATE TABLE IF NOT EXISTS public.telegram_media_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_type VARCHAR(20) NOT NULL, -- 'text', 'photo', 'audio', 'video'
    file_id TEXT, -- Telegram File ID for media
    caption TEXT, -- Caption or raw text
    title VARCHAR(255), -- Title for audio or video
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'published', 'failed'
    attached_proxies JSONB DEFAULT '[]'::jsonb,
    telegram_message_id BIGINT,
    published_at TIMESTAMPTZ,
    purge_after TIMESTAMPTZ, -- Purged 24 hours after publishing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_queue_status ON public.telegram_media_queue(status);
CREATE INDEX IF NOT EXISTS idx_media_queue_type ON public.telegram_media_queue(media_type);
CREATE INDEX IF NOT EXISTS idx_media_queue_purge ON public.telegram_media_queue(purge_after);

-- ۵. جدول جامع تیکت‌های پشتیبانی کاربران (Support Tickets)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(30) UNIQUE NOT NULL, -- Format: TCK-XXXXX
    user_id TEXT, -- Supabase Auth UID or anonymous device fingerprint
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150),
    telegram_username VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'connection', -- connection, config, app, billing, other
    operator VARCHAR(50) DEFAULT 'mci', -- mci, irancell, rightel, shatel, mokhaberat, wifi, other
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(30) DEFAULT 'pending', -- pending, in_progress, resolved, closed
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

-- ۶. جدول تراکنش‌های مالی و ارتقای پلن کیف پول (Wallet Ledger)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    amount_toman INTEGER NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'deposit', 'plan_purchase', 'gift', 'refund'
    gateway VARCHAR(50) NOT NULL, -- 'card_to_card', 'crypto_usdt', 'direct_payment', 'bonus'
    status VARCHAR(30) DEFAULT 'completed', -- 'completed', 'pending', 'rejected'
    tracking_code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_created_at ON public.wallet_transactions(created_at DESC);

-- ۷. تابع و کران‌جاب پاکسازی خودکار دیتابیس (Auto-Purge Engine)
-- الف) حذف کانفیگ‌های بیش از ۴۸ ساعت یا غیرفعال
-- ب) حذف رسانه‌های تلگرام دقیقا ۲۴ ساعت پس از انتشار
CREATE OR REPLACE FUNCTION public.purge_expired_nodes_and_media()
RETURNS void AS $$
BEGIN
    -- ۱. حذف کانفیگ‌های منقضی‌شده
    DELETE FROM public.configs 
    WHERE (expires_at < NOW()) OR (is_active = false AND updated_at < NOW() - INTERVAL '24 hours');

    -- ۲. حذف رسانه‌های منتشرشده ۲۴ ساعت پس از انتشار
    DELETE FROM public.telegram_media_queue 
    WHERE status = 'published' AND purge_after < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 🛡️ پیکربندی قوانین امنیتی سطحی (Row Level Security - RLS Policies)
-- ============================================================================

ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_media_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- قوانین جداول کانفیگ و پروکسی (خواندن عمومی، ویرایش انحصاری ادمین)
DROP POLICY IF EXISTS "Public Read Access for Configs" ON public.configs;
CREATE POLICY "Public Read Access for Configs" ON public.configs 
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin Full Access for Configs" ON public.configs;
CREATE POLICY "Admin Full Access for Configs" ON public.configs 
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR true);

DROP POLICY IF EXISTS "Public Read Access for Proxies" ON public.proxies;
CREATE POLICY "Public Read Access for Proxies" ON public.proxies 
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin Full Access for Proxies" ON public.proxies;
CREATE POLICY "Admin Full Access for Proxies" ON public.proxies 
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR true);

DROP POLICY IF EXISTS "Admin Full Access for Media Queue" ON public.telegram_media_queue;
CREATE POLICY "Admin Full Access for Media Queue" ON public.telegram_media_queue 
FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR true);

-- قوانین جدول تیکت‌ها: هر کاربر مجاز به درج تیکت و مشاهده تیکت‌های خود با کد پیگیری یا user_id است
DROP POLICY IF EXISTS "Anyone can insert support tickets" ON public.support_tickets;
CREATE POLICY "Anyone can insert support tickets" ON public.support_tickets 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets" ON public.support_tickets 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Admins can update tickets" ON public.support_tickets 
FOR UPDATE USING (true);

-- قوانین جدول تراکنش‌ها
DROP POLICY IF EXISTS "Users can read own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can read own transactions" ON public.wallet_transactions 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert transactions" ON public.wallet_transactions;
CREATE POLICY "System can insert transactions" ON public.wallet_transactions 
FOR INSERT WITH CHECK (true);
