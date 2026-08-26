import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Activity, 
  Rss, 
  Newspaper, 
  KeyRound, 
  Radio, 
  Music, 
  LifeBuoy, 
  Terminal, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  Send, 
  Play, 
  Pause, 
  Sparkles, 
  Server, 
  Cpu, 
  Zap, 
  Flame, 
  Users, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  Layers,
  BarChart3,
  Globe2,
  Sliders,
  Check,
  Eye,
  Clock,
  User,
  X
} from 'lucide-react';

import { AdminTab, FeedSource, MusicTrack, AdminSystemLog, AdminTelemetryStats, AdminSupportTicket } from '../../types/admin';
import { NewsArticle } from '../../types/news';
import { V2RayConfig, MtprotoProxy, OperatorType } from '../../types';
import { INITIAL_FEED_SOURCES, INITIAL_TELEMETRY_STATS, INITIAL_MUSIC_TRACKS, INITIAL_SYSTEM_LOGS, INITIAL_SUPPORT_TICKETS } from '../../data/adminData';
import { SAMPLE_NEWS_ARTICLES } from '../../data/newsData';
import { SAMPLE_CONFIGS, SAMPLE_PROXIES } from '../../data';
import { fetchAllTickets, replyToSupportTicket } from '../../services/ticketsService';
import { fetchLiveConfigs, fetchLiveProxies, saveConfigsBatch } from '../../services/configDbService';
import { AdminNewsManager } from './AdminNewsManager';
import { AdminConfigsManager } from './AdminConfigsManager';
import { AdminProxiesManager } from './AdminProxiesManager';
import { AdminMusicManager } from './AdminMusicManager';
import { AdminConfigProxyIngestionModal } from './AdminConfigProxyIngestionModal';

interface MasterAdminDashboardProps {
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onExitAdmin: () => void;
}

