import { NewsArticle } from '../types/news';

export const SAMPLE_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'iran-internet-disruption-datacenter-status-report',
    title: 'گزارش آخرین وضعیت اختلالات اینترنت و مسدودسازی پورت‌های امنیتی در دیتاسنترهای داخلی',
    summary: 'بررسی فنی تغییرات اخیر در سامانه فیلترینگ کشور و اختلالات ایجاد شده روی پروتکل‌های TLS و پورت‌های رمزنگاری شده.',
    content: [
      'بر اساس گزارش‌های فنی منتشر شده از سوی مانیتورینگ‌های مستقل و وضعیت اتصال در دیتاسنترهای اصلی کشور (از جمله همراه اول، ایرانسل و های‌وب)، طی روزهای اخیر تغییراتی در سیستم بازرسی عمیق بسته‌ها (DPI) اعمال شده است.',
      'این تغییرات عمدتاً بر روی شناسایی رفتارهای پروتکل TLS 1.3 و پکت‌های اولیه Handshake متمرکز بوده که باعث بروز کندی و تاخیر در اتصال کاربران عادی به وب‌سایت‌های بین‌المللی شده است.',
      'توصیه کارشناسان شبکه برای حفظ پایداری ارتباط، استفاده از پروتکل‌های مقاوم در برابر فیلترینگ مانند VLESS Reality با دامنه معتبر (Server Name Indication) و پروتکل Hysteria 2 بر بستر UDP استاندارد است.'
    ],
    category: 'network_censorship',
    categoryLabelFa: 'اختلالات شبکه و فیلترینگ',
    sourceName: 'دیده‌بان ارتباطات ایران / IODA',
    sourceUrl: 'https://ioda.inetintel.cc.gatech.edu/',
    sourceType: 'iranian',
    author: 'تیم پژوهش شبکه اتصال',
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    tags: ['فیلترینگ', 'وضعیت شبکه', 'Reality', 'DPI', 'اینترنت'],
    isBreaking: true,
    viewsCount: 1420
  },
  {
    id: 'news-2',
    slug: 'cloudflare-radar-global-bgp-routing-security',
    title: 'کلادفلر رادار: تحلیل حملات نوین BGP Hijacking و ارتقای امنیت مسیرهای بین‌المللی',
    summary: 'گزارش شرکت کلادفلر درباره تهدیدات نوظهور در جدول مسیریابی اینترنت جهانی و راهکارهای تایید اعتبار مسیر RPKI.',
    content: [
      'سامانه رادار کلادفلر (Cloudflare Radar) در گزارش جدید خود اعلام کرد که خطاهای مسیریابی BGP و حملات جعل مسیر در ۶ ماه گذشته رشد ۱۸ درصدی داشته‌اند.',
      'این اختلالات می‌توانند ترافیک کاربران را به مقصدهای اشتباه یا سرورهای بازرسی هدایت کنند. پیاده‌سازی امضاهای رمزنگاری RPKI توسط اپراتورهای مخابراتی اصلی‌ترین راه‌حل امن‌سازی هسته اینترنت معرفی شده است.'
    ],
    category: 'security_privacy',
    categoryLabelFa: 'امنیت و حریم خصوصی',
    sourceName: 'Cloudflare Radar Blog',
    sourceUrl: 'https://blog.cloudflare.com/',
    sourceType: 'international',
    author: 'Cloudflare Security Team',
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    tags: ['کلادفلر', 'امنیت سایبری', 'BGP', 'DNS', 'شبکه جهانی'],
    isBreaking: false,
    viewsCount: 890
  },
  {
    id: 'news-3',
    slug: 'linux-kernel-bbr3-congestion-control-speed-boost',
    title: 'توسعه الگوریتم جدید BBRv3 در هسته لینوکس؛ جهش سرعت در شبکه‌های با پکت‌لاس بالا',
    summary: 'گوگل و جامعه توسعه‌دهندگان لینوکس نسخه سوم الگوریتم کنترل ازدحام BBR را برای بهبود سرعت اتصالات معرفی کردند.',
    content: [
      'الگوریتم BBR (Bottleneck Bandwidth and RTT) یکی از بهترین الگوریتم‌های مدیریت ازدحام شبکه در سرورهای لینوکسی است که عملکرد فوق‌العاده‌ای در شبکه‌های با درصد افت بسته (Packet Loss) بالا دارد.',
      'در نسخه جدید BBRv3، تاخیر صف‌ها تا ۳۰٪ کاهش یافته و پایداری استریم ویدیو و دانلود در شبکه‌های شلوغ تلفن همراه به شکل چشمگیری ارتقا یافته است.'
    ],
    category: 'tech_world',
    categoryLabelFa: 'دنیای لینوکس و کامپیوتر',
    sourceName: 'Phoronix & Kernel.org',
    sourceUrl: 'https://www.phoronix.com/',
    sourceType: 'international',
    author: 'مهندسی زیرساخت سیستم‌ها',
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    tags: ['لینوکس', 'BBR', 'سرعت اینترنت', 'سرور', 'شبکه'],
    isBreaking: false,
    viewsCount: 650
  },
  {
    id: 'news-4',
    slug: 'iran-fiber-optic-ftth-coverage-progress-challenges',
    title: 'بررسی روند توسعه اینترنت فیبر نوری (FTTH) در شهرهای بزرگ و چالش‌های پهنای باند بین‌الملل',
    summary: 'ارزیابی وضعیت واقعی پوشش فیبر نوری و کیفیت دسترسی کاربران خانگی به اینترنت با پینگ پایین در سال جاری.',
    content: [
      'پروژه توسعه فیبر نوری منازل و کسب‌وکارها در شهرهای مختلف کشور در حال پیگیری است، اما کاربران همچنان با چالش محدودیت در پهنای باند بین‌الملل و نوسان پینگ در ساعات اوج مصرف مواجه هستند.',
      'کارشناسان معتقدند ارتقای زیرساخت فیزیکی فیبر نوری بدون رفع محدودیت‌های ترانزیت بین‌الملل و اصلاح معماری فیلترینگ، تاثیر محدودی بر کیفیت تجربه وب‌گردی آزاد کاربران خواهد داشت.'
    ],
    category: 'network_censorship',
    categoryLabelFa: 'اختلالات شبکه و فیلترینگ',
    sourceName: 'دیجیاتو و گزارش‌های اپراتوری',
    sourceUrl: 'https://digiato.com/',
    sourceType: 'iranian',
    author: 'بخش فناوری و ارتباطات',
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    tags: ['فیبر نوری', 'پینگ', 'همراه اول', 'ایرانسل', 'اینترنت ثابت'],
    isBreaking: false,
    viewsCount: 1120
  },
  {
    id: 'news-5',
    slug: 'bleepingcomputer-zero-day-vpn-vulnerability-alert',
    title: 'هشدار امنیتی: رفع آسیب‌پذیری بحرانی در سرویس‌های VPN سازمانی و راهنمای به‌روزرسانی',
    summary: 'محققان امنیتی نقص امنیتی مهمی را شناسایی کردند که به مهاجمان اجازه دور زدن احراز هویت اولیه را می‌داد.',
    content: [
      'یک گروه تحقیقاتی امنیت سایبری از کشف یک نقص روز-صفر (Zero-Day) در برخی نرم‌افزارهای تجاری خبر داد که با انتشار پچ‌های فوری برطرف شده است.',
      'تیم فنی اتصال به تمام مدیران سیستم توصیه می‌کند نرم‌افزارهای خود را به جدیدترین نسخه هسته‌های منبع‌باز مثل Sing-Box و Xray-core ارتقا دهند.'
    ],
    category: 'security_privacy',
    categoryLabelFa: 'امنیت و حریم خصوصی',
    sourceName: 'BleepingComputer',
    sourceUrl: 'https://www.bleepingcomputer.com/',
    sourceType: 'international',
    author: 'Cyber Security Desk',
    publishedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    tags: ['امنیت', 'آسیب‌پذیری', 'Sing-Box', 'حریم خصوصی'],
    isBreaking: false,
    viewsCount: 780
  },
  {
    id: 'news-6',
    slug: 'open-source-ai-models-local-inference-privacy',
    title: 'رشد چشمگیر مدل‌های هوش مصنوعی منبع‌باز محلی و حفظ ۱۰۰٪ حریم خصوصی داده‌ها',
    summary: 'چگونه اجرای مدل‌های زبانی روی سیستم‌های شخصی بدون ارسال داده به سرورهای خارجی، امنیت کاربران را متحول کرده است.',
    content: [
      'با پیشرفت فریم‌ورک‌های سبک مانند Ollama و llama.cpp، امکان اجرای دستیارهای هوش مصنوعی قدرتمند به صورت آفلاین و بدون نیاز به اینترنت فراهم شده است.',
      'این رویکرد برای کاربرانی که به دلیل فیلترینگ یا حفظ حریم خصوصی مایل به ارسال اطلاعات به سرورهای خارجی نیستند، بهترین جایگزین محسوب می‌شود.'
    ],
    category: 'ai_dev',
    categoryLabelFa: 'هوش مصنوعی و ابزارها',
    sourceName: 'Hacker News / TechCrunch',
    sourceUrl: 'https://news.ycombinator.com/',
    sourceType: 'international',
    author: 'واحد هوش مصنوعی و نرم‌افزار',
    publishedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    tags: ['هوش مصنوعی', 'منبع‌باز', 'حریم خصوصی', 'Ollama'],
    isBreaking: false,
    viewsCount: 930
  }
];
