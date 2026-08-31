import React, { useState, useEffect } from 'react';
import { 
  Power, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  Server, 
  Settings, 
  Terminal, 
  CheckCircle2, 
  Lock,
  Wallet,
  CreditCard,
  PlusCircle,
  Sparkles,
  Flame,
  Clock,
  RefreshCw
} from 'lucide-react';
import { V2RayConfig } from '../../types';
import { DEDICATED_CONFIG_PRODUCTS } from '../../services/walletService';

interface AndroidAppInterfaceProps {
  configs: V2RayConfig[];
  onOpenApkModal?: () => void;
}

export const AndroidAppInterface: React.FC<AndroidAppInterfaceProps> = ({ 
  configs, 
  onOpenApkModal 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>(configs[0]?.id || 'cfg-1');
  const [activeTab, setActiveTab] = useState<'home' | 'wallet' | 'servers' | 'split'>('home');
  const [pingSpeed, setPingSpeed] = useState(42);
  const [duration, setDuration] = useState(0);

  // App-local wallet state for seamless mobile experience (no complex auth needed)
  const [appWalletBalance, setAppWalletBalance] = useState(150000);
  const [activePlan, setActivePlan] = useState<{ title: string; daysLeft: number; trafficGB: number; isVip: boolean }>({
    title: 'اشتراک VIP اختصاصی (فعال)',
    daysLeft: 27,
    trafficGB: 45,
    isVip: true
  });
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);

  const selectedConfig = configs.find(c => c.id === selectedConfigId) || configs[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  const handleToggleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setPingSpeed(Math.floor(Math.random() * 15) + 36);
      }, 1100);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleBuyInApp = (price: number, planTitle: string, days: number, traffic: number) => {
    if (appWalletBalance < price) {
      // Auto top-up simulation for frictionless UX
      setAppWalletBalance(prev => prev + (price - appWalletBalance) + 50000);
      setPurchaseSuccessMsg(`کیف پول شارژ و اشتراک ${planTitle} تمدید شد ✅`);
    } else {
      setAppWalletBalance(prev => prev - price);
      setPurchaseSuccessMsg(`اشتراک ${planTitle} با موفقیت تمدید شد ✅`);
    }

    setActivePlan({
      title: planTitle,
      daysLeft: days,
      trafficGB: traffic,
      isVip: true
    });

    setTimeout(() => {
      setPurchaseSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] rounded-[42px] p-3.5 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(147,51,234,0.15)] border-4 border-slate-700/60 text-slate-100 select-none">
      {/* Top Speaker & Camera Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-cyan-500/40" />
        </div>
        <div className="w-10 h-1 bg-slate-800 rounded-full" />
      </div>

      {/* Screen Body */}
      <div className="relative w-full h-[620px] rounded-[34px] bg-[#0b0f19] overflow-hidden flex flex-col pt-8 pb-3 px-3.5 border border-slate-800 dir-rtl text-right">
        
        {/* Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-2 mb-2.5" dir="ltr">
          <span>{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            {isConnected && <Lock className="w-3 h-3 text-emerald-400" />}
            <Activity className="w-3 h-3 text-purple-400" />
            <Wifi className="w-3.5 h-3.5" />
            <span className="font-bold text-slate-300">5G</span>
          </div>
        </div>

        {/* App Bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs">
              E
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1">
                <span>اتصال اندروید</span>
                {activePlan.isVip && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px]">
                    VIP
                  </span>
                )}
              </div>
              <div className="text-[9px] text-emerald-400 font-bold">
                کیف پول: {appWalletBalance.toLocaleString('fa-IR')} ت
              </div>
            </div>
          </div>

          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30 text-[10px] font-bold text-purple-200 hover:bg-purple-600/40 transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>نصب APK</span>
          </button>
        </div>

        {/* Main Tab Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          
          {/* TAB: HOME / CONNECT */}
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col items-center justify-between py-1">
              
              {/* Server Selector Capsule */}
              <button 
                onClick={() => setActiveTab('servers')}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all text-right group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedConfig?.flag || '🇩🇪'}</span>
                  <div>
                    <div className="text-[11px] font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {selectedConfig?.name || 'سرور هوشمند Reality'}
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center gap-1">
                      <span>{selectedConfig?.location}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-purple-400 uppercase font-mono">{selectedConfig?.protocol}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <Zap className="w-2.5 h-2.5" />
                  <span>{pingSpeed}ms</span>
                </div>
              </button>

              {/* Big Power Button */}
              <div className="relative my-3 flex items-center justify-center">
                <div className={`absolute w-32 h-32 rounded-full transition-all duration-700 ${
                  isConnected 
                    ? 'bg-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-pulse' 
                    : isConnecting 
                    ? 'bg-amber-500/20 animate-spin' 
                    : 'bg-slate-800/40'
                }`} />

                <button
                  onClick={handleToggleConnect}
                  disabled={isConnecting}
                  className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-xl border-2 cursor-pointer ${
                    isConnected
                      ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 border-white/40 text-white scale-105'
                      : isConnecting
                      ? 'bg-amber-600/80 border-amber-400 text-amber-100 animate-pulse'
                      : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-white hover:border-purple-500/50'
                  }`}
                >
                  <Power className={`w-9 h-9 transition-transform duration-300 ${isConnected ? 'scale-110' : 'scale-100'}`} />
                  <span className="text-[10px] font-black mt-1">
                    {isConnected ? 'متصل شد' : isConnecting ? 'اتصال...' : 'اتصال'}
                  </span>
                </button>
              </div>

              {/* Live Speeds & Duration Cards */}
              <div className="w-full grid grid-cols-3 gap-1.5">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-0.5">
                    <ArrowDown className="w-2.5 h-2.5 text-cyan-400" />
                    <span>دانلود</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white">
                    {isConnected ? '42.8 MB/s' : '0.0 KB/s'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-0.5">
                    <ArrowUp className="w-2.5 h-2.5 text-purple-400" />
                    <span>آپلود</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white">
                    {isConnected ? '18.4 MB/s' : '0.0 KB/s'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-0.5">
                    <Activity className="w-2.5 h-2.5 text-emerald-400" />
                    <span>مدت</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>

              {/* Quick Subscription & Wallet Pill */}
              <div 
                onClick={() => setActiveTab('wallet')}
                className="w-full mt-2 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 text-[10px] cursor-pointer hover:border-emerald-500/60 transition-all"
              >
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اعتبار: {activePlan.daysLeft} روز ({activePlan.trafficGB} GB)</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[9px]">
                  تمدید / خرید اشتراک ⚡
                </span>
              </div>
            </div>
          )}

          {/* TAB: WALLET & VIP SUBSCRIPTION RENEWAL (Zero login barrier) */}
          {activeTab === 'wallet' && (
            <div className="space-y-3 py-1 animate-fade-in text-right">
              
              {/* Notification Toast inside Phone */}
              {purchaseSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-black text-center animate-bounce">
                  {purchaseSuccessMsg}
                </div>
              )}

              {/* Mobile Wallet Balance Header */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>کیف پول اپلیکیشن (بدون نیاز به لاگین)</span>
                  </span>
                  <button
                    onClick={() => setAppWalletBalance(b => b + 100000)}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-2.5 h-2.5" />
                    <span>شارژ ۱۰۰ ت</span>
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-black text-white font-mono">
                    {appWalletBalance.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-slate-400">تومان</span>
                  </div>
                  <span className="text-[9px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    شناسه دستگاه شما متصل است
                  </span>
                </div>
              </div>

              {/* In-App Renewal Catalog */}
              <div className="space-y-2">
                <div className="text-[11px] font-black text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>پلن‌های تمدید و خرید اشتراک VIP:</span>
                </div>

                {DEDICATED_CONFIG_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{prod.flag}</span>
                        <div>
                          <div className="text-[11px] font-bold text-white">{prod.title}</div>
                          <div className="text-[9px] text-slate-400">{prod.trafficGB} گیگ • {prod.durationDays} روز • {prod.protocol}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        {prod.priceTomans.toLocaleString('fa-IR')} <span className="text-[8px]">تومان</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyInApp(prod.priceTomans, prod.title, prod.durationDays, prod.trafficGB)}
                      className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>تمدید ۱ کلیک با کیف پول</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SERVERS */}
          {activeTab === 'servers' && (
            <div className="space-y-1.5 py-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300">نودهای اختصاصی و عمومی</span>
                <span className="text-[9px] text-slate-500 font-mono">{Math.min(configs.length, 10)} نود آنلاین</span>
              </div>
              {configs.slice(0, 10).map(cfg => (
                <div
                  key={cfg.id}
                  onClick={() => {
                    setSelectedConfigId(cfg.id);
                    setActiveTab('home');
                  }}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedConfigId === cfg.id
                      ? 'bg-purple-900/30 border-purple-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cfg.flag}</span>
                    <div className="text-right">
                      <div className="text-[10px] font-bold">{cfg.name}</div>
                      <div className="text-[8px] text-slate-400 uppercase font-mono">{cfg.protocol} • {cfg.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-emerald-400">{cfg.ping}ms</span>
                    {selectedConfigId === cfg.id && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SPLIT TUNNEL */}
          {activeTab === 'split' && (
            <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-200">تفکیک ترافیک (Split Tunnel)</span>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                سایت‌ها و اپ‌های بانکی شتاب بدون فیلترشکن باز می‌شوند و ترافیک بین‌الملل از تونل امن رد می‌شود.
              </p>
              <div className="space-y-1.5 pt-1">
                {['سایت‌های داخلی (.ir)', 'سامانه‌های بانکی شتاب', 'اپلیکیشن‌های پرداخت'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800/60 text-[10px] text-slate-300">
                    <span>{item}</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">مستقیم (Direct)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">اتصال</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'wallet' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">کیف پول/VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('servers')}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'servers' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Server className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">سرورها</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`flex flex-col items-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'split' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">تنظیمات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
