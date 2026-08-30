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
  Send, 
  Headphones, 
  Activity, 
  Cpu, 
  FileCode2, 
  QrCode, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { CURRENT_APP_RELEASE } from '../../data/releaseInfo';

interface DownloadPageProps {
  onBackToHome: () => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onBackToHome, onShowToast }) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'install_guide' | 'changelog'>('info');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopySha = () => {
    navigator.clipboard.writeText(CURRENT_APP_RELEASE.sha256Checksum);
    setCopiedSha(true);
    onShowToast({
      title: 'هش SHA-256 کپی شد 📋',
      description: 'می‌توانید صحت و اصالت فایل APK دانلودشده را بررسی فرمایید.',
      type: 'info'
    });
    setTimeout(() => setCopiedSha(false), 2500);
  };

  const handleDownloadClick = () => {
    onShowToast({
      title: 'شروع دانلود اپلیکیشن اتصال 🚀',
      description: `فایل نسخه ${CURRENT_APP_RELEASE.version} آماده دریافت گردید.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right py-4">
      
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
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>آخرین بیلد پایدار آماده دریافت</span>
        </div>
      </div>

      {/* Main Download Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-purple-500/20 p-6 md:p-10 overflow-hidden shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Info Side */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono">
                نسخه {CURRENT_APP_RELEASE.version} (v{CURRENT_APP_RELEASE.versionCode})
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تست‌شده روی همراه اول و ایرانسل</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
                {CURRENT_APP_RELEASE.releaseDateFa}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                دانلود اپلیکیشن اختصاصی <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">اتصال (Etesal)</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-300 leading-relaxed">
                کلاینت اختصاصی و بهینه‌شده برای اندروید با پشتیبانی از پروتکل‌های Reality، Hysteria 2 و VLESS. اتصال پایدار، سریع و ضدفیلتر با فناوری ECH و تونل انتخابی.
              </p>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">حجم فایل APK</div>
                <div className="text-sm font-bold text-white mt-0.5">{CURRENT_APP_RELEASE.fileSizeMB} مگابایت</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">حداقل اندروید</div>
                <div className="text-xs font-bold text-white mt-0.5">Android 7.0+</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">هسته اتصال</div>
                <div className="text-xs font-bold text-cyan-400 mt-0.5 font-mono">Sing-Box Core</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400">امنیت و لاگ</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">Zero-Log (بدون لاگ)</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <a
                href={CURRENT_APP_RELEASE.downloadUrl}
                download="etesal-latest.apk"
                onClick={handleDownloadClick}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>دانلود مستقیم فایل APK (رایگان)</span>
              </a>

              <a
                href="https://t.me/vpnbuying"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all"
              >
                <Send className="w-4 h-4 text-cyan-400" />
                <span>دریافت از کانال تلگرام (@vpnbuying)</span>
              </a>
            </div>

            {/* Support telegram info */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>پشتیبانی مستقیم در تلگرام: </span>
              <a 
                href="https://t.me/NetWithoutBorders" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-mono font-bold"
              >
                @NetWithoutBorders
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
              <p className="text-[11px] text-slate-400 mt-1">با دوربین گوشی اسکن کنید تا فایل مستقیم دانلود شود</p>
            </div>

            {/* QR Code Graphic Generator via Public SVG API */}
            <div className="p-3 bg-white rounded-2xl shadow-md inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://etesal.aetherai.ir/download')}`}
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
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold"
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'info' 
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            قابلیت‌های کلیدی اپلیکیشن
          </button>

          <button
            onClick={() => setActiveTab('install_guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'install_guide' 
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            راهنمای تصویری نصب (اندروید)
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'changelog' 
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تغییرات نسخه {CURRENT_APP_RELEASE.version}
          </button>
        </div>

        {/* Tab 1: Key Features */}
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

        {/* Tab 2: Install Guide */}
        {activeTab === 'install_guide' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white">راهنمای ۳ مرحله‌ای نصب اپلیکیشن اتصال در اندروید:</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-900/50 text-purple-300 font-bold text-xs flex items-center justify-center">۱</div>
                <div className="text-xs font-bold text-white">دانلود فایل APK</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  روی دکمه دانلود مستقیم کلیک کنید تا فایل <span className="font-mono text-purple-300">etesal-latest.apk</span> در گوشی ذخیره شود.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-900/50 text-purple-300 font-bold text-xs flex items-center justify-center">۲</div>
                <div className="text-xs font-bold text-white">اجازه نصب از منابع ناشناخته</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  در صورت نمایش اخطار مرورگر، گزینه <span className="text-cyan-300 font-semibold">Settings / Allow from this source</span> را روشن کنید.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-900/50 text-purple-300 font-bold text-xs flex items-center justify-center">۳</div>
                <div className="text-xs font-bold text-white">اتصال و استفاده نامحدود</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  اپلیکیشن را باز کرده و با زدن دکمه بزرگ اتصال، از اینترنت بدون محدودیت و با پینگ پایین لذت ببرید.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Changelog */}
        {activeTab === 'changelog' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">لیست به‌روزرسانی‌های نسخه {CURRENT_APP_RELEASE.version}:</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {CURRENT_APP_RELEASE.changelog.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
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
