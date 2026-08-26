import { V2RayConfig } from '../types';

export const SAMPLE_CONFIGS: V2RayConfig[] = [
  {
    id: 'cfg-1',
    name: '🇩🇪 Reality Frankfurt (MCI Optimized)',
    protocol: 'vless',
    location: 'آلمان، فرانکفورت',
    flag: '🇩🇪',
    operator: 'mci',
    ping: 48,
    quality: 'excellent',
    tlsType: 'Reality (SNI: speedtest.net)',
    transport: 'gRPC / Multi-Stream',
    verifiedAt: 'لحظاتی پیش',
    isOfficial: true,
    configString: 'vless://7f98b82e-9d8a-4421-a477-90a821e25e99@fra.vpnbuying.org:443?security=reality&encryption=none&pbk=8v-wK7c3Z_uD8zW1sF2o3eM7wX9Y1Z2A3B4C5D6E7F8&headerType=none&fp=chrome&type=grpc&serviceName=grpc-reality&sni=speedtest.net&sid=20a1#%F0%9F%87%A9%F0%9F%87%AA%20Reality%20MCI%20-%20EtesalHub'
  },
  {
    id: 'cfg-2',
    name: '🇫🇮 Hysteria 2 Helsinki (Irancell Ultra UDP)',
    protocol: 'hysteria2',
    location: 'فنلاند، هلسینکی',
    flag: '🇫🇮',
    operator: 'irancell',
    ping: 54,
    quality: 'excellent',
    tlsType: 'TLS 1.3 + Salamander',
    transport: 'QUIC / UDP BBRv3',
    verifiedAt: '۲ دقیقه پیش',
    isOfficial: true,
    configString: 'hysteria2://vpnbuying_fast:EtesalHy2SecurePass@hel.vpnbuying.org:8443?insecure=0&sni=cdn.discordapp.com#%F0%9F%87%AB%F0%9F%87%AE%20Hysteria2%20Irancell%20-%20EtesalHub'
  },
  {
    id: 'cfg-3',
    name: '🇳🇱 VLESS Reality Amsterdam (Rightel & Home WiFi)',
    protocol: 'vless',
    location: 'هلند، آمستردام',
    flag: '🇳🇱',
    operator: 'rightel',
    ping: 61,
    quality: 'excellent',
    tlsType: 'Reality (SNI: microsoft.com)',
    transport: 'TCP / Vision flow',
    verifiedAt: '۵ دقیقه پیش',
    configString: 'vless://4d7e221a-6f11-44bb-99cb-129487bca881@ams.vpnbuying.org:443?security=reality&encryption=none&pbk=9p-xL8d4A_vE9aX2tG3p4fN8xY0Z2A3B4C5D6E7F8G9&headerType=none&fp=safari&type=tcp&flow=xtls-rprx-vision&sni=www.microsoft.com&sid=10c2#%F0%9F%87%B3%F0%9F%87%B1%20Reality%20Rightel%20-%20EtesalHub'
  },
  {
    id: 'cfg-4',
    name: '🇹🇷 Trojan Istanbul (Low Latency Gaming/Call)',
    protocol: 'trojan',
    location: 'ترکیه، استانبول',
    flag: '🇹🇷',
    operator: 'all',
    ping: 39,
    quality: 'excellent',
    tlsType: 'TLS 1.3 ALPN',
    transport: 'WebSocket (Multiplex)',
    verifiedAt: '۸ دقیقه پیش',
    configString: 'trojan://vpn_buying_turbo_secret@ist.vpnbuying.org:443?security=tls&type=ws&path=%2Ftrojan-stream&sni=telecom.com.tr#%F0%9F%87%B9%F0%9F%87%B7%20Trojan%20Gaming%20-%20EtesalHub'
  },
  {
    id: 'cfg-5',
    name: '🇦🇹 TUIC v5 Vienna (Anti-DPI / Fragment)',
    protocol: 'tuic',
    location: 'اتریش، وین',
    flag: '🇦🇹',
    operator: 'wifi',
    ping: 68,
    quality: 'good',
    tlsType: 'QUIC / TLS 1.3',
    transport: 'Native UDP Datagram',
    verifiedAt: '۱۲ دقیقه پیش',
    configString: 'tuic://81b94c3e-51da-4299-bb99-317498cda902:EtesalTUICPass@vie.vpnbuying.org:8443?congestion_control=bbr&alpn=h3&sni=gate.cloudflare.com#%F0%9F%87%A6%F0%9F%87%B9%20TUIC%20AntiDPI%20-%20EtesalHub'
  },
  {
    id: 'cfg-6',
    name: '🇸🇪 Shadowsocks 2022 Stockholm (Clean IP)',
    protocol: 'shadowsocks',
    location: 'سوئد، استکهلم',
    flag: '🇸🇪',
    operator: 'mci',
    ping: 72,
    quality: 'good',
    tlsType: '2022-blake3-aes-128-gcm',
    transport: 'Direct TCP',
    verifiedAt: '۱۵ دقیقه پیش',
    configString: 'ss://MjAyMi1ibGFrZTMtYWVzLTEyOC1nY206c3Nfc2VjdXJlX2tleV9ldGVzYWw=@sto.vpnbuying.org:1080#%F0%9F%87%B8%F0%9F%87%AA%20SS2022%20MCI%20-%20EtesalHub'
  }
];

export const SUBSCRIPTION_URLS = {
  mci: 'https://sub.vpnbuying.org/v2ray/mci-reality.txt',
  irancell: 'https://sub.vpnbuying.org/v2ray/irancell-hy2.txt',
  rightel: 'https://sub.vpnbuying.org/v2ray/rightel-vision.txt',
  all: 'https://sub.vpnbuying.org/v2ray/all-operators.txt'
};
