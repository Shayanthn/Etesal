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
