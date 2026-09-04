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
    name: 'کانال تلگرام @iMTProto (نودهای فرانکفورت و هلسینکی اختصاصی)',
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
    title: 'Neon Horizon (Cyberpunk Drift)',
    artist: 'Kavinsky & Lorn (Synthetics)',
    genre: 'Synthwave / Retrowave',
    album: 'Outrun Chronicles',
    year: 2024,
    duration: '03:45',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 5.4,
    downloadsCount: 1420,
    isSentToTelegram: true,
    telegramMessageId: 'msg_9841',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    description: 'یک قطعه سینث‌ویو عمیق با باس‌های آنالوگ ژرف و ریتم متوالی که حس حرکت در اتوبان‌های نئونی توکیو در نیمه‌شب بارانی را القا می‌کند.',
    lyrics: `[Intro - Synth Arp]
Cruising through the electric rain
Neon signs reflect the pain
Speeding past the skyline glow
Nowhere left for us to go

[Chorus]
Hold on to the night, let the frequency ride
Through the endless dark where the shadows hide
We are the pulse in the digital wire
Burning through the cold like an electric fire

[Outro]
Signal lost in the night...
Horizon fades to white...`,
    lyricsFa: `[مقدمه]
حرکت در میان باران‌های الکتریکی
تابلوهای نئونی بازتاب رنج ما هستند
شتابان از روشنایی خط افق می‌گذریم
جایی جز پیشروی برایمان نمانده است

[هم‌خوانی]
شب را محکم در آغوش بگیر، بگذار فرکانس جاری شود
از میان تاریکی بی‌پایان که سایه‌ها در آن پنهانند
ما نبض زنده در این سیم‌های دیجیتال هستیم
که در سرمای نیمه‌شب چون آتش می‌سوزیم...`
  },
  {
    id: 'track-2',
    title: 'Midnight Deep Focus',
    artist: 'Tycho & Solar Fields',
    genre: 'Ambient / Chillstep',
    album: 'Conscious State',
    year: 2023,
    duration: '04:12',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 6.1,
    downloadsCount: 1890,
    isSentToTelegram: true,
    telegramMessageId: 'msg_9842',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    description: 'قطعه‌ای تسکین‌بخش و آرام با ضرب‌آهنگ ارگانیک و فرکانس‌های آلفا جهت تسهیل عمیق‌ترین تمرکز کاری و کدنویسی شبانه بدون حواس‌پرتی.',
    lyrics: `[Ambient Vocals]
Breathe in the silence, let the noise fade
Step into the sanctuary we have made
Waves of stillness, gentle and deep
Waking thoughts that never fall asleep

[Echo]
Clear mind, steady hand
Wandering through the timeless land.`,
    lyricsFa: `[زمزمه ملایم]
سکوت را تنفس کن، بگذار هیاهوی جهان محو شود
قدم به پناهگاهی بگذار که آفریده‌ایم
امواج آرامش، زلال و عمیق
افکاری هوشیار که هرگز به خواب نمی‌روند

[طنین]
ذهنی شفاف، دستانی استوار
رهسپار سرزمین بی‌زمان.`
  },
  {
    id: 'track-3',
    title: 'Dark Reality Protocol',
    artist: 'Master Boot Record',
    genre: 'Cyberpunk / Darksynth',
    album: 'Encrypted Kernels',
    year: 2024,
    duration: '02:50',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 4.2,
    downloadsCount: 1150,
    isSentToTelegram: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    description: 'ترکیبی کوبنده از دیستورشن‌های صنعتی و گیتار سینث‌سایز شده با تم آزادی اطلاعات و گذر از فایروال‌های سخت‌افزاری.',
    lyrics: `[Machine Voice Transmission]
Handshake initiated.
Bypassing DPI gateway...
Tunnel active. Cipher AES-256-GCM.

[Verse]
Zeroes and ones in an infinite stream
Waking the ghost from the broken machine
No border can hold what the network creates
Breaking the locks on the iron gates!`,
    lyricsFa: `[پیام صوتی ماشین]
دست‌دادن امن آغاز شد.
عبور موفق از فایروال لایه بازرسی عمیق...
تونل فعال است با رمزنگاری پیشرفته.

[بند ترانه]
صفرها و یک‌ها در جریانی لایتناهی
روح خفته را در ماشین شکسته بیدار می‌کنند
هیچ مرزی قادر به محصور کردن شبکه نیست
قفل‌های دروازه‌های آهنین فرو می‌ریزند!`
  },
  {
    id: 'track-4',
    title: 'Infinite Starlight Echoes',
    artist: 'Carbon Based Lifeforms',
    genre: 'Space Ambient / Downtempo',
    album: 'Interstellar Drift',
    year: 2023,
    duration: '04:45',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f772dd.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 6.8,
    downloadsCount: 2130,
    isSentToTelegram: true,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    description: 'سفری در اقیانوس کیهانی با استفاده از پدهای اتمسفریک و زنگ‌های کریستالی که حس معلق بودن در مدار زمین را به شنونده منتقل می‌کند.',
    lyrics: `[Spoken Word]
Looking down upon the blue marble
No borders drawn by hands of clay
Only light traversing the void
Drifting away... drifting away...`,
    lyricsFa: `[دکلمه کلامی]
نگاه از فراز به گوی نیلگون زمین
هیچ مرزی با دستان خاکی ترسیم نشده است
تنها نور است که خلاء را می‌شکافد
دور می‌شویم... در کهکشان معلق می‌شویم...`
  },
  {
    id: 'track-5',
    title: 'Lost in Shibuya Rain',
    artist: 'Lofi Fruits Music',
    genre: 'Lo-Fi Hip Hop / Chillout',
    album: 'Tokyo Rainy Days',
    year: 2024,
    duration: '03:15',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e01.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 4.8,
    downloadsCount: 3240,
    isSentToTelegram: true,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    description: 'صدای خش‌خش نوستالژیک گرامافون (Vinyl Crackle) ترکیب شده با پیانوی جاز و صدای دل‌انگیز برخورد قطرات باران روی پنجره.',
    lyrics: `[Soft Whispers]
Coffee cups and foggy glass
Watching all the moments pass
Footsteps echo down the street
Raindrops keeping up the beat

Stay with me until the dawn
All our worries will be gone.`,
    lyricsFa: `[نجوای ملایم]
فنجان قهوه و شیشه‌های مه‌گرفته
تماشای گذر لحظه‌های بی‌پایان
طنین گام‌ها در امتداد خیابان
هم‌نوازی ضربان قطرات باران

تا سپیده‌دم در کنارم بمان
تمامی دلواپسی‌ها به دست فراموشی سپرده خواهند شد.`
  },
  {
    id: 'track-6',
    title: 'Solar Wind (Nordic Breeze)',
    artist: 'Ólafur Arnalds & Nils Frahm',
    genre: 'Neo-Classical / Ambient',
    album: 'Fjord Reflections',
    year: 2024,
    duration: '03:58',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88424c1045.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 5.8,
    downloadsCount: 970,
    isSentToTelegram: false,
    createdAt: new Date(Date.now() - 64800000).toISOString(),
    description: 'نواختن هارمونیک پیانوی نمدی به همراه آرشه‌های عمیق ویولنسل در سکوت دشت‌های ایسلند؛ بی‌نظیر برای مطالعه و تمرکز ژرف.',
    lyrics: `[Instrumental with Ethereal Breath]
Pure acoustics of cold northern air.
A minimalist meditation in harmonic minor chords.`,
    lyricsFa: `[قطعه بی‌کلام با هوای سرد شمالی]
آکوستیک ناب هوای پاک قطبی؛ مراقبه‌ای مینیمال در گام مینور هارمونیک.`
  },
  {
    id: 'track-7',
    title: 'Cyber Highway 2088',
    artist: 'Perturbator & Carpenter Brut',
    genre: 'Synthwave / Cyberpunk',
    album: 'Neo Matrix Live',
    year: 2024,
    duration: '03:32',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769be2ff.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 5.1,
    downloadsCount: 1650,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'قطعه‌ای پرانرژی و سرشار از آدرنالین با آرپژ‌های کوبنده سینث‌سایزر ۸۰s به سبک فیلم‌های علمی‌تخیلی بلید رانر.',
    lyrics: `[Cyber Pulse]
Accelerate to maximum speed
The network is the only creed
Digital lightning in the veins
Unbreakable through all the chains!`,
    lyricsFa: `[نبض سایبری]
شتاب به نهایت سرعت ممکن
تنها باور ما شبکه آزاد است
صاعقه دیجیتال در رگ‌ها
گسست‌ناپذیر در میان تمام زنجیرها!`
  },
  {
    id: 'track-8',
    title: 'Quantum Zen Garden',
    artist: 'Brian Eno & Jon Hopkins',
    genre: 'Deep Ambient / Meditation',
    album: 'Singularity Zen',
    year: 2024,
    duration: '04:20',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c36c646387.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 6.3,
    downloadsCount: 1280,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'لایه‌های صداگذاری شده با بلورهای کوارتز و هارمونی‌های ۵۲۸ هرتز برای رهایی از اضطراب و دستیابی به آرامش ذهنی پایدار.',
    lyrics: `[Subtle Hum]
In the space between two breaths
Where serenity begins.`,
    lyricsFa: `[زمزمه نامحسوس]
در فاصله میان دو دم و بازدم
آنجا که آرامش جاودانه آغاز می‌گردد.`
  },
  {
    id: 'track-9',
    title: 'Horizon Chillstep Dreams',
    artist: 'Blackmill & Seven Lions',
    genre: 'Melodic Chillstep / Bass',
    album: 'Beyond Horizon',
    year: 2024,
    duration: '03:45',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 5.4,
    downloadsCount: 2190,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'بیس‌های عمیق و ملایم با پیانوی کریستالی و وکال‌های اثیری، ایده‌آل برای برنامه‌نویسی طولانی و شب‌بیداری.',
    lyrics: `[Floating Atmosphere]
Drifting through the cosmic space
Finding peace in quiet grace
All the light returns again.`,
    lyricsFa: `[فضای شناور]
شناور در کیهان بی‌انتها
یافتن آرامش در وقار سکوت
تمام روشنایی باز خواهد گشت.`
  },
  {
    id: 'track-10',
    title: 'Neon Rain in Kyoto',
    artist: 'ChilledCow & Kupla',
    genre: 'Lo-Fi Hip Hop / Instrumental',
    album: 'Midnight in Kansai',
    year: 2024,
    duration: '02:50',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 4.1,
    downloadsCount: 3840,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'ملودی سنتی کوتو (Koto) ترکیب‌شده با ضرب‌آهنگ بوم‌بپ کلاسیک و باران دلنشین معابد تاریخی کیوتو.',
    lyrics: `[Raindrops on bamboo roofs]
Gentle stream flowing through midnight stones.`,
    lyricsFa: `[صدای قطره‌های باران روی بام خیزران]
جریان آرام آب در میان سنگ‌های نیمه‌شب.`
  },
  {
    id: 'track-11',
    title: 'Deep Space Resonance',
    artist: 'Hans Zimmer Tribute',
    genre: 'Cinematic Ambient',
    album: 'Cosmic Voyage',
    year: 2024,
    duration: '04:12',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_812c3f81e3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 6.0,
    downloadsCount: 1470,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'شاهکار ارکسترال با هارمونی‌های عمیق برنجی و تارهای فضایی الهام‌گرفته از سفر بین‌ستاره‌ای.',
    lyrics: `[Orchestral Drone]
Across the event horizon where time slows to silence.`,
    lyricsFa: `[پژواک سینمایی]
فراتر از افق رویداد، آنجا که زمان به خاموشی می‌گراید.`
  },
  {
    id: 'track-12',
    title: 'Autumn Leaves Jazzhop',
    artist: 'Nujabes Legacy',
    genre: 'Jazzhop / Chillhop',
    album: 'Spiritual Rhythms',
    year: 2024,
    duration: '03:22',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 4.9,
    downloadsCount: 2950,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'تلفیق نوآورانه ساکسیفون تنور و پرکاشن آکوستیک؛ ریتمی دلنشین برای الهام‌بخشی و طراحی خلاقانه.',
    lyrics: `[Saxophone Solo with vinyl warmth]
Breathe in the autumn air, let the melody flow.`,
    lyricsFa: `[تکنوازی ساکسیفون و گرمای صفحه گرامافون]
هوای پاییزی را نفس بکش، بگذار ملودی در روحت جریان یابد.`
  }
];

