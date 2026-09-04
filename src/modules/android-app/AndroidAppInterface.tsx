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
  const [showWalletUnavailableModal, setShowWalletUnavailableModal] = useState(false);
  const [pingSpeed, setPingSpeed] = useState(42);
  const [duration, setDuration] = useState(0);

  const handleOpenWallet = () => {
    setActiveTab('wallet');
    setShowWalletUnavailableModal(true);
  };

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
        
        {/* Wallet Unavailable In-App Popup Modal */}
        {showWalletUnavailableModal && (
          <div 
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-center select-none"
            onClick={() => setShowWalletUnavailableModal(false)}
          >
            <div 
              className="w-full max-w-[280px] rounded-3xl bg-slate-900 border-2 border-purple-500/40 p-5 shadow-2xl space-y-4 text-center transform transition-all"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400 shadow-inner">
                <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-white">قابلیت در دسترس نیست</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  فعلاً این قابلیت در دسترس نیست، از سرورها و کانفیگ‌های رایگان لذت ببر! 🎉
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setShowWalletUnavailableModal(false);
                    setActiveTab('servers');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-950/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>سرورها و کانفیگ‌های رایگان</span>
                </button>

                <button
                  onClick={() => setShowWalletUnavailableModal(false)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-bold cursor-pointer transition-all"
                >
                  متوجه شدم
                </button>
              </div>
            </div>
          </div>
        )}

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
                onClick={handleOpenWallet}
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

          {/* TAB: WALLET & VIP SUBSCRIPTION RENEWAL */}
          {activeTab === 'wallet' && (
            <div className="space-y-3 py-1 animate-fade-in text-right">
              
              {/* Feature Unavailable Notice Banner */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-black text-white text-xs">این قابلیت در دسترس نیست</div>
                  <div className="text-[10px] text-slate-300 leading-normal">
                    در حال حاضر تمامی نودهای ارتباطی اتصال ۱۰۰٪ رایگان هستند. از سرورهای آزاد لذت ببرید!
                  </div>
                </div>
              </div>

              {/* Free Servers Direct Action */}
              <button
                onClick={() => setActiveTab('servers')}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Server className="w-3.5 h-3.5" />
                <span>مشاهده سرورهای رایگان و پرسرعت 🚀</span>
              </button>

              {/* In-App Renewal Catalog (Locked/Informational) */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-black text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>پلن‌های اشتراک VIP (آینده):</span>
                  </span>
                  <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    موقتاً غیرفعال
                  </span>
                </div>

                {DEDICATED_CONFIG_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => setShowWalletUnavailableModal(true)}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-2 cursor-pointer opacity-80 hover:opacity-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{prod.flag}</span>
                        <div>
                          <div className="text-[11px] font-bold text-white">{prod.title}</div>
                          <div className="text-[9px] text-slate-400">{prod.trafficGB} گیگ • {prod.durationDays} روز • {prod.protocol}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-slate-400 font-mono">
                        رایگان فعلی
                      </div>
                    </div>

                    <div className="w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-[10px] shadow-sm transition-all flex items-center justify-center gap-1">
                      <CreditCard className="w-3 h-3 text-purple-400" />
                      <span>این قابلیت در دسترس نیست (رایگان)</span>
                    </div>
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
            onClick={handleOpenWallet}
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
