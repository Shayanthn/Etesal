import { FeedSource, AdminSystemLog, MusicTrack, AdminTelemetryStats, AdminSupportTicket } from '../types/admin';

export const INITIAL_FEED_SOURCES: FeedSource[] = [
  // 1. News Feeds
  {
    id: 'src-news-1',
    name: 'Cloudflare Blog (Security & Network Radar)',
    url: 'https://blog.cloudflare.com/rss/',
    type: 'rss_news',
    targetCategory: 'security_privacy',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 60,
    totalFetchedCount: 142,
    healthStatus: 'healthy'
  },
  {
    id: 'src-news-2',
    name: 'دیجیاتو - بخش ارتباطات و زیرساخت اینترنت',
    url: 'https://digiato.com/feed',
    type: 'rss_news',
    targetCategory: 'network_censorship',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 30,
    totalFetchedCount: 310,
    healthStatus: 'healthy'
  },
  {
    id: 'src-news-3',
    name: 'BleepingComputer Tech & Vulnerabilities',
    url: 'https://www.bleepingcomputer.com/feed/',
    type: 'rss_news',
    targetCategory: 'security_privacy',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 60,
    totalFetchedCount: 98,
    healthStatus: 'healthy'
  },

  // 2. Verified V2Ray / Reality / Hysteria 2 Config Sources (For Iran)
  {
    id: 'src-cfg-1',
    name: 'کانال تلگرام مرجع @v2rayng_org (VLESS Reality & Hy2)',
    url: 'https://t.me/s/v2rayng_org',
    type: 'telegram_config',
    targetCategory: 'configs',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 15,
    totalFetchedCount: 2450,
    healthStatus: 'healthy'
  },
  {
    id: 'src-cfg-2',
    name: 'کانال تلگرام @FreeVmess (کانفیگ‌های همراه اول و ایرانسل)',
    url: 'https://t.me/s/FreeVmess',
    type: 'telegram_config',
    targetCategory: 'configs',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 15,
    totalFetchedCount: 1890,
    healthStatus: 'healthy'
  },
  {
    id: 'src-cfg-3',
    name: 'کانال تلگرام @V2rayNGn (نودهای Reality پینگ پایین)',
    url: 'https://t.me/s/V2rayNGn',
    type: 'telegram_config',
    targetCategory: 'configs',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 20,
    totalFetchedCount: 1420,
    healthStatus: 'healthy'
  },
  {
    id: 'src-cfg-4',
    name: 'مخزن سابسکریپشن vfarid (تفکیک‌شده اپراتورهای ایران)',
    url: 'https://raw.githubusercontent.com/vfarid/v2ray-share/master/splited/all.txt',
    type: 'telegram_config',
    targetCategory: 'configs',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 30,
    totalFetchedCount: 3800,
    healthStatus: 'healthy'
  },
  {
    id: 'src-cfg-5',
    name: 'مخزن تجمیعی mahdibland (V2Ray Aggregator Live Feed)',
    url: 'https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/sub_merge.txt',
    type: 'telegram_config',
    targetCategory: 'configs',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 30,
    totalFetchedCount: 4200,
    healthStatus: 'healthy'
  },
  {
    id: 'src-cfg-6',
    name: 'کالکشن barry-far (کانفیگ‌های بهینه VLESS Reality)',
    url: 'https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub1.txt',
    type: 'telegram_config',
    targetCategory: 'configs',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 45,
    totalFetchedCount: 1650,
    healthStatus: 'healthy'
  },

  // 3. Verified MTProto Anti-Filter Proxy Sources (For Iran)
  {
    id: 'src-prx-1',
    name: 'کانال تلگرام @MTProto_Proxy_IR (پروکسی‌های سرعتی Fake-TLS)',
    url: 'https://t.me/s/MTProto_Proxy_IR',
    type: 'telegram_proxy',
    targetCategory: 'proxies',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 10,
    totalFetchedCount: 1540,
    healthStatus: 'healthy'
  },
  {
    id: 'src-prx-2',
    name: 'کانال تلگرام @TelMTProto (پروکسی‌های دائمی پورت 443)',
    url: 'https://t.me/s/TelMTProto',
    type: 'telegram_proxy',
    targetCategory: 'proxies',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 10,
    totalFetchedCount: 1220,
    healthStatus: 'healthy'
  },
  {
    id: 'src-prx-3',
    name: 'کانال تلگرام @ProxyMTProto (پروکسی‌های جهانی با تاخیر پایین)',
    url: 'https://t.me/s/ProxyMTProto',
    type: 'telegram_proxy',
    targetCategory: 'proxies',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 15,
    totalFetchedCount: 980,
    healthStatus: 'healthy'
  },
  {
    id: 'src-prx-4',
    name: 'کانال تلگرام @iMTProto (نودهای فرانکفورت و هلسینکی ضد فیلتر)',
    url: 'https://t.me/s/iMTProto',
    type: 'telegram_proxy',
    targetCategory: 'proxies',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 15,
    totalFetchedCount: 1100,
    healthStatus: 'healthy'
  },
  {
    id: 'src-prx-5',
    name: 'کانال تلگرام @TelegramProxies_IR (سکرت‌های TLS 1.3 اختصاصی)',
    url: 'https://t.me/s/TelegramProxies_IR',
    type: 'telegram_proxy',
    targetCategory: 'proxies',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 15,
    totalFetchedCount: 870,
    healthStatus: 'healthy'
  },

  // 4. Music Sources
  {
    id: 'src-mus-1',
    name: 'فید آرشیو موزیک‌های الکترونیک و بی‌کلام تلگرام',
    url: 'https://t.me/s/ambient_chill_music',
    type: 'telegram_music',
    targetCategory: 'music',
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    fetchIntervalMinutes: 120,
    totalFetchedCount: 65,
    healthStatus: 'healthy'
  }
];

