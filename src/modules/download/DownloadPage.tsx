import React, { useState } from 'react';
import { 
  Download, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Smartphone, 
  Copy, 
  Check, 
  ArrowLeft, 
  Activity, 
  Cpu, 
  QrCode, 
  HelpCircle,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { CURRENT_APP_RELEASE } from '../../data/releaseInfo';

interface DownloadPageProps {
  onBackToHome: () => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onBackToHome, onShowToast }) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'install_guide' | 'changelog'>('install_guide');
  const [activeGuideStep, setActiveGuideStep] = useState(1);

  const handleCopySha = () => {
    navigator.clipboard.writeText(CURRENT_APP_RELEASE.sha256Checksum);
    setCopiedSha(true);
    onShowToast({
      title: 'هش امنیتی SHA-256 کپی شد 📋',
      description: 'می‌توانید تطابق اصالت فایل APK را از این طریق ارزیابی فرمایید.',
      type: 'info'
    });
    setTimeout(() => setCopiedSha(false), 2500);
  };

  const handleDownloadClick = () => {
    onShowToast({
      title: 'دریافت فایل APK آغاز شد 🚀',
      description: `نسخه ${CURRENT_APP_RELEASE.version} با حجم ۶.۸ مگابایت در حال دانلود است.`,
      type: 'success'
    });
  };

  const guideSteps = [
    {
      step: 1,
      title: 'تأیید دانلود در مرورگر (Download Anyway)',
      badge: 'مرحله ۱ از ۴',
      desc: 'سیستم‌عامل اندروید برای فایل‌های APK که مستقیماً از وب دانلود می‌شوند هشداری مبنی بر File might be harmful نمایش می‌دهد. این رفتار استاندارد اندروید برای کلیه اپ‌های خارج از استور است.',
      actionNote: 'روی دکمه آبی‌رنگ «Download anyway» یا «بارگیری به‌هرحال» کلیک کنید تا فایل کامل ذخیره شود.',
      mockType: 'browser_prompt'
    },
    {
      step: 2,
      title: 'مجوز نصب از منابع ناشناخته (Allow from this source)',
      badge: 'مرحله ۲ از ۴',
      desc: 'پس از اتمام دانلود و باز کردن فایل، اندروید ممکن است پیامی نمایش دهد که مرورگر یا برنامه مدیریت فایل شما دسترسی نصب برنامه ندارد.',
      actionNote: 'روی گزینه «Settings / تنظیمات» کلیک کرده و سوییچ «Allow from this source / اجازه از این منبع» را روشن (فعال) کنید.',
      mockType: 'settings_toggle'
    },
    {
      step: 3,
      title: 'نصب و عبور از اخطار محافظ امنیتی (Install Anyway)',
      badge: 'مرحله ۳ از ۴',
      desc: 'در پنجره باز شده دکمه «Install / نصب» را بزنید. در صورتی که اخطار Google Play Protect ظاهر شد، به دلیل پروتکل‌های رمزنگاری شده Sing-Box است.',
      actionNote: 'روی «More details / جزئیات بیشتر» کلیک کنید و سپس «Install anyway / نصب به‌هرحال» را لمس فرمایید.',
      mockType: 'play_protect'
    },
    {
      step: 4,
      title: 'اجرای اپلیکیشن و تأیید درخواست اتصال (Connection Request)',
      badge: 'مرحله ۴ از ۴',
      desc: 'اپلیکیشن اتصال را باز کنید. روی دکمه بزرگ دایره‌ای مرکزی «اتصال» کلیک کنید.',
      actionNote: 'در پنجره درخواست سیستم‌عامل اندروید (Connection request / درخواست اتصال VPN) دکمه «OK / تأیید» را لمس کنید تا اتصال پایدار برقرار شود.',
      mockType: 'vpn_prompt'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right py-4 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb / Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>بازگشت به صفحه اصلی</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>نسخه رسمی و بیلد پایدار آماده دریافت مستقیم</span>
        </div>
      </div>

      {/* Main Download Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-purple-500/25 p-6 md:p-10 overflow-hidden shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Info Side */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono">
                نسخه رسمی v{CURRENT_APP_RELEASE.version} (بیلد پایدار)
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>بهینه‌شده برای همراه اول، ایرانسل و مخابرات</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
                {CURRENT_APP_RELEASE.releaseDateFa}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                دانلود اپلیکیشن اختصاصی <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">اتصال (Etesal Hub)</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-300 leading-relaxed">
                کلاینت قدرتمند و بهینه‌شده اندروید با هسته Sing-Box Core، پشتیبانی از Reality، VLESS و Hysteria 2. اتصال با پینگ زیر ۴۰ میلی‌ثانیه و بدون قطعی در شرایط اختلال شبکه.
              </p>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">حجم دقیق فایل</div>
                <div className="text-sm font-bold text-white mt-0.5 font-mono">{CURRENT_APP_RELEASE.fileSizeMB} مگابایت</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">سازگاری سیستم</div>
                <div className="text-xs font-bold text-white mt-0.5">Android 7.0 تا 14</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">هسته پردازش</div>
                <div className="text-xs font-bold text-cyan-400 mt-0.5 font-mono">Sing-Box v6 Core</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">حریم خصوصی</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">رمزنگاری ۱۰۰٪ کلاینت</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <a
                href={CURRENT_APP_RELEASE.downloadUrl}
                download="etesal-v6.0.0.apk"
                onClick={handleDownloadClick}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>دانلود مستقیم فایل APK ({CURRENT_APP_RELEASE.fileSizeMB} MB)</span>
              </a>

              <a
                href={CURRENT_APP_RELEASE.downloadUrl}
                download="etesal-v6.0.0.apk"
                className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
                title="دانلود از سرور کمکی پرسرعت"
              >
                <Server className="w-4 h-4 text-cyan-400" />
                <span>سرور کمکی لبه شبکه (Mirror CDN)</span>
              </a>
            </div>

          </div>

          {/* Right / QR Code & Verifiable Checksum */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/90 border border-purple-500/20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <QrCode className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white">اسکن و دانلود با گوشی</h3>
              <p className="text-[11px] text-slate-400 mt-1">با دوربین یا بارکدخوان گوشی اسکن کنید</p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-md inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://etesal.aetherai.ir/downloads/etesal-v6.0.0.apk')}`}
                alt="QR Code دانلود مستقیم اپلیکیشن اتصال"
                className="w-36 h-36"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* SHA-256 Checksum Container */}
            <div className="w-full space-y-1 text-right pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>تأیید اصالت فایل (SHA-256):</span>
                <button
                  onClick={handleCopySha}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                >
                  {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSha ? 'کپی شد' : 'کپی هش'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 text-[10px] font-mono text-slate-400 truncate dir-ltr">
                {CURRENT_APP_RELEASE.sha256Checksum}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('install_guide')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'install_guide' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-300" />
            <span>راهنمای تصویری و گام‌به‌گام نصب (اندروید)</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'info' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-300" />
            <span>قابلیت‌های فنی و معماری نرم‌افزار</span>
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'changelog' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>تغییرات نسخه {CURRENT_APP_RELEASE.version}</span>
          </button>
        </div>

        {/* Tab: Real Visual Installation Guide */}
        {activeTab === 'install_guide' && (
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <span>آموزش تصویری ۴ مرحله‌ای نصب و فعال‌سازی در گوشی‌های سامسونگ، شیائومی و هواوی</span>
              </h3>
              <p className="text-xs text-slate-400">
                جهت سهولت در نصب، هر مرحله به همراه شبیه‌ساز تصویر نمایشگر گوشی در زیر آمده است:
              </p>
            </div>

            {/* Step Selector Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
              {guideSteps.map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveGuideStep(s.step)}
                  className={`p-3 rounded-2xl text-right transition-all cursor-pointer border ${
                    activeGuideStep === s.step
                      ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 mb-1">
                    <span>{s.badge}</span>
                    {activeGuideStep === s.step && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-xs font-bold leading-snug truncate">{s.title}</div>
                </button>
              ))}
            </div>

            {/* Active Step Showcase Area */}
            {(() => {
              const current = guideSteps.find(s => s.step === activeGuideStep) || guideSteps[0];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
                  
                  {/* Step Description */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 text-xs font-bold border border-purple-500/30">
                      <span>{current.badge}</span>
                      <span>•</span>
                      <span>گام ضروری</span>
                    </div>

                    <h4 className="text-lg md:text-xl font-bold text-white">{current.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{current.desc}</p>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 text-xs text-purple-200 leading-relaxed flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-purple-600/30 flex items-center justify-center shrink-0 text-cyan-300 font-bold">
                        ✓
                      </div>
                      <p>{current.actionNote}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setActiveGuideStep(prev => Math.max(1, prev - 1))}
                        disabled={activeGuideStep === 1}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>مرحله قبلی</span>
                      </button>

                      <button
                        onClick={() => setActiveGuideStep(prev => Math.min(4, prev + 1))}
                        disabled={activeGuideStep === 4}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <span>مرحله بعدی</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Phone Screen Wireframe Mockup */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-64 md:w-72 rounded-[36px] bg-slate-900 border-4 border-slate-700 p-4 shadow-2xl space-y-3 relative overflow-hidden select-none">
                      {/* Phone Speaker Notch */}
                      <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto" />

                      {/* Mockup Screen Content */}
                      {current.mockType === 'browser_prompt' && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                          <div className="text-xs font-bold text-white">File might be harmful?</div>
                          <p className="text-[10px] text-slate-400">Do you want to download etesal-v6.0.0.apk anyway?</p>
                          <div className="flex items-center gap-2 pt-2">
                            <span className="flex-1 py-1.5 rounded-lg bg-slate-800 text-[10px] text-slate-400">Cancel</span>
                            <span className="flex-1 py-1.5 rounded-lg bg-blue-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                              Download anyway
                            </span>
                          </div>
                        </div>
                      )}

                      {current.mockType === 'settings_toggle' && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="text-xs font-bold text-white text-center">Install Unknown Apps</div>
                          <p className="text-[10px] text-slate-400 text-center">Chrome / My Files</p>
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] text-white">Allow from this source</span>
                            <span className="w-8 h-4 rounded-full bg-blue-500 flex items-center justify-end px-0.5">
                              <span className="w-3 h-3 rounded-full bg-white shadow" />
                            </span>
                          </div>
                        </div>
                      )}

                      {current.mockType === 'play_protect' && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                          <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto" />
                          <div className="text-xs font-bold text-white">Blocked by Play Protect?</div>
                          <p className="text-[10px] text-slate-400">Sing-Box VPN engine detected.</p>
                          <div className="text-[10px] text-blue-400 underline cursor-pointer">More details</div>
                          <div className="py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-white border border-slate-700 animate-pulse">
                            Install anyway
                          </div>
                        </div>
                      )}

                      {current.mockType === 'vpn_prompt' && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                            <Zap className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="text-xs font-bold text-white">Connection request</div>
                          <p className="text-[10px] text-slate-400">Etesal wants to set up a VPN connection to monitor network traffic.</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="flex-1 py-1.5 rounded-lg bg-slate-800 text-[10px] text-slate-400">Cancel</span>
                            <span className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                              OK / تأیید
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-center text-[9px] text-slate-500 font-mono">
                        ETESAL SECURE ANDROID CLIENT
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>
        )}

        {/* Tab 2: Key Features */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CURRENT_APP_RELEASE.features.map((feat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    {feat.icon === 'Zap' && <Zap className="w-4 h-4" />}
                    {feat.icon === 'ShieldCheck' && <ShieldCheck className="w-4 h-4" />}
                    {feat.icon === 'Cpu' && <Cpu className="w-4 h-4" />}
                    {feat.icon === 'Activity' && <Activity className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pr-11">{feat.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Changelog */}
        {activeTab === 'changelog' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">تغییرات و بهینه‌سازی‌های نسخه {CURRENT_APP_RELEASE.version}:</h3>
            <ul className="space-y-2.5">
              {CURRENT_APP_RELEASE.changelog.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
};
