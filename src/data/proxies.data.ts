import { MtprotoProxy } from '../types';

export const SAMPLE_PROXIES: MtprotoProxy[] = [
  {
    id: 'prx-1',
    name: '⚡ آلمان فرانکفورت (فوق‌العاده سریع / پینگ ۳۸)',
    host: 'fra-core.vpnbuying.org',
    port: 443,
    secret: 'ee112233445566778899aabbccddeeff117777772e676f6f676c652e636f6d',
    ping: 38,
    location: 'فرانکفورت، آلمان',
    flag: '🇩🇪',
    verifiedAt: 'لحظاتی پیش',
    sponsorChannel: '@vpnbuying',
    isVip: true
  },
  {
    id: 'prx-2',
    name: '🛡️ فنلاند هلسینکی (ضد فیلتر قوی / پورت ایمن TLS)',
    host: 'hel-relay.vpnbuying.org',
    port: 8443,
    secret: 'ee2233445566778899aabbccddeeff00117370656564746573742e6e6574',
    ping: 44,
    location: 'هلسینکی، فنلاند',
    flag: '🇫🇮',
    verifiedAt: '۲ دقیقه پیش',
    sponsorChannel: '@vpnbuying',
    isVip: true
  },
  {
    id: 'prx-3',
    name: '🚀 هلند آمستردام (ترافیک نامحدود / دانلود سریع)',
    host: 'ams-fast.vpnbuying.org',
    port: 443,
    secret: 'ee33445566778899aabbccddeeff0022337777772e636c6f7564666c6172652e636f6d',
    ping: 49,
    location: 'آمستردام، هلند',
    flag: '🇳🇱',
    verifiedAt: '۴ دقیقه پیش',
    sponsorChannel: '@vpnbuying'
  },
  {
    id: 'prx-4',
    name: '🎯 فرانسه پاریس (پینگ پایدار / ویس و تماس بدون قطعی)',
    host: 'par-node.vpnbuying.org',
    port: 8080,
    secret: 'ee445566778899aabbccddeeff003344557777772e77696b6970656469612e6f7267',
    ping: 52,
    location: 'پاریس، فرانسه',
    flag: '🇫🇷',
    verifiedAt: '۷ دقیقه پیش',
    sponsorChannel: '@vpnbuying'
  },
  {
    id: 'prx-5',
    name: '🪐 انگلستان لندن (نود خلوت / مخصوص همراه اول)',
    host: 'lon-edge.vpnbuying.org',
    port: 443,
    secret: 'ee5566778899aabbccddeeff00445566777777772e6170706c652e636f6d',
    ping: 58,
    location: 'لندن، انگلستان',
    flag: '🇬🇧',
    verifiedAt: '۱۱ دقیقه پیش',
    sponsorChannel: '@vpnbuying'
  },
  {
    id: 'prx-6',
    name: '💎 ترکیه استانبول (کمترین تأخیر / مخصوص ایرانسل)',
    host: 'ist-tunnel.vpnbuying.org',
    port: 443,
    secret: 'ee66778899aabbccddeeff0055667788997777772e79616e6465782e636f6d',
    ping: 32,
    location: 'استانبول، ترکیه',
    flag: '🇹🇷',
    verifiedAt: '۱۵ دقیقه پیش',
    sponsorChannel: '@vpnbuying',
    isVip: true
  }
];
