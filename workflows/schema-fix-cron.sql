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
