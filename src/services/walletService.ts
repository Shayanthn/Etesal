import { getSupabase } from './supabaseClient';
import { DedicatedConfigProduct, WalletTransaction, User } from '../types';

export const DEDICATED_CONFIG_PRODUCTS: DedicatedConfigProduct[] = [
  {
    id: 'cfg-basic-1m',
    title: 'کانفیگ اختصاصی ۱ ماهه پایه',
    durationDays: 30,
    trafficGB: 50,
    priceTomans: 89000,
    protocol: 'VLESS Reality',
    location: '🇩🇪 آلمان (Frankfurt - Hetzner)',
    flag: '🇩🇪',
    features: [
      'پورت اختصاصی 443 با TLS 1.3 Reality',
      'پینگ پایدار زیر ۴۰ میلی‌ثانیه',
      'بهینه‌شده برای همراه اول و ایرانسل',
      'بدون قطعی و بدون افت پهنای باند'
    ],
    isPopular: false
  },
  {
    id: 'cfg-pro-1m',
    title: 'کانفیگ اختصاصی ۱ ماهه حرفه‌ای (پیشنهاد ویژه)',
    durationDays: 30,
    trafficGB: 120,
    priceTomans: 149000,
    protocol: 'Hysteria 2',
    location: '🇳🇱 هلند (Amsterdam - Leaseweb)',
    flag: '🇳🇱',
    features: [
      'پروتکل پرسرعت UDP Hysteria 2 با BBRv3',
      'پینگ زیر ۳۲ میلی‌ثانیه با اولویت ترافیک بالا',
      'بهینه‌شده برای بازی و استریم 4K',
      'پشتیبانی VIP و تغییر آی‌پی رایگان در صورت اختلال'
    ],
    isPopular: true
  },
  {
    id: 'cfg-ultra-3m',
    title: 'کانفیگ اختصاصی ۳ ماهه نامحدود سرعتی',
    durationDays: 90,
    trafficGB: 350,
    priceTomans: 389000,
    protocol: 'VLESS Reality',
    location: '🇫🇮 فنلاند (Helsinki)',
    flag: '🇫🇮',
    features: [
      '۳۵۰ گیگابایت ترافیک فوق‌العاده سریع ۳ ماهه',
      'دو نود همزمان (Primary + Backup Failover)',
      'سوییچ خودکار در صورت اختلال شبکه ملی',
      'تخفیف ویژه دوره‌ای'
    ],
    isPopular: false
  }
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

/**
 * ایجاد تراکنش افزایش موجودی (شارژ)
 * ⚠️ در محیط واقعی این بخش باید از طریق درگاه پرداخت و Webhook سرور هندل شود
 */
export async function createDepositTransaction(amount: number, referenceId: string): Promise<{ success: boolean; error?: string }> {
  // This should ideally call a Supabase edge function for payments
  return { success: false, error: 'شارژ کیف پول موقتاً غیرفعال است. با پشتیبانی تماس بگیرید.' };
}

/**
 * خرید کانفیگ اختصاصی با کسر از کیف پول (اتصال واقعی به دیتابیس با RPC)
 */
export async function purchaseDedicatedConfig(
  user: User,
  product: DedicatedConfigProduct
): Promise<{ success: boolean; updatedUser?: User; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase Client not configured');

    // فراخوانی RPC اتمیک برای ثبت امن خرید در بک‌اند
    const { data, error } = await supabase.rpc('purchase_dedicated_config', {
      p_plan_id: product.id
    });

    if (error) {
      console.error('RPC Error purchasing config:', error);
      return { success: false, error: error.message };
    }

    if (data && data.success) {
      // Return the updated data directly from the server response
      // NOTE: We don't get the full subscription object, just the new balance, url and token.
      
      const updatedUser: User = {
        ...user,
        role: data.new_role ?? user.role,
        walletBalance: data.new_balance,
        subscription: {
          planName: product.title,
          totalTrafficGB: product.trafficGB,
          usedTrafficGB: 0,
          expireDate: new Date(Date.now() + product.durationDays * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: product.durationDays,
          status: 'active',
          subscriptionUrl: data.subscription_url,
          dailyUsage: [],
          speedLimitMbps: 0
        }
      };

      return { success: true, updatedUser };
    }

    return { success: false, error: 'خطای ناشناخته در پردازش خرید' };
  } catch (err: any) {
    console.error('Exception purchasing config:', err);
    return { success: false, error: 'خطا در ارتباط با سرور' };
  }
}