export const INITIAL_TELEMETRY_STATS: AdminTelemetryStats = {
  totalUsers: 14850,
  activeOnlineUsers: 642,
  totalConfigs: 18,
  healthyConfigs: 16,
  totalProxies: 12,
  activeProxies: 11,
  totalNews: 6,
  breakingNewsCount: 1,
  totalMusicTracks: 8,
  pendingTicketsCount: 3,
  systemUptime: '99.98% (42 روز مداوم)',
  serverLoadPercent: 18.4,
  memoryUsageMb: 245,
  edgeRequestsToday: 84230
};

export const INITIAL_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Cyberpunk Ambient Waves',
    artist: 'Etesal Sound Lab',
    genre: 'Synthwave / Lo-Fi',
    duration: '03:45',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    fileSizeMb: 5.4,
    downloadsCount: 1420,
    isSentToTelegram: true,
    telegramMessageId: 'msg_9841',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'track-2',
    title: 'Midnight Deep Focus',
    artist: 'Neural Beatmaker',
    genre: 'Chillstep / Focus',
    duration: '04:12',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    fileSizeMb: 6.1,
    downloadsCount: 890,
    isSentToTelegram: true,
    telegramMessageId: 'msg_9842',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'track-3',
    title: 'Dark Reality Synth Loop',
    artist: 'V2 Sound Core',
    genre: 'Electronic / Dark Synth',
    duration: '02:50',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    fileSizeMb: 4.2,
    downloadsCount: 650,
    isSentToTelegram: false,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  }
];

