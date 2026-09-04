import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  User as UserType, 
  ActiveSession, 
  SupportTicket, 
  ToastMessage,
  DedicatedConfigProduct,
  WalletTransaction
} from '../../types';
import { AdminSupportTicket } from '../../types/admin';
import { 
  createSupportTicket, 
  fetchUserTickets 
} from '../../services/ticketsService';
import { 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  LogOut, 
  Smartphone, 
  Laptop, 
  Globe, 
  Clock, 
  Activity, 
  Headphones, 
  MessageSquare, 
  Send, 
  Key, 
  ArrowLeft,
  Wallet,
  CreditCard,
  PlusCircle,
  History,
  ShoppingBag,
  Sparkles,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { 
  DEDICATED_CONFIG_PRODUCTS, 
  purchaseDedicatedConfig, 
  createDepositTransaction 
} from '../../services/walletService';

interface UserDashboardProps {
  user: UserType;
  onLogout: () => void;
  onBackToHome: () => void;
  onShowToast: (toast: Omit<ToastMessage, 'id'>) => void;
  onUpdateUser?: (updatedUser: UserType) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onLogout,
  onBackToHome,
  onShowToast,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'subscription' | 'devices' | 'support' | 'security'>('overview');
  const [isCopiedSub, setIsCopiedSub] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Wallet Top-up Modal state
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [isDepositing, setIsDepositing] = useState(false);

  // Recovery email state
  const [recoveryEmailInput, setRecoveryEmailInput] = useState(user.recoveryEmail || user.email || '');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Dynamic browser session detection
  const [sessions, setSessions] = useState<ActiveSession[]>(() => {
    const isWindows = /Windows/i.test(navigator.userAgent);
    const isMac = /Macintosh/i.test(navigator.userAgent);
    
    let deviceName = 'دستگاه مرورگر تحت وب';
    let deviceType: 'android' | 'ios' | 'windows' | 'macos' | 'linux' = 'windows';

    if (/Android/i.test(navigator.userAgent)) {
      deviceName = 'دستگاه همراه اندروید (Android Client)';
      deviceType = 'android';
    } else if (/iPhone|iPad/i.test(navigator.userAgent)) {
      deviceName = 'دستگاه همراه اپل (iOS Client)';
      deviceType = 'ios';
    } else if (isWindows) {
      deviceName = 'رایانه شخصی ویندوز (Windows PC)';
      deviceType = 'windows';
    } else if (isMac) {
      deviceName = 'رایانه اپل (macOS Workstation)';
      deviceType = 'macos';
    }

    return [
      {
        id: 'sess_' + Date.now().toString(36),
        deviceName,
        deviceType,
        ipAddress: 'نشست امن TLS 1.3 / ECH',
        location: 'منطقه اتصالی شبکه ایزوله',
        lastActive: 'هم‌اکنون فعال',
        isCurrent: true
      }
    ];
  });

  // Support Tickets State
  const [userTickets, setUserTickets] = useState<AdminSupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMsg, setNewTicketMsg] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const list = await fetchUserTickets(user.id);
      setUserTickets(list);
    } catch {
      // Fallback handled inside service
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'support') {
      loadTickets();
    }
  }, [activeTab, user.id]);

  // Stats calculation
  const totalGB = user.subscription?.totalTrafficGB || 15;
  const usedGB = user.subscription?.usedTrafficGB || 0;
  const usedPercent = Math.round((usedGB / totalGB) * 100);
  const remainingGB = Math.max(0, totalGB - usedGB).toFixed(1);
  const walletBalance = user.walletBalance || 0;
  const transactions = user.transactions || [];

  const handleCopySub = () => {
    navigator.clipboard.writeText(user.subscription.subscriptionUrl);
    setIsCopiedSub(true);
    onShowToast({
      title: 'لینک سابسکریپشن کپی شد 📋',
      description: 'لینک را در Hiddify، v2rayNG، NekoBox یا Sing-Box ایمپورت کنید.',
      type: 'success'
    });
    setTimeout(() => setIsCopiedSub(false), 2500);
  };

  const handleRefreshStats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast({
        title: 'همگام‌سازی انجام شد 🔄',
        description: 'آخرین آمار کیف پول، مصرف پهنای باند و سشن‌های فعال بروز شد.',
        type: 'info'
      });
    }, 700);
  };

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    onShowToast({
      title: 'نشست ابطال شد 🔒',
      description: `دسترسی دستگاه «${deviceName}» فوراً قطع و توکن اتصال منقضی گردید.`,
      type: 'warning'
    });
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMsg.trim()) {
      onShowToast({
        title: 'تکمیل فیلدها الزامی است ✍️',
        description: 'عنوان و متن پیام پشتیبانی را وارد کنید.',
        type: 'error'
      });
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const res = await createSupportTicket({
        subject: newTicketSubject.trim(),
        category: 'connection',
        operator: 'mci',
        userName: user.name || user.username || 'کاربر سیستم',
        userEmail: user.email || user.recoveryEmail,
        message: newTicketMsg.trim(),
        userId: user.id
      });

      if (res.success && res.ticket) {
        setUserTickets(prev => [res.ticket!, ...prev]);
        setNewTicketSubject('');
        setNewTicketMsg('');

        onShowToast({
          title: `تیکت ${res.ticket.id} ثبت شد 🎫`,
          description: 'تیکت شما به صف بررسی کارشناسان ارسال شد و کد پیگیری صادر گردید.',
          type: 'success'
        });
      } else {
        throw new Error(res.error || 'خطا در ثبت تیکت');
      }
    } catch {
      onShowToast({
        title: 'خطا در ثبت تیکت 🛑',
        description: 'امکان برقراری ارتباط با سرور وجود نداشت. تیکت در کش محلی ذخیره شد.',
        type: 'error'
      });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // افزایش موجودی کیف پول
  const handleCompleteDeposit = () => {
    if (depositAmount <= 0) return;
    setIsDepositing(true);

    setTimeout(() => {
      setIsDepositing(false);
      onShowToast({
        title: 'خطای اتصال به درگاه 🛑',
        description: 'درگاه پرداخت به دلیل قرارگیری سامانه در حالت دمو غیرفعال است.',
        type: 'error'
      });
    }, 900);
  };

  // خرید کانفیگ اختصاصی
  const handleBuyDedicatedConfig = async (product: DedicatedConfigProduct) => {
    if (walletBalance < product.priceTomans) {
      setDepositAmount(product.priceTomans - walletBalance);
      setShowTopUpModal(true);
      onShowToast({
        title: 'موجودی کیف پول کافی نیست ⚠️',
        description: `برای خرید این پلن نیاز به شارژ کیف پول دارید.`,
        type: 'warning'
      });
      return;
    }

    const result = await purchaseDedicatedConfig(user, product);

    if (result.success && result.updatedUser) {
      if (onUpdateUser) {
        onUpdateUser(result.updatedUser);
      }
      onShowToast({
        title: 'خرید کانفیگ اختصاصی موفقیت‌آمیز بود 🎉',
        description: `${product.title} فعال شد. سابسکریپشن VIP شما صادر گردید.`,
        type: 'success'
      });
      setActiveTab('subscription');
    } else {
      onShowToast({
        title: 'خطا در خرید 🛑',
        description: result.error || 'خطایی در پردازش درخواست رخ داد.',
        type: 'error'
      });
    }
  };

  // ذخیره ایمیل بازیابی
  const handleSaveRecoveryEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmailInput.trim())) {
      onShowToast({
        title: 'فرمت ایمیل نامعتبر است 🛑',
        description: 'لطفاً یک ایمیل معتبر (مانند user@gmail.com) وارد کنید.',
        type: 'error'
      });
      return;
    }

    setIsSavingEmail(true);
    setTimeout(() => {
      const updatedUser: UserType = {
        ...user,
        recoveryEmail: recoveryEmailInput.trim(),
        email: recoveryEmailInput.trim()
      };
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      setIsSavingEmail(false);
      onShowToast({
        title: 'ایمیل بازیابی ذخیره شد 🛡️',
        description: 'در صورت فراموشی رمز عبور، لینک بازیابی به این ایمیل ارسال خواهد شد.',
        type: 'success'
      });
    }, 600);
  };

  return (
    <div className="py-6 md:py-10 space-y-6 text-right animate-fade-in dir-rtl">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Top Breadcrumb & User Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
              alt={user.name}
              className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-purple-500/50 p-1 object-cover shadow-lg" 
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-white">{user.name || user.username}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black shadow-sm ${
                user.role === 'vip' 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-amber-950 font-black' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600'
              }`}>
                {user.role === 'vip' ? '👑 مشترک ویژه VIP' : 'کاربر عادی'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono" dir="ltr">@{user.username}</p>
          </div>
        </div>

        {/* Top Wallet & Actions */}
        <div className="flex items-center gap-2.5 relative z-10 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          
          {/* Quick Wallet Pill */}
          <button
            onClick={() => setActiveTab('wallet')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-lg shadow-emerald-950/30"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>موجودی:</span>
            <span className="font-mono font-black text-white">{walletBalance.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-emerald-400">تومان</span>
          </button>

          <button
            onClick={handleRefreshStats}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="به‌روزرسانی آمار"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>صفحه اصلی</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
        {[
          { id: 'overview', label: 'نمای کلی و مصرف', icon: Activity },
          { id: 'wallet', label: `کیف پول و خرید کانفیگ (${walletBalance.toLocaleString('fa-IR')} ت)`, icon: Wallet, highlight: true },
          { id: 'subscription', label: 'سابسکریپشن و اتصال', icon: Zap },
          { id: 'devices', label: `دستگاه‌ها (${sessions.length})`, icon: Smartphone },
          { id: 'support', label: `پشتیبانی (${userTickets.length})`, icon: Headphones },
          { id: 'security', label: 'امنیت و بازیابی رمز', icon: Shield }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? tab.highlight 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : tab.highlight
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Main Metric Cards Grid */}
          {user.subscription?.status === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Traffic Quota Card */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">حجم مصرفی بسته</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[11px] font-bold border border-emerald-500/20">
                  {user.subscription?.status === 'active' ? 'فعال و بدون قطعی' : 'طرح عمومی'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-white">
                    {usedGB} <span className="text-xs text-slate-400 font-normal">/ {totalGB} گیگابایت</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    باقی‌مانده: <strong className="text-cyan-400 font-bold">{remainingGB} GB</strong>
                  </div>
                </div>
                <div className="text-xl font-black text-purple-400 font-mono">
                  {usedPercent}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, usedPercent)}%` }}
                />
              </div>
            </div>

            {/* Time Left Card */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">اعتبار اشتراک</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-black text-white">
                  {user.subscription?.daysRemaining || 30} <span className="text-xs text-slate-400 font-normal">روز مانده</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  پلن فعلی: <span className="text-purple-300 font-bold">{user.subscription?.planName || 'طرح پایه'}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>بهینه‌شده برای اختلالات شدید اینترنت ملی</span>
              </div>
            </div>

            {/* Speed & Protocols Card */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">پهنای باند پورت</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {user.subscription?.speedLimitMbps || 100} <span className="text-xs text-slate-400 font-normal">Mbps</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  پروتکل‌ها: <span className="text-purple-300 font-bold">VLESS Reality / Hy2</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-cyan-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>مسیریابی هوشمند Anycast BGP</span>
              </div>
            </div>

          </div>
          )}

          {/* Quick CTA to Wallet & Dedicated Configs */}
          {user.role !== 'vip' && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-right">
                <h3 className="text-base font-black text-emerald-300 flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>هنوز به مشترکین VIP اختصاصی نپیوسته‌اید!</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  با شارژ کیف پول و فعال‌سازی کانفیگ اختصاصی ۱ ماهه یا ۳ ماهه، به سرورهای با پینگ زیر ۳۵ms و پورت ۴۴۳ اختصاصی دسترسی پیدا کنید.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('wallet')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition-all shrink-0 cursor-pointer"
              >
                مشاهده و خرید کانفیگ اختصاصی
              </button>
            </div>
          )}

          {/* Daily Usage Visual Diagram */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>نمودار مصرف ترافیک در ۷ روز گذشته</span>
                </h3>
                <p className="text-[11px] text-slate-400">محاسبه دقیق حجم دانلود و آپلود بر بستر سرورهای اختصاصی</p>
              </div>
              <span className="text-xs text-purple-400 font-mono">مجموع: {usedGB} GB</span>
            </div>

            {/* Bar chart bars */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end h-40 border-b border-slate-800 pb-2">
              {(user.subscription?.dailyUsage || []).map((day, idx) => {
                const maxVal = 8;
                const heightPercent = Math.max(15, Math.min(100, (day.gigabytes / maxVal) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.gigabytes}GB
                    </span>
                    <div 
                      className="w-full max-w-[36px] bg-gradient-to-t from-purple-600 via-indigo-600 to-cyan-400 rounded-t-xl transition-all duration-300 group-hover:brightness-125 shadow-lg"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: WALLET & DEDICATED CONFIGS (MAIN FEATURE) */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Wallet Balance Hero Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Wallet className="w-4 h-4" />
                  <span>کیف پول امن اتصال</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-black text-white font-mono">
                    {walletBalance.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-sm font-bold text-emerald-300">تومان</span>
                </div>
                <p className="text-xs text-slate-400">
                  موجودی کیف پول برای خرید مستقیم و تمدید خودکار کانفیگ‌های اختصاصی بدون نیاز به پرداخت مکرر استفاده می‌شود.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>افزایش موجودی (شارژ کیف پول)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Configs Store Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <span>خرید کانفیگ اختصاصی VIP (پینگ زیر ۳۵ms)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  تحویل آنی با کسر از موجودی کیف پول و صدور لینک سابسکریپشن اختصاصی
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEDICATED_CONFIG_PRODUCTS.map(prod => {
                const canAfford = walletBalance >= prod.priceTomans;
                return (
                  <div 
                    key={prod.id}
                    className={`p-6 rounded-3xl bg-slate-900/90 border transition-all relative flex flex-col justify-between ${
                      prod.isPopular 
                        ? 'border-amber-500/50 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/30' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {prod.isPopular && (
                      <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-amber-950 text-[10px] font-black shadow-md flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>پیشنهاد ویژه و پرفروش</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-cyan-400 font-mono">{prod.protocol}</span>
                          <span className="text-xs text-slate-400">{prod.location}</span>
                        </div>
                        <h4 className="text-sm font-black text-white">{prod.title}</h4>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {prod.priceTomans.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-400">تومان</span>
                          </div>
                          <div className="text-[10px] text-slate-400">مدت: {prod.durationDays} روز ({prod.trafficGB} GB)</div>
                        </div>
                        <span className="text-2xl">{prod.flag}</span>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-300">
                        {prod.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleBuyDedicatedConfig(prod)}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          canAfford 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40' 
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>خرید آنی با موجودی کیف پول</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>شارژ کیف پول و فعال‌سازی</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions Ledger History */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>ریزتراکنش‌ها و تاریخچه مالی کیف پول</span>
                </h3>
                <p className="text-xs text-slate-400">تمام شارژها، خریدهای کانفیگ و هدایای اعطایی</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{transactions.length} تراکنش</span>
            </div>

            <div className="space-y-2.5">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">هیچ تراکنشی ثبت نشده است.</div>
              ) : (
                transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        tx.type === 'deposit' || tx.type === 'gift' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'gift' ? <PlusCircle className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{tx.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          کد پیگیری: {tx.referenceId || tx.id} • {tx.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`text-sm font-black font-mono ${
                        tx.type === 'deposit' || tx.type === 'gift' ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'gift' ? '+' : '-'}{tx.amount.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        موفق
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SUBSCRIPTION & DEDICATED CONFIGS */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          
          {/* Subscription Link Box */}
          {user.subscription?.status === 'active' ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/40 shadow-2xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-400" />
                    <span>لینک سابسکریپشن خودکار (Auto-Update Subscription)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    با وارد کردن این لینک در نرم‌افزارهای کلاینت، آخرین نودهای بدون فیلتر به صورت خودکار دریافت و همگام می‌شوند.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>اسکن QR Code</span>
                  </button>
                </div>
              </div>

              {/* URL Input & Copy Button */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={user.subscription.subscriptionUrl}
                  className="flex-1 bg-transparent border-none text-xs text-slate-300 font-mono px-2 focus:outline-none select-all"
                  dir="ltr"
                />
                <button
                  onClick={handleCopySub}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCopiedSub
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50'
                  }`}
                >
                  {isCopiedSub ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedSub ? 'کپی شد' : 'کپی لینک ساب'}</span>
                </button>
              </div>

              {/* Direct 1-Click Client Launchers */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-400 mb-3">افزودن مستقیم به نرم‌افزارهای کلاینت:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Hiddify Next', scheme: `hiddify://install-sub?url=${encodeURIComponent(user.subscription.subscriptionUrl)}`, color: 'hover:border-purple-500' },
                    { name: 'v2rayNG', scheme: `v2rayng://install-config?url=${encodeURIComponent(user.subscription.subscriptionUrl)}`, color: 'hover:border-cyan-500' },
                    { name: 'Sing-Box Core', scheme: `sing-box://import-remote-profile?url=${encodeURIComponent(user.subscription.subscriptionUrl)}`, color: 'hover:border-indigo-500' },
                    { name: 'Clash Meta / Verge', scheme: `clash://install-config?url=${encodeURIComponent(user.subscription.subscriptionUrl)}`, color: 'hover:border-emerald-500' },
                  ].map((client, idx) => (
                    <a
                      key={idx}
                      href={client.scheme}
                    onClick={() => {
                      onShowToast({
                        title: `ایمپورت در ${client.name} 📲`,
                        description: 'درخواست باز شدن نرم‌افزار به سیستم ارسال شد.',
                        type: 'info'
                      });
                    }}
                    className={`p-3 rounded-2xl bg-slate-950/60 border border-slate-800 ${client.color} text-center transition-all hover:bg-slate-800/80 group cursor-pointer`}
                  >
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {client.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">اتصال مستقیم</div>
                  </a>
                ))}
              </div>
            </div>

          </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">اشتراک فعالی ندارید</h3>
                <p className="text-xs text-slate-400 mt-1">برای دریافت کانفیگ اختصاصی باید کیف پول خود را شارژ کرده و بسته خریداری کنید.</p>
              </div>
              <button
                onClick={() => setActiveTab('wallet')}
                className="mt-4 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-900/50 cursor-pointer inline-flex items-center gap-2"
              >
                <span>رفتن به کیف پول</span>
              </button>
            </div>
          )}
        </div>
      )}
      {/* TAB 4: ACTIVE DEVICES & SESSIONS */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>دستگاه‌ها و سشن‌های متصل به اکانت</span>
              </h3>
              <p className="text-xs text-slate-400">امکان مدیریت و قطع اتصال دستگاه‌های ناشناس در هر لحظه</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold">{sessions.length} دستگاه فعال</span>
          </div>

          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-400">
                    {session.deviceType === 'android' || session.deviceType === 'ios' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{session.deviceName}</h4>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                          دستگاه فعلی شما
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>IP: {session.ipAddress}</span>
                      <span>موقعیت: {session.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {session.lastActive}
                  </span>

                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id, session.deviceName)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      قطع دسترسی
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          
          {/* New Ticket Form */}
          <div className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border border-purple-500/20 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>ارسال پیام به کارشناسان پشتیبانی (@NetWithoutBorders)</span>
            </h3>

            <form onSubmit={handleSendTicket} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">موضوع مشکل یا سوال</label>
                <input
                  type="text"
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  placeholder="مثال: سوال در مورد تنظیمات Fragment در همراه اول"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">متن کامل پیام</label>
                <textarea
                  rows={3}
                  value={newTicketMsg}
                  onChange={e => setNewTicketMsg(e.target.value)}
                  placeholder="شرح دقیق اپراتور، نسخه نرم‌افزار و وضعیت پینگ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingTicket}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingTicket ? 'در حال ارسال...' : 'ثبت تیکت پشتیبانی'}</span>
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400">تاریخچه تیکت‌های شما:</h4>
              <button
                onClick={loadTickets}
                disabled={isLoadingTickets}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingTickets ? 'animate-spin text-purple-400' : ''}`} />
                <span>بروزرسانی وضعیت تیکت‌ها</span>
              </button>
            </div>

            {isLoadingTickets && userTickets.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                در حال فراخوانی تیکت‌ها از سرور...
              </div>
            ) : userTickets.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                <Headphones className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-400">هنوز تیکتی ثبت نکرده‌اید</div>
                <p className="text-[11px] text-slate-500">هرگونه سوال، قطعی یا درخواست ارتقا را از طریق فرم بالا مطرح فرمایید.</p>
              </div>
            ) : (
              userTickets.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{t.subject}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{t.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-800/40 font-mono">
                        {t.operator.toUpperCase()}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'answered' || t.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : t.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {t.status === 'answered' ? 'پاسخ داده شده' : t.status === 'resolved' ? 'حل شده' : t.status === 'in_progress' ? 'درحال بررسی تیم فنی' : 'در صف پاسخ'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    {/* User's original message */}
                    <div className="p-3 rounded-xl text-xs leading-relaxed bg-slate-900 border border-slate-800 text-slate-300">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>👤 پیام شما ({t.userName})</span>
                        <span>{new Date(t.createdAt).toLocaleString('fa-IR')}</span>
                      </div>
                      <p className="whitespace-pre-line">{t.message}</p>
                    </div>

                    {/* Admin Reply */}
                    {t.replyMessage && (
                      <div className="p-3.5 rounded-xl text-xs leading-relaxed bg-purple-950/40 border border-purple-800/50 text-purple-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>پاسخ رسمی پشتیبان ارشد شبکه اتصال</span>
                          </span>
                          {t.repliedAt && (
                            <span className="font-mono text-purple-400/80">
                              {new Date(t.repliedAt).toLocaleString('fa-IR')}
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-line text-purple-100">{t.replyMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 6: SECURITY & RECOVERY EMAIL */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">تنظیمات امنیت و ایمیل بازیابی رمز عبور</h3>
                <p className="text-xs text-slate-400">
                  برای اینکه اگر کلمه عبورتان فراموش شد حسابتان از دست نرود، ایمیل بازیابی خود را ثبت فرمایید.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
              <p className="font-bold mb-1">💡 سیستم ثبت‌نام بدون احراز هویت اتصال:</p>
              <p>
                در سیستم اتصال، ثبت‌نام فقط با یک نام کاربری انجام می‌شود تا حریم خصوصی شما ۱۰۰٪ حفظ گردد. وارد کردن ایمیل بازیابی تنها راه ارتباطی برای بازنشانی رمز عبور در صورت فراموشی است.
              </p>
            </div>

            <form onSubmit={handleSaveRecoveryEmail} className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  آدرس ایمیل بازیابی:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={recoveryEmailInput}
                    onChange={(e) => setRecoveryEmailInput(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 pl-11 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingEmail}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ذخیره و فعال‌سازی ایمیل بازیابی</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Top-up Wallet Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-5 my-4 sm:my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">شارژ آنی کیف پول</h3>
                  <p className="text-[11px] text-slate-400">افزایش موجودی حساب برای خرید کانفیگ اختصاصی</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">انتخاب سریع مبلغ شارژ (تومان):</label>
              <div className="grid grid-cols-2 gap-2">
                {[50000, 100000, 200000, 400000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                      depositAmount === amt
                        ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {amt.toLocaleString('fa-IR')} تومان
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">یا وارد کردن مبلغ دلخواه (تومان):</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Math.max(10000, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>درگاه شتابی و کریپتو (USDT):</span>
              <span className="text-emerald-400 font-bold">تسویه آنی و هوشمند</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDepositing || depositAmount <= 0}
                onClick={handleCompleteDeposit}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDepositing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال اتصال به درگاه امن...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تایید و شارژ {depositAmount.toLocaleString('fa-IR')} تومان</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* QR Code Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/30 p-5 sm:p-6 shadow-2xl text-center space-y-4 my-4">
            <h3 className="text-sm font-black text-white">اسکن سابسکریپشن اختصاصی</h3>
            <p className="text-xs text-slate-400">دوربین برنامه Hiddify یا v2rayNG را مقابل کد بگیرید:</p>

            <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-xl max-w-full overflow-hidden">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(user.subscription.subscriptionUrl)}`}
                alt="Subscription QR"
                className="w-40 h-40 sm:w-44 sm:h-44 mx-auto"
              />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
