export interface AppReleaseInfo {
  version: string;
  versionCode: number;
  releaseDate: string;
  releaseDateFa: string;
  fileSizeMB: number;
  minAndroidVersion: string;
  targetAndroidVersion: string;
  downloadUrl: string;
  sha256Checksum: string;
  changelog: string[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export const CURRENT_APP_RELEASE: AppReleaseInfo = {
  version: '6.0.0',
  versionCode: 60,
  releaseDate: '2026-08-25',
  releaseDateFa: 'شهریور ۱۴۰۵',
  fileSizeMB: 6.8,
  minAndroidVersion: 'Android 7.0 (Nougat) یا بالاتر',
  targetAndroidVersion: 'Android 14 (API 34)',
  downloadUrl: '/downloads/etesal-v6.0.0.apk',
  sha256Checksum: '3f3fc241ad9b96e136206eefce71b82a181ccff52634bcf359f353dd4bc3b2ee',
  changelog: [
    'بهینه‌سازی کامل هسته Sing-Box Core و پروتکل‌های Reality / Hysteria 2',
    'افزایش سرعت تاخیر اولیه اتصال به زیر ۴۵ میلی‌ثانیه',
    'پشتیبانی ارتقایافته از سیستم مسیریابی هوشمند در همراه اول و ایرانسل',
    'حالت بهینه‌سازی باتری و مصرف رم در پس‌زمینه (Ultra Low Memory Mode)',
    'رفع باگ‌های اتصال خودکار در هنگام تغییر دیتای موبایل به وای‌فای'
  ],
  features: [
    {
      title: 'هسته ارتباطی Sing-Box Core',
      description: 'ترکیب پروتکل‌های نوین Hysteria 2 و VLESS Reality با شبیه‌سازی ترافیک معتبر TLS 1.3',
      icon: 'Zap'
    },
    {
      title: 'بدون ثبت لاگ و ۱۰۰٪ امن',
      description: 'رمزنگاری کامل ارتباطات کلاینت با سرورها بدون هیچ‌گونه ذخیره‌سازی داده شخصی',
      icon: 'ShieldCheck'
    },
    {
      title: 'قابلیت تونل انتخابی (Split Tunneling)',
      description: 'امکان استثنا کردن اپلیکیشن‌های بانکی و ایرانی از مسیر اتصال به صورت مستقیم',
      icon: 'Cpu'
    },
    {
      title: 'سوئیچ خودکار سرور هوشمند',
      description: 'پایش دائمی پینگ و اتصال پایدار بدون قطعی در شرایط اختلال شدید شبکه',
      icon: 'Activity'
    }
  ]
};
