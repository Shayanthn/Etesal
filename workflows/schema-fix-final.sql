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
