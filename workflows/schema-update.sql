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
