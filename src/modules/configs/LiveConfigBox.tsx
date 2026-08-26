import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Radio, 
  Sparkles,
  Link,
  ChevronDown
} from 'lucide-react';
import { V2RayConfig, OperatorType } from '../../types';
import { SUBSCRIPTION_URLS } from '../../data';

interface LiveConfigBoxProps {
  configs: V2RayConfig[];
  onRefreshPing: () => void;
  isTestingPing: boolean;
}

export const LiveConfigBox: React.FC<LiveConfigBoxProps> = ({
  configs,
  onRefreshPing,
  isTestingPing
}) => {
  const [selectedOperator, setSelectedOperator] = useState<OperatorType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrConfig, setQrConfig] = useState<V2RayConfig | null>(null);
  const [copiedSub, setCopiedSub] = useState(false);

  const filteredConfigs = configs.filter(cfg => {
    if (selectedOperator === 'all') return true;
    return cfg.operator === selectedOperator || cfg.operator === 'all';
  });

  const handleCopy = (config: V2RayConfig) => {
    navigator.clipboard.writeText(config.configString);
    setCopiedId(config.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySub = () => {
    const subUrl = SUBSCRIPTION_URLS[selectedOperator] || SUBSCRIPTION_URLS.all;
    navigator.clipboard.writeText(subUrl);
    setCopiedSub(true);
    setTimeout(() => setCopiedSub(false), 2000);
  };

  const operatorTabs: { id: OperatorType; label: string; icon: string }[] = [
    { id: 'all', label: 'همه اپراتورها', icon: '🌐' },
    { id: 'mci', label: 'همراه اول (MCI)', icon: '🔵' },
    { id: 'irancell', label: 'ایرانسل (MTN)', icon: '🟡' },
    { id: 'rightel', label: 'رایتل / شاتل', icon: '🟣' },
    { id: 'wifi', label: 'اینترنت خانگی (ADSL)', icon: '📶' }
  ];

  return (
    <section id="configs" className="py-8">
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-black text-white">نودهای تست‌شده V2Ray / Reality</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                بروزرسانی خودکار
              </span>
            </div>
            <p className="text-xs text-slate-400">
              کانفیگ‌های اختصاصی با پینگ زیر ۸۰ms و پروتکل‌های ضد فیلتر لایه ۷
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopySub}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedSub ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
              <span>{copiedSub ? 'لینک ساب کپی شد!' : 'کپی لینک سابسکریپشن'}</span>
            </button>

            <button
              onClick={onRefreshPing}
              disabled={isTestingPing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isTestingPing ? 'تست پینگ...' : 'تست مجدد پینگ'}</span>
            </button>
          </div>
        </div>

        {/* Operator Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 border-b border-slate-800/60">
          {operatorTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedOperator(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedOperator === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Configs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-6">
          {filteredConfigs.map(cfg => (
            <div
              key={cfg.id}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{cfg.flag}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {cfg.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-purple-400 uppercase font-mono font-bold">{cfg.protocol}</span>
                      <span>•</span>
                      <span>{cfg.transport}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                  <Zap className="w-3 h-3" />
                  <span>{cfg.ping}ms</span>
                </div>
              </div>

              {/* Bottom Details & Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">پروتکل امن:</span>
                  <span className="text-slate-300 font-mono">{cfg.tlsType}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setQrConfig(cfg)}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="نمایش بارکد QR"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopy(cfg)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      copiedId === cfg.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {copiedId === cfg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === cfg.id ? 'کپی شد' : 'کپی کانفیگ'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* QR Code Modal */}
      {qrConfig && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setQrConfig(null)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-center shadow-2xl flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">{qrConfig.name}</h3>
              <p className="text-xs text-slate-400">بارکد را با دوربین اپلیکیشن V2Ray یا Hiddify اسکن کنید</p>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrConfig.configString)}`}
                alt="QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>

            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => handleCopy(qrConfig)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                کپی مستقیم کد
              </button>
              <button
                onClick={() => setQrConfig(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
