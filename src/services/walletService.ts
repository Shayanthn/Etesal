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

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-gift-welcome',
    type: 'gift',
    amount: 15000,
    description: 'هدیه خوش‌آمدگویی عضویت در خانواده اتصال',
    status: 'completed',
    date: 'امروز - لحظاتی پیش',
    referenceId: 'GIFT-ETESAL-2026'
  }
];

/**
 * ایجاد تراکنش افزایش موجودی (شارژ)
 * ⚠️ WARNING: In V7.1 Database Schema, client-side INSERT to wallet_transactions is BLOCKED by RLS.
 * This function currently acts as a local mock. In a production environment, this must be 
 * handled via a secure backend webhook using the service_role key.
 */
export function createDepositTransaction(amount: number, referenceId: string): WalletTransaction {
  return {
    id: `tx-dep-${Date.now()}`,
    type: 'deposit',
    amount,
    description: `افزایش موجودی کیف پول (کد پیگیری: ${referenceId})`,
    status: 'completed',
    date: 'هم‌اکنون',
    referenceId
  };
}

/**
 * خرید کانفیگ اختصاصی با کسر از کیف پول
 * ⚠️ WARNING: RLS blocks client inserts for transactions. This is a local simulation.
 * Real purchases must be handled on a secure backend that verifies balance and updates subscription via service_role.
 */
export function purchaseDedicatedConfig(
  user: User,
  product: DedicatedConfigProduct
): { success: boolean; updatedUser?: User; error?: string; transaction?: WalletTransaction } {
  if (user.walletBalance < product.priceTomans) {
    const shortage = product.priceTomans - user.walletBalance;
    return {
      success: false,
      error: `موجودی کیف پول شما کافی نیست. لطفا حداقل ${shortage.toLocaleString('fa-IR')} تومان حساب خود را شارژ کنید.`
    };
  }

  const newBalance = user.walletBalance - product.priceTomans;
  const newTx: WalletTransaction = {
    id: `tx-buy-${Date.now()}`,
    type: 'purchase',
    amount: product.priceTomans,
    description: `خرید ${product.title}`,
    status: 'completed',
    date: 'هم‌اکنون',
    referenceId: `ET-${Date.now().toString().slice(-6)}`
  };

  const updatedTransactions = [newTx, ...(user.transactions || [])];

  // تولید لینک سابسکریپشن اختصاصی
  const uniqueSubKey = `vip_${user.username}_${Date.now().toString(36)}`;
  const dedicatedSubUrl = `https://etesal.aetherai.ir/api/sub/${uniqueSubKey}?token=${Date.now()}`;

  const updatedUser: User = {
    ...user,
    role: 'vip',
    walletBalance: newBalance,
    transactions: updatedTransactions,
    subscription: {
      ...user.subscription,
      planName: product.title,
      totalTrafficGB: (user.subscription.totalTrafficGB || 0) + product.trafficGB,
      daysRemaining: (user.subscription.daysRemaining || 0) + product.durationDays,
      status: 'active',
      subscriptionUrl: dedicatedSubUrl
    }
  };

  return {
    success: true,
    updatedUser,
    transaction: newTx
  };
}