export const INITIAL_SYSTEM_LOGS: AdminSystemLog[] = [
  {
    id: 'log-1',
    level: 'success',
    module: 'n8n_ingest',
    message: 'واکشی موفق فید اخبار Cloudflare Blog و استخراج ۲ خبر جدید حوزه BGP',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString('fa-IR'),
    details: '2 items filtered by security keyword'
  },
  {
    id: 'log-2',
    level: 'info',
    module: 'openrouter_ai',
    message: 'ترجمه و ساخت اسلاگ سئو برای مقاله انگلیسی با مدل DeepSeek Free با موفقیت پایان یافت (مدت: ۱.۴ ثانیه)',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString('fa-IR')
  },
  {
    id: 'log-3',
    level: 'success',
    module: 'edge_cdn',
    message: 'کش سراسری لبه کلادفلر رفرش شد (Cache Hit Ratio: 96.8%)',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString('fa-IR')
  },
  {
    id: 'log-4',
    level: 'warn',
    module: 'supabase_db',
    message: 'تست پینگ دسته‌جمعی کانفیگ‌ها: ۲ نود Reality به دلیل تاخیر بالای ۵۰۰ms موقتا غیرفعال شدند',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toLocaleTimeString('fa-IR'),
    details: 'Node de-prioritized automatically'
  },
  {
    id: 'log-5',
    level: 'info',
    module: 'telegram_bot',
    message: 'موزیک شماره track-2 با موفقیت به کانال رسمی تلگرام پوش شد',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toLocaleTimeString('fa-IR')
  }
];

export const INITIAL_SUPPORT_TICKETS: AdminSupportTicket[] = [
  {
    id: 'TK-849201',
    subject: 'اختلال پورت Reality در اینترنت همراه اول (MCI)',
    category: 'connection',
    operator: 'mci',
    userName: 'علی کاظمی',
    userEmail: 'ali.kazemi@gmail.com',
    telegramUsername: '@ali_kzm99',
    message: 'سلام، از صبح امروز پورت‌های Reality آلمان در همراه اول با خطای Handshake Timeout مواجه میشن. آیا کانفیگ با پورت جایگزین یا فرگمنت Sing-Box موجود هست؟',
    status: 'pending',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'TK-710392',
    subject: 'درخواست کانفیگ Hysteria 2 برای ایرانسل با پینگ پایین',
    category: 'config',
    operator: 'irancell',
    userName: 'سارا رضایی',
    userEmail: 'sara_rezaei@yahoo.com',
    telegramUsername: '@sara_rz',
    message: 'کانفیگ‌های Hysteria 2 پینگ خیلی خوبی برای بازی آنلاین دارن اما روی ایرانسل بعضی ساعات قطع میشن. اگر سابسکریپشن اختصاصی VIP دارید راهنمایی کنید.',
    status: 'in_progress',
    priority: 'high',
    replyMessage: 'سلام سارا عزیز، پورت‌های UDP ایرانسل در حال نوسان هستند. کانفیگ‌های جایگزین با فرگمنت در تب کانفیگ‌ها بارگذاری شد.',
    repliedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'TK-639104',
    subject: 'مشکل کرش اپلیکیشن اندروید در اندروید ۱۴',
    category: 'app',
    operator: 'wifi',
    userName: 'محمدرضا',
    userEmail: 'm.reza.dev@gmail.com',
    telegramUsername: '@mreza_dev',
    message: 'نسخه جدید APK رو روی سامسونگ S24 Ultra نصب کردم و زمان استارت هسته Sing-Box متوقف میشه. لاگ رو براتون فرستادم.',
    status: 'resolved',
    priority: 'medium',
    replyMessage: 'درود، نسخه v6.0.2 اپلیکیشن با حل مشکل دسترسی VPNService در اندروید ۱۴ در تب دانلود قرار گرفت.',
    repliedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString()
  },
  {
    id: 'TK-519280',
    subject: 'عدم اتصال پروکسی تلگرام در اینترنت فیبر نوری شاتل',
    category: 'connection',
    operator: 'shatel',
    userName: 'امید سعیدی',
    telegramUsername: '@omid_saeedi',
    message: 'پروکسی‌های MTProto روی شاتل کانکت نمیشن ولی کانفیگ‌های Reality بدون مشکل کار میکنن.',
    status: 'closed',
    priority: 'low',
    replyMessage: 'پروکسی جدید TLS با دامنه کلادفلر اضافه شد و مشکل رفع گردید.',
    repliedAt: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 600 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 480 * 60 * 1000).toISOString()
  }
];
