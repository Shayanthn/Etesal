import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';
import { MtprotoProxy } from '../../types';

interface LiveProxyBoxProps {
  proxies: MtprotoProxy[];
  onRefreshPing: () => void;
  isTestingPing: boolean;
}

export const LiveProxyBox: React.FC<LiveProxyBoxProps> = ({
  proxies,
  onRefreshPing,
  isTestingPing
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getProxyUrl = (proxy: MtprotoProxy) => {
    return `tg://proxy?server=${proxy.host}&port=${proxy.port}&secret=${proxy.secret}`;
  };

  const handleCopy = (proxy: MtprotoProxy) => {
    navigator.clipboard.writeText(getProxyUrl(proxy));
    setCopiedId(proxy.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="proxies" className="py-8">
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Send className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-white">پروکسی‌های ۱ کلیک تلگرام (MTProto)</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Fake-TLS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              اتصال بدون نیاز به نصب فیلترشکن، سازگار با تلگرام اصلی و دسکتاپ
            </p>
          </div>

          <button
            onClick={onRefreshPing}
            disabled={isTestingPing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isTestingPing ? 'بررسی اتصال...' : 'پایش مجدد پروکسی‌ها'}</span>
          </button>
        </div>

        {/* Proxies Grid */}
        {proxies.length === 0 ? (
          <div className="py-12 px-6 text-center rounded-2xl bg-slate-800/20 border border-dashed border-slate-700/60 my-6 space-y-3">
            <Send className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
            <div className="text-sm font-bold text-slate-300">پروکسی فعالی در این لحظه یافت نشد</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              پروکسی‌های MTProto به صورت مداوم تست و پالایش می‌شوند. روی دکمه «پایش مجدد پروکسی‌ها» کلیک کنید تا نودهای تازه بارگذاری شوند.
            </p>
            <button
              onClick={onRefreshPing}
              disabled={isTestingPing}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-xs font-bold border border-cyan-500/40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>پایش و دریافت مجدد پروکسی‌ها</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-6">
            {proxies.slice(0, 6).map(prx => (
              <div
                key={prx.id}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800/70 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{prx.flag}</span>
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {prx.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">{prx.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <Zap className="w-3 h-3" />
                      <span>{prx.ping}ms</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[170px]">{prx.host}:{prx.port}</span>
                    <span className="text-cyan-400 font-bold">Port {prx.port}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={getProxyUrl(prx)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>اتصال به تلگرام</span>
                  </a>

                  <button
                    onClick={() => handleCopy(prx)}
                    className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="کپی لینک پروکسی"
                  >
                    {copiedId === prx.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>پروکسی‌های Fake-TLS رمزنگاری شده با پورت ۴۴۳ غیرقابل مسدودی هستند.</span>
          </div>
          <a 
            href="https://t.me/vpnbuying" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
          >
            <span>دریافت پروکسی‌های بیشتر در کانال</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </section>
  );
};
