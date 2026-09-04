import { MtprotoProxy } from '../types';

export const SAMPLE_PROXIES: MtprotoProxy[] = [
  {
    id: 'prx-de-01',
    name: 'MTProto Ultra - Frankfurt (Fake-TLS)',
    host: 'fra-tls.cloudflare-tunnel.net',
    port: 443,
    secret: 'ee720316948314000000000000000000007777772e676f6f676c652e636f6d',
    ping: 42,
    location: 'آلمان (فرانکفورت)',
    flag: '🇩🇪',
    verifiedAt: 'لحظاتی پیش',
    isVip: false
  },
  {
    id: 'prx-nl-02',
    name: 'MTProto Direct - Amsterdam (TLS 1.3)',
    host: 'ams-speed.telegram-edge.com',
    port: 443,
    secret: 'ee000000000000000000000000000000017777772e636c6f7564666c6172652e636f6d',
    ping: 38,
    location: 'هلند (آمستردام)',
    flag: '🇳🇱',
    verifiedAt: 'لحظاتی پیش',
    isVip: false
  },
  {
    id: 'prx-fi-03',
    name: 'MTProto Hetzner - Helsinki',
    host: 'hel-node.network-shield.org',
    port: 8443,
    secret: 'ee1234567890abcdef1234567890abcdef7777772e7961686f6f2e636f6d',
    ping: 55,
    location: 'فنلاند (هلسینکی)',
    flag: '🇫🇮',
    verifiedAt: 'لحظاتی پیش',
    isVip: false
  },
  {
    id: 'prx-fr-04',
    name: 'MTProto OVH - Paris',
    host: 'par-core.fast-tg.io',
    port: 443,
    secret: 'eeabcdef1234567890abcdef12345678907777772e6d6963726f736f66742e636f6d',
    ping: 49,
    location: 'فرانسه (پاریس)',
    flag: '🇫🇷',
    verifiedAt: 'لحظاتی پیش',
    isVip: false
  },
  {
    id: 'prx-uk-05',
    name: 'MTProto London Relay (MCI / Irancell)',
    host: 'lon-gw.free-proxy-list.org',
    port: 443,
    secret: 'ee9876543210fedcba9876543210fedcba7777772e6170706c652e636f6d',
    ping: 45,
    location: 'انگلستان (لندن)',
    flag: '🇬🇧',
    verifiedAt: 'لحظاتی پیش',
    isVip: false
  },
  {
    id: 'prx-us-06',
    name: 'MTProto US East - Ashburn',
    host: 'iad-turbo.cdn-proxy.net',
    port: 443,
    secret: 'ee11223344556677889900aabbccddeeff7777772e616d617a6f6e2e636f6d',
    ping: 98,
    location: 'آمریکا (ویرجینیا)',
    flag: '🇺🇸',
    verifiedAt: 'لحظاتی پیش',
    isVip: false
  }
];
