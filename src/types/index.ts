export type OperatorType = 'all' | 'mci' | 'irancell' | 'rightel' | 'wifi';

export interface V2RayConfig {
  id: string;
  name: string;
  protocol: 'vless' | 'vmess' | 'trojan' | 'hysteria2' | 'shadowsocks' | 'tuic';
  location: string;
  flag: string;
  operator: OperatorType;
  ping: number;
  quality: 'excellent' | 'good' | 'medium';
  configString: string;
  tlsType: string;
  transport: string;
  verifiedAt: string;
  isOfficial?: boolean;
}

export interface MtprotoProxy {
  id: string;
  name: string;
  host: string;
  port: number;
  secret: string;
  ping: number;
  location: string;
  flag: string;
  verifiedAt: string;
  sponsorChannel?: string;
  isVip?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: 'فوری' | 'فیلترینگ' | 'پروتکل' | 'آموزش' | 'امنیت' | 'زیرساخت' | 'تکنولوژی' | string;
  source: string;
  sourceUrl?: string;
  timeAgo: string;
  date: string;
  readTime: string;
  tags: string[];
  isImportant?: boolean;
  type: 'local' | 'international';
}

export interface Article {
  id: string;
  title: string;
  description: string;
  fullContent?: string[];
  readTime: string;
  category: string;
  iconName: string;
  image?: string;
  successRate: number;
  difficulty: 'آسان' | 'متوسط' | 'پیشرفته';
  tags: string[];
  lastUpdated: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  keyTakeaways: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'all' | 'operators' | 'protocols' | 'clients' | 'general';
}

export type Language = 'fa' | 'en';

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'purchase' | 'renewal' | 'gift';
  amount: number; // in Tomans
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  referenceId?: string;
}

export interface DedicatedConfigProduct {
  id: string;
  title: string;
  durationDays: number;
  trafficGB: number;
  priceTomans: number;
  protocol: 'VLESS Reality' | 'Hysteria 2' | 'TUIC v5';
  location: string;
  flag: string;
  features: string[];
  isPopular?: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  recoveryEmail?: string;
  avatar?: string;
  role: 'user' | 'vip' | 'admin';
  walletBalance: number; // in Tomans
  transactions?: WalletTransaction[];
  joinedDate: string;
  subscription: {
    planName: string;
    totalTrafficGB: number;
    usedTrafficGB: number;
    expireDate: string;
    daysRemaining: number;
    subscriptionUrl: string;
    status: 'active' | 'expired' | 'nearing_limit';
    dailyUsage: { date: string; gigabytes: number }[];
    speedLimitMbps: number;
  };
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: 'android' | 'ios' | 'windows' | 'macos' | 'linux';
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
  lastReply: string;
  messages: {
    id: string;
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
  }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  durationMs?: number;
  iconType?: string;
}
