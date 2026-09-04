export type AdminTab = 
  | 'overview' 
  | 'sources' 
  | 'news' 
  | 'articles'
  | 'configs' 
  | 'proxies' 
  | 'music' 
  | 'tickets' 
  | 'system_logs';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: 'rss_news' | 'telegram_config' | 'telegram_proxy' | 'telegram_music';
  targetCategory?: string;
  isActive: boolean;
  lastFetchedAt: string;
  fetchIntervalMinutes: number;
  totalFetchedCount: number;
  healthStatus: 'healthy' | 'warning' | 'error';
}

export interface AdminTelemetryStats {
  totalUsers: number;
  activeOnlineUsers: number;
  totalConfigs: number;
  healthyConfigs: number;
  totalProxies: number;
  activeProxies: number;
  totalNews: number;
  breakingNewsCount: number;
  totalMusicTracks: number;
  pendingTicketsCount: number;
  systemUptime: string;
  serverLoadPercent: number;
  memoryUsageMb: number;
  edgeRequestsToday: number;
}

export interface AdminSystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: 'n8n_ingest' | 'openrouter_ai' | 'supabase_db' | 'edge_cdn' | 'admin_auth' | 'telegram_bot';
  message: string;
  timestamp: string;
  details?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  audioUrl: string;
  coverUrl: string;
  fileSizeMb: number;
  downloadsCount: number;
  isSentToTelegram: boolean;
  telegramMessageId?: string;
  createdAt: string;
}

export interface AdminSupportTicket {
  id: string;
  subject: string;
  category: 'connection' | 'config' | 'app' | 'billing' | 'other';
  operator: 'mci' | 'irancell' | 'rightel' | 'shatel' | 'mokhaberat' | 'wifi' | 'other';
  userName: string;
  userEmail?: string;
  telegramUsername?: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'answered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}