export const ADDITIONAL_ONLINE_TRACKS: MusicTrack[] = [
  {
    id: 'track-online-1',
    title: 'Cyber Highway 2088',
    artist: 'Perturbator & Carpenter Brut',
    genre: 'Synthwave / Cyberpunk',
    album: 'Neo Matrix Live',
    year: 2024,
    duration: '03:32',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769be2ff.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 5.1,
    downloadsCount: 1650,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'قطعه‌ای پرانرژی و سرشار از آدرنالین با آرپژ‌های کوبنده سینث‌سایزر ۸۰s به سبک فیلم‌های علمی‌تخیلی بلید رانر.',
    lyrics: `[Cyber Pulse]
Accelerate to maximum speed
The network is the only creed
Digital lightning in the veins
Unbreakable through all the chains!`,
    lyricsFa: `[نبض سایبری]
شتاب به نهایت سرعت ممکن
تنها باور ما شبکه آزاد است
صاعقه دیجیتال در رگ‌ها
گسست‌ناپذیر در میان تمام زنجیرها!`
  },
  {
    id: 'track-online-2',
    title: 'Quantum Zen Garden',
    artist: 'Brian Eno & Jon Hopkins',
    genre: 'Deep Ambient / Meditation',
    album: 'Singularity Zen',
    year: 2024,
    duration: '04:20',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c36c646387.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    fileSizeMb: 6.3,
    downloadsCount: 1280,
    isSentToTelegram: false,
    createdAt: new Date().toISOString(),
    description: 'لایه‌های صداگذاری شده با بلورهای کوارتز و هارمونی‌های ۵۲۸ هرتز برای رهایی از اضطراب و دستیابی به آرامش ذهنی پایدار.',
    lyrics: `[Subtle Hum]
In the space between two breaths
Where serenity begins.`,
    lyricsFa: `[زمزمه نامحسوس]
در فاصله میان دو دم و بازدم
آنجا که آرامش جاودانه آغاز می‌گردد.`
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