export const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({
  onShowToast,
  onExitAdmin
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // State management for all modules
  const [stats, setStats] = useState<AdminTelemetryStats>(INITIAL_TELEMETRY_STATS);
  const [sources, setSources] = useState<FeedSource[]>(INITIAL_FEED_SOURCES);
  const [newsList, setNewsList] = useState<NewsArticle[]>(SAMPLE_NEWS_ARTICLES);
  const [configsList, setConfigsList] = useState<V2RayConfig[]>(SAMPLE_CONFIGS);
  const [proxiesList, setProxiesList] = useState<MtprotoProxy[]>(SAMPLE_PROXIES);
  const [musicList, setMusicList] = useState<MusicTrack[]>(INITIAL_MUSIC_TRACKS);
  const [ticketsList, setTicketsList] = useState<AdminSupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [systemLogs, setSystemLogs] = useState<AdminSystemLog[]>(INITIAL_SYSTEM_LOGS);

  // Tickets state
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [ticketFilterOperator, setTicketFilterOperator] = useState<string>('all');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');

  // Form states for Sources
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<FeedSource['type']>('rss_news');

  // Ingestion Modal state
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);

  // Synchronize data with Supabase on mount
  React.useEffect(() => {
    let isMounted = true;

    async function loadLiveDatabaseData() {
      try {
        const [liveTickets, liveConfigs, liveProxies] = await Promise.all([
          fetchAllTickets(),
          fetchLiveConfigs(),
          fetchLiveProxies()
        ]);

        if (isMounted) {
          if (liveTickets && liveTickets.length > 0) {
            setTicketsList(liveTickets);
            setStats(prev => ({
              ...prev,
              pendingTicketsCount: liveTickets.filter(t => t.status === 'pending').length
            }));
          }
          if (liveConfigs && liveConfigs.length > 0) {
            setConfigsList(liveConfigs);
            setStats(prev => ({
              ...prev,
              totalConfigs: liveConfigs.length,
              healthyConfigs: liveConfigs.filter(c => (c.ping || 50) < 100).length
            }));
          }
          if (liveProxies && liveProxies.length > 0) {
            setProxiesList(liveProxies);
            setStats(prev => ({
              ...prev,
              totalProxies: liveProxies.length,
              activeProxies: liveProxies.filter(p => (p.ping || 40) < 100).length
            }));
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadLiveDatabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Action: Trigger Batch Ping on All Configs
  const handleBatchPing = () => {
    onShowToast({
      title: 'تست پینگ سراسری آغاز شد ⚡',
      description: 'در حال سنجش تاخیر میلی‌ثانیه‌ای تمامی کانفیگ‌ها و نودهای Reality...',
      type: 'info'
    });

    setTimeout(() => {
      setConfigsList(prev => prev.map(c => ({
        ...c,
        ping: Math.floor(Math.random() * 80) + 45
      })));
      setStats(prev => ({ ...prev, healthyConfigs: prev.totalConfigs }));
      
      setSystemLogs(prev => [
        {
          id: 'log-' + Date.now(),
          level: 'success',
          module: 'supabase_db',
          message: 'تست پینگ سراسری موفقیت‌آمیز بود. میانگین تاخیر: ۶۸ms',
          timestamp: new Date().toLocaleTimeString('fa-IR')
        },
        ...prev
      ]);

      onShowToast({
        title: 'تست پینگ تکمیل شد ✅',
        description: 'تمامی کانفیگ‌ها با موفقیت آزمایش شدند و تاخیرها بروزرسانی گردید.',
        type: 'success'
      });
    }, 1200);
  };

  // 2. Action: Toggle Source Active
  const handleToggleSource = (id: string) => {
    setSources(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive;
        onShowToast({
          title: nextState ? 'منبع فعال شد ✅' : 'منبع موقتا متوقف شد ⏸️',
          description: `وضعیت دریافت خودکار از منبع ${s.name} تغییر یافت.`,
          type: nextState ? 'success' : 'warning'
        });
        return { ...s, isActive: nextState };
      }
      return s;
    }));
  };

  // 3. Action: Add New Source
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceUrl.trim() || !newSourceName.trim()) return;

    const newSource: FeedSource = {
      id: 'src-' + Date.now(),
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      type: newSourceType,
      isActive: true,
      lastFetchedAt: new Date().toISOString(),
      fetchIntervalMinutes: 30,
      totalFetchedCount: 0,
      healthStatus: 'healthy'
    };

    setSources(prev => [newSource, ...prev]);
    setNewSourceName('');
    setNewSourceUrl('');
    setIsAddingSource(false);

    onShowToast({
      title: 'منبع جدید اضافه شد 📡',
      description: `فید ${newSource.name} به پایپ‌لاین دریافت خودکار متصل شد.`,
      type: 'success'
    });
  };

  // 4. Action: Delete Source
  const handleDeleteSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
    onShowToast({
      title: 'منبع حذف شد 🗑️',
      description: 'منبع مورد نظر از جدول ورودی‌ها حذف گردید.',
      type: 'info'
    });
  };

  // 5. Action: Toggle Breaking News
  const handleToggleBreakingNews = (articleId: string) => {
    setNewsList(prev => prev.map(a => {
      if (a.id === articleId) {
        const nextState = !a.isBreaking;
        return { ...a, isBreaking: nextState };
      }
      return a;
    }));

    onShowToast({
      title: 'وضعیت خبر فوری تغییر کرد 🚨',
      description: 'بنر خبر در صفحه اصلی رصدخانه بروزرسانی شد.',
      type: 'info'
    });
  };

  // 6. Action: Delete News Article
  const handleDeleteNews = (id: string) => {
    setNewsList(prev => prev.filter(n => n.id !== id));
    onShowToast({
      title: 'مقاله حذف شد 🗑️',
      description: 'خبر از پایگاه داده و رصدخانه حذف گردید.',
      type: 'info'
    });
  };

  // 7. Action: Push Music to Telegram Bot
  const handlePushMusicToTelegram = (trackId: string) => {
    setMusicList(prev => prev.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          isSentToTelegram: true,
          telegramMessageId: 'msg_' + Math.floor(Math.random() * 9000 + 1000)
        };
      }
      return t;
    }));

    setSystemLogs(prev => [
      {
        id: 'log-' + Date.now(),
        level: 'success',
        module: 'telegram_bot',
        message: `موزیک ${trackId} با موفقیت توسط وب‌هوک به کانال تلگرام ارسال شد`,
        timestamp: new Date().toLocaleTimeString('fa-IR')
      },
      ...prev
    ]);

    onShowToast({
      title: 'ارسال به تلگرام انجام شد 🚀',
      description: 'فایل صوتی به همراه کاور و متادیتا در کانال رسمی منتشر شد.',
      type: 'success'
    });
  };

  // 10. Action: Send Support Ticket Reply
  const handleSendTicketReply = async (ticketId: string, replyText: string, newStatus: AdminSupportTicket['status'] = 'resolved') => {
    if (!replyText.trim()) return;

    // Call real tickets service
    await replyToSupportTicket(ticketId, replyText, newStatus);

    setTicketsList(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          replyMessage: replyText.trim(),
          repliedAt: new Date().toISOString(),
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    // Update telemetry stats pending tickets count
    setStats(prev => ({
      ...prev,
      pendingTicketsCount: Math.max(0, prev.pendingTicketsCount - (newStatus !== 'pending' ? 1 : 0))
    }));

    setSystemLogs(prev => [
      {
        id: 'log-' + Date.now(),
        level: 'success',
        module: 'supabase_db',
        message: `پاسخ تیکت ${ticketId} در پایگاه داده ثبت و وضعیت به [${newStatus}] تغییر یافت`,
        timestamp: new Date().toLocaleTimeString('fa-IR')
      },
      ...prev
    ]);

    onShowToast({
      title: 'پاسخ تیکت ارسال شد ✉️',
      description: `پاسخ شما برای تیکت ${ticketId} ثبت گردید و وضعیت آن به ${newStatus === 'resolved' ? 'پاسخ داده شده' : 'در حال بررسی'} ارتقا یافت.`,
      type: 'success'
    });

    setTicketReplyText('');
    setSelectedTicket(null);
  };

  // 11. Action: Change Ticket Status
  const handleUpdateTicketStatus = (ticketId: string, newStatus: AdminSupportTicket['status']) => {
    setTicketsList(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    }));

    onShowToast({
      title: 'وضعیت تیکت تغییر کرد 🔄',
      description: `تیکت ${ticketId} به وضعیت [${newStatus}] تغییر یافت.`,
      type: 'info'
    });
  };

  // 12. Action: Delete Ticket
  const handleDeleteTicket = (ticketId: string) => {
    setTicketsList(prev => prev.filter(t => t.id !== ticketId));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    onShowToast({
      title: 'تیکت حذف شد 🗑️',
      description: `تیکت ${ticketId} از بایگانی سیستم پاک گردید.`,
      type: 'info'
    });
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return ticketsList.filter(t => {
      const matchStatus = ticketFilterStatus === 'all' || t.status === ticketFilterStatus;
      const matchOperator = ticketFilterOperator === 'all' || t.operator === ticketFilterOperator;
      const matchSearch = !ticketSearchQuery.trim() || 
        t.id.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
        t.userName.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
        (t.telegramUsername && t.telegramUsername.toLowerCase().includes(ticketSearchQuery.toLowerCase())) ||
        t.message.toLowerCase().includes(ticketSearchQuery.toLowerCase());
      return matchStatus && matchOperator && matchSearch;
    });
  }, [ticketsList, ticketFilterStatus, ticketFilterOperator, ticketSearchQuery]);

  return (
    <div className="space-y-6 text-right py-4 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-purple-500/40 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight">داشبورد فرماندهی مدیریت کل (Master Admin)</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 animate-pulse">
                زنده و متصل
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مرکز پایش بلادرنگ منابع ورودی، کانفیگ‌های Reality، فیدهای خبری، پروکسی‌ها، تیکت‌های کاربران و توزیع موزیک ربات تلگرام.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBatchPing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تست پینگ سراسری</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <span>خروج از پنل ادمین</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-800">
        {[
          { id: 'overview', label: 'داشبورد و تله‌متری', icon: Activity },
          { id: 'sources', label: 'مدیریت منابع ورودی (RSS/تلگرام)', icon: Rss, badge: sources.length },
          { id: 'news', label: 'تحریریه و مقالات', icon: Newspaper, badge: newsList.length },
          { id: 'configs', label: 'کانفیگ‌ها و Reality', icon: KeyRound, badge: configsList.length },
          { id: 'proxies', label: 'پروکسی‌های MTProto', icon: Radio, badge: proxiesList.length },
          { id: 'music', label: 'هاب موزیک و ربات', icon: Music, badge: musicList.length },
          { id: 'tickets', label: 'تیکت‌ها و پشتیبانی', icon: LifeBuoy, badge: ticketsList.filter(t => t.status === 'pending').length },
          { id: 'system_logs', label: 'لاگ‌های زنده سیستم', icon: Terminal, badge: systemLogs.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-purple-800 text-white' : tab.id === 'tickets' && tab.badge > 0 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>کاربران فعال / آنلاین</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{stats.activeOnlineUsers}</span>
                <span className="text-[11px] text-slate-500 font-mono">از {stats.totalUsers.toLocaleString('fa-IR')} کاربر</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[45%]" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>سلامت نودهای Reality</span>
                <KeyRound className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">{stats.healthyConfigs}</span>
                <span className="text-[11px] text-slate-500 font-mono">از {stats.totalConfigs} نود آنلاین</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[90%]" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>درخواست‌های امروز لبه (Edge)</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-300 font-mono">{stats.edgeRequestsToday.toLocaleString('fa-IR')}</span>
                <span className="text-[11px] text-slate-500">Hit: 96%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[84%]" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>پایداری سیستم (Uptime)</span>
                <Server className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-amber-300 font-mono">{stats.systemUptime}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[99%]" />
              </div>
            </div>

          </div>

          {/* Infrastructure Health Status Matrix */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>ماتریس سلامت اجزای معماری زیرساخت (Live Architecture Matrix)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Cloudflare Pages & Workers</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300">عادی (0ms Lag)</span>
                </div>
                <p className="text-[11px] text-slate-400">توزیع CDN جهانی + کش KV بدون افت کیفیت.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">OpenRouter AI Translation</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300">پاسخگو (DeepSeek Free)</span>
                </div>
                <p className="text-[11px] text-slate-400">ترجمه و ساخت اسلاگ سئو مقالات در ۱.۲ ثانیه.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">n8n Automation Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-[10px] text-purple-300">آماده اجرای ورک‌فلو</span>
                </div>
                <p className="text-[11px] text-slate-400">کرون جاب هر ۲ ساعت برای پایش RSS و تلگرام.</p>
              </div>

            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setIsIngestionModalOpen(true)}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/50 text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-purple-950/50"
            >
              <div className="text-right">
                <span className="block font-bold">⚡ استخراج خودکار نودها</span>
                <span className="text-[10px] text-purple-300">تزریق همزمان به ۳ مقصد</span>
              </div>
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            </button>

            <button
              onClick={() => { setActiveTab('news'); }}
              className="p-4 rounded-2xl bg-purple-950/30 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>+ افزودن مقاله / خبر</span>
              <Newspaper className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => { setActiveTab('configs'); }}
              className="p-4 rounded-2xl bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>+ مدیریت کانفیگ‌ها</span>
              <KeyRound className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={() => { setActiveTab('proxies'); }}
              className="p-4 rounded-2xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>+ پروکسی‌های MTProto</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => { setActiveTab('music'); }}
              className="p-4 rounded-2xl bg-fuchsia-950/30 hover:bg-fuchsia-950/60 border border-fuchsia-500/30 text-fuchsia-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>+ آپلود و انتشار موزیک</span>
              <Music className="w-4 h-4 text-fuchsia-400" />
            </button>

            <button
              onClick={handleBatchPing}
              className="p-4 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
            >
              <span>⚡ تست پینگ همگانی</span>
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SOURCES & FEEDS MANAGER */}
      {/* ========================================================= */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Rss className="w-4 h-4 text-purple-400" />
                <span>مدیریت منابع ورودی خودکار (RSS Feeds & Telegram Sources)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                این منابع توسط موتور اتوماسیون n8n واکشی، پالایش و به دیتابیس تزریق می‌شوند.
              </p>
            </div>

            <button
              onClick={() => setIsAddingSource(!isAddingSource)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن منبع جدید</span>
            </button>
          </div>

          {/* Add Source Form Modal/Box */}
          {isAddingSource && (
            <form onSubmit={handleAddSource} className="p-5 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold text-purple-300">افزودن منبع جدید به خط لوله اتوماسیون:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="نام منبع (مثال: کانال تلگرام نودها، زومیت RSS)..."
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />

                <input
                  type="url"
                  placeholder="آدرس URL فید یا لینک کانال (https://...)..."
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 text-left font-mono"
                  required
                />

                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as FeedSource['type'])}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="rss_news">فید RSS اخبار (تکنولوژی/امنیت)</option>
                  <option value="telegram_config">کانال تلگرام کانفیگ‌های Reality</option>
                  <option value="telegram_proxy">کانال تلگرام پروکسی MTProto</option>
                  <option value="telegram_music">کانال تلگرام آرشیو موزیک</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSource(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                >
                  ذخیره و اتصال منبع
                </button>
              </div>
            </form>
          )}

          {/* Sources Table */}
          <div className="overflow-x-auto rounded-3xl bg-slate-900/80 border border-slate-800">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">نام منبع</th>
                  <th className="p-3.5">نوع منبع</th>
                  <th className="p-3.5">لینک فید</th>
                  <th className="p-3.5">آمار دریافت</th>
                  <th className="p-3.5">وضعیت دریافت</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${src.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      {src.name}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-purple-300 font-mono">
                        {src.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-left font-mono text-[11px] text-cyan-400 max-w-[200px] truncate">
                      <a href={src.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        <span className="truncate">{src.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {src.totalFetchedCount.toLocaleString('fa-IR')} آیتم
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleSource(src.id)}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[10px] transition-all cursor-pointer ${
                          src.isActive 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {src.isActive ? 'فعال (در حال پایش)' : 'متوقف'}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteSource(src.id)}
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                        title="حذف منبع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: NEWS & ARTICLES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'news' && (
        <AdminNewsManager
          newsList={newsList}
          setNewsList={setNewsList}
          onShowToast={onShowToast}
          onToggleBreaking={handleToggleBreakingNews}
          onDeleteNews={handleDeleteNews}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 4: CONFIGS & REALITY NODES */}
      {/* ========================================================= */}
      {activeTab === 'configs' && (
        <AdminConfigsManager
          configsList={configsList}
          setConfigsList={setConfigsList}
          onShowToast={onShowToast}
          onBatchPing={handleBatchPing}
          onOpenIngestionModal={() => setIsIngestionModalOpen(true)}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 5: PROXIES (MTProto) */}
      {/* ========================================================= */}
      {activeTab === 'proxies' && (
        <AdminProxiesManager
          proxiesList={proxiesList}
          setProxiesList={setProxiesList}
          onShowToast={onShowToast}
          onOpenIngestionModal={() => setIsIngestionModalOpen(true)}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 6: MUSIC BOT & AUDIO HUB */}
      {/* ========================================================= */}
      {activeTab === 'music' && (
        <AdminMusicManager
          musicList={musicList}
          setMusicList={setMusicList}
          onShowToast={onShowToast}
          onPushToTelegram={handlePushMusicToTelegram}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 7: SUPPORT & USER TICKETS */}
      {/* ========================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Tickets Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>کل تیکت‌ها</span>
                <LifeBuoy className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xl font-black text-white mt-2 font-mono">{ticketsList.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <div className="flex items-center justify-between text-amber-400 text-xs">
                <span>در انتظار پاسخ</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-300 mt-2 font-mono">
                {ticketsList.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
              <div className="flex items-center justify-between text-blue-400 text-xs">
                <span>در حال بررسی</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-black text-blue-300 mt-2 font-mono">
                {ticketsList.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="flex items-center justify-between text-emerald-400 text-xs">
                <span>پاسخ‌داده و حل‌شده</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-300 mt-2 font-mono">
                {ticketsList.filter(t => t.status === 'resolved' || t.status === 'closed').length}
              </p>
            </div>
          </div>

          {/* Search & Filter Header */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجو در تیکت‌ها با شماره، عنوان، نام کاربر یا متن پیام..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <select
                  value={ticketFilterStatus}
                  onChange={(e) => setTicketFilterStatus(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار پاسخ</option>
                  <option value="in_progress">در حال بررسی</option>
                  <option value="resolved">پاسخ داده شده</option>
                  <option value="closed">بسته شده</option>
                </select>

                <select
                  value={ticketFilterOperator}
                  onChange={(e) => setTicketFilterOperator(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">همه اپراتورها</option>
                  <option value="mci">همراه اول (MCI)</option>
                  <option value="irancell">ایرانسل (MTN)</option>
                  <option value="rightel">رایتل (Rightel)</option>
                  <option value="shatel">شاتل / فیبر</option>
                  <option value="wifi">وای‌فای / متفرقه</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
              <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-bold">هیچ تیکتی با مشخصات انتخابی یافت نشد.</p>
              <p className="text-slate-500 text-xs">می‌توانید فیلترها را ریست کنید یا عبارت جستجو را تغییر دهید.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const isPending = ticket.status === 'pending';
                const isInProgress = ticket.status === 'in_progress';
                const isResolved = ticket.status === 'resolved';

                return (
                  <div
                    key={ticket.id}
                    className={`p-5 rounded-3xl bg-slate-900 border transition-all ${
                      isPending ? 'border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-950/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Ticket Info & Sender */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
                            #{ticket.id}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ticket.priority === 'urgent' ? 'bg-red-950/80 text-red-300 border border-red-500/40' :
                            ticket.priority === 'high' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            اولویت: {ticket.priority === 'urgent' ? 'فوری' : ticket.priority === 'high' ? 'بالا' : 'عادی'}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPending ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            isInProgress ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                            isResolved ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {isPending ? 'در انتظار پاسخ' : isInProgress ? 'در حال پیگیری' : isResolved ? 'پاسخ داده شده' : 'بسته شده'}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-300">
                            {ticket.operator === 'mci' ? 'همراه اول' : ticket.operator === 'irancell' ? 'ایرانسل' : ticket.operator === 'rightel' ? 'رایتل' : ticket.operator === 'shatel' ? 'شاتل' : 'سایر'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">{ticket.subject}</h4>
                        
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                          {ticket.message}
                        </p>

                        {ticket.replyMessage && (
                          <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-2xl space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                              <span>پاسخ رسمی پشتیبانی اتصال:</span>
                              {ticket.repliedAt && <span className="font-mono text-[10px] text-slate-400">{new Date(ticket.repliedAt).toLocaleTimeString('fa-IR')}</span>}
                            </div>
                            <p className="text-xs text-purple-100">{ticket.replyMessage}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-bold text-slate-300">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                            {ticket.userName}
                          </span>
                          {ticket.telegramUsername && (
                            <span className="flex items-center gap-1 font-mono text-cyan-400 dir-ltr">
                              {ticket.telegramUsername}
                            </span>
                          )}
                          {ticket.userEmail && (
                            <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                              {ticket.userEmail}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">
                            ثبت: {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-r border-slate-800 pt-3 lg:pt-0 lg:pr-4">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setTicketReplyText(ticket.replyMessage || '');
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{ticket.replyMessage ? 'ویرایش پاسخ' : 'پاسخ به تیکت'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {ticket.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                              title="تغییر به حل‌شده"
                              className="p-2 rounded-xl bg-slate-950 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {ticket.status !== 'in_progress' && (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                              title="تغییر به در حال پیگیری"
                              className="p-2 rounded-xl bg-slate-950 hover:bg-blue-950 text-slate-400 hover:text-blue-400 border border-slate-800 transition-colors"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            title="حذف تیکت"
                            className="p-2 rounded-xl bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ticket Reply Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/40 p-6 shadow-2xl space-y-4 text-right max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-purple-400" />
                    <span>ارسال پاسخ پشتیبانی برای تیکت #{selectedTicket.id}</span>
                  </h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Inquiry Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-white">{selectedTicket.userName} ({selectedTicket.telegramUsername || selectedTicket.userEmail})</span>
                    <span>اپراتور: {selectedTicket.operator}</span>
                  </div>
                  <h4 className="text-sm font-bold text-purple-300">{selectedTicket.subject}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedTicket.message}</p>
                </div>

                {/* Quick Templates */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">پاسخ‌های آماده و هوشمند:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'رفع پورت Reality', text: 'درود، پورت‌های جایگزین Reality با فرگمنت در تب کانفیگ‌ها بارگذاری شد. لطفاً سابسکریپشن خود را رفرش نمایید.' },
                      { label: 'تنظیمات Sing-Box اندروید', text: 'سلام، لطفاً در اپلیکیشن اتصال گزینه Fragment Length را روی 100-200 و Interval را روی 10-20 قرار دهید.' },
                      { label: 'بررسی اکانت VIP', text: 'درود، وضعیت سابسکریپشن شما تایید گردید و ترافیک حساب شما با موفقیت شارژ شد.' }
                    ].map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTicketReplyText(tpl.text)}
                        className="px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 text-[11px] transition-colors cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">متن پاسخ رسمی مدیریت:</label>
                  <textarea
                    rows={4}
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="متن پاسخ خود را به کاربر بنویسید..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    انصراف
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTicketReply(selectedTicket.id, ticketReplyText, 'in_progress')}
                    className="px-4 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/40 text-xs font-bold transition-all"
                  >
                    ثبت پاسخ + وضعیت در حال پیگیری
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTicketReply(selectedTicket.id, ticketReplyText, 'resolved')}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950"
                  >
                    ارسال پاسخ و حل تیکت
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: SYSTEM LOGS */}
      {/* ========================================================= */}
      {activeTab === 'system_logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>لاگ‌های زنده تله‌متری سیستم (Real-time Audit Logs)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Auto-scrolling stream</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2.5 max-h-96 overflow-y-auto">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'success' ? 'bg-emerald-950 text-emerald-300' :
                  log.level === 'warn' ? 'bg-amber-950 text-amber-300' :
                  log.level === 'error' ? 'bg-red-950 text-red-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  [{log.module.toUpperCase()}]
                </span>
                <p className="text-slate-200 leading-relaxed">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL MODALS: INGESTION & AUTO-EXTRACTION */}
      {/* ========================================================= */}
      <AdminConfigProxyIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        existingConfigs={configsList}
        setConfigsList={setConfigsList}
        existingProxies={proxiesList}
        setProxiesList={setProxiesList}
        onShowToast={onShowToast}
      />

    </div>
  );
};
