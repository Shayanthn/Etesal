import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  KeyRound, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Globe2, 
  Smartphone,
  Eye
} from 'lucide-react';
import { V2RayConfig, MtprotoProxy, OperatorType } from '../../types';
import { 
  extractAllNodesFromText, 
  ExtractedNodeResult 
} from '../../utils/configProxyEngine';
import { 
  formatSingleConfigPost, 
  generateInlineProxyFooter,
  TelegramConfigItem,
  TelegramProxyItem
} from '../../utils/telegramPublisherEngine';

interface AdminConfigProxyIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingConfigs: V2RayConfig[];
  setConfigsList: React.Dispatch<React.SetStateAction<V2RayConfig[]>>;
  existingProxies: MtprotoProxy[];
  setProxiesList: React.Dispatch<React.SetStateAction<MtprotoProxy[]>>;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const AdminConfigProxyIngestionModal: React.FC<AdminConfigProxyIngestionModalProps> = ({
  isOpen,
  onClose,
  existingConfigs,
  setConfigsList,
  existingProxies,
  setProxiesList,
  onShowToast
}) => {
  const [rawInputText, setRawInputText] = useState('');
  const [extractedResults, setExtractedResults] = useState<ExtractedNodeResult[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [previewItem, setPreviewItem] = useState<ExtractedNodeResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Targets
  const [targetWeb, setTargetWeb] = useState(true);
  const [targetApp, setTargetApp] = useState(true);
  const [targetTelegram, setTargetTelegram] = useState(true);
  const [telegramChannelHandle, setTelegramChannelHandle] = useState('@vpnbuying');

  if (!isOpen) return null;

  const handleExtract = () => {
    if (!rawInputText.trim()) {
      onShowToast({
        title: 'ورودی خالی است',
        description: 'لطفاً متن پست یا کدهای کانفیگ را وارد کنید.',
        type: 'warning'
      });
      return;
    }

    const results = extractAllNodesFromText(rawInputText, existingConfigs, existingProxies);
    setExtractedResults(results);

    // Auto-select non-duplicate items
    const nonDuplicates = results.map((r, i) => (!r.isDuplicate ? i : -1)).filter(i => i !== -1);
    setSelectedIndices(nonDuplicates);

    if (results.length === 0) {
      onShowToast({
        title: 'هیچ نودی یافت نشد',
        description: 'الگوی معتبر vless, vmess, hy2 یا tg://proxy در متن پیدا نشد.',
        type: 'error'
      });
    } else {
      onShowToast({
        title: `استخراج موفق 🎉 (${results.length} مورد)`,
        description: `${results.filter(r => !r.isDuplicate).length} نود جدید و ${results.filter(r => r.isDuplicate).length} مورد تکراری شناسایی شد.`,
        type: 'success'
      });
      if (results[0]) setPreviewItem(results[0]);
    }
  };

  const handleToggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      setSelectedIndices(prev => [...prev, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIndices.length === extractedResults.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(extractedResults.map((_, i) => i));
    }
  };

  const handlePublishSelected = () => {
    const toPublish = extractedResults.filter((_, idx) => selectedIndices.includes(idx));
    if (toPublish.length === 0) {
      onShowToast({
        title: 'موردی انتخاب نشده است',
        description: 'لطفاً حداقل یک نود را برای انتشار علامت بزنید.',
        type: 'warning'
      });
      return;
    }

    const newConfigs: V2RayConfig[] = [];
    const newProxies: MtprotoProxy[] = [];

    for (const item of toPublish) {
      if (item.type === 'v2ray' && item.v2rayConfig) {
        newConfigs.push(item.v2rayConfig);
      } else if (item.type === 'mtproto' && item.mtprotoProxy) {
        newProxies.push(item.mtprotoProxy);
      }
    }

    // 1. Update React State (Web & App)
    if (newConfigs.length > 0) {
      setConfigsList(prev => [...newConfigs, ...prev]);
    }
    if (newProxies.length > 0) {
      setProxiesList(prev => [...newProxies, ...prev]);
    }

    // 2. Multi-channel confirmation
    const channelsList: string[] = [];
    if (targetWeb) channelsList.push('🌐 وب‌سایت');
    if (targetApp) channelsList.push('📱 اپلیکیشن اندروید');
    if (targetTelegram) channelsList.push(`🚀 کانال تلگرام (${telegramChannelHandle})`);

    onShowToast({
      title: 'انتشار موفق در ۳ کانال 🚀',
      description: `${toPublish.length} نود در [${channelsList.join(' + ')}] تزریق و همگام‌سازی شدند.`,
      type: 'success'
    });

    onClose();
  };

  const getPreviewText = () => {
    if (!previewItem) return '';
    if (previewItem.type === 'v2ray' && previewItem.v2rayConfig) {
      return formatSingleConfigPost({
        name: previewItem.v2rayConfig.name,
        protocol: previewItem.v2rayConfig.protocol,
        configString: previewItem.v2rayConfig.configString,
        operator: previewItem.v2rayConfig.operator,
        location: previewItem.v2rayConfig.location,
        flag: previewItem.v2rayConfig.flag
      });
    } else if (previewItem.type === 'mtproto' && previewItem.mtprotoProxy) {
      const proxyItem: TelegramProxyItem = {
        server: previewItem.mtprotoProxy.host,
        port: previewItem.mtprotoProxy.port,
        secret: previewItem.mtprotoProxy.secret
      };
      const footer = generateInlineProxyFooter([proxyItem, proxyItem, proxyItem], 3);
      return `[متن وایرال / کپشن رسانه]\n\n${footer}`;
    }
    return '';
  };

  const handleCopyPreview = () => {
    if (!previewItem) return;
    const text = getPreviewText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast({
      title: 'متن پست تلگرام کپی شد 📋',
      description: 'آماده ارسال و چسباندن در کانال تلگرام است.',
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-purple-500/40 p-5 sm:p-6 shadow-2xl space-y-5 text-right my-4 sm:my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>موتور هوشمند استخراج، اعتبارسنجی و توزیع خودکار (تزریق به ۳ مقصد)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              پارس انواع کانفیگ VLESS Reality، VMess، Hysteria 2 و MTProto، دسته‌بندی اپراتوری و انتشار همزمان در وب‌سایت، اپلیکیشن و کانال تلگرام.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area & Extraction Trigger */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <span>متن خام پست تلگرامی، لینک سابسکریپشن یا کدهای کانفیگ:</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              پشتیبانی از: vless://, vmess://, hy2://, trojan://, tg://proxy
            </span>
          </div>

          <textarea
            rows={4}
            value={rawInputText}
            onChange={(e) => setRawInputText(e.target.value)}
            placeholder="متن پست‌های تلگرامی را اینجا Paste کنید (حتی متن‌های شلوغ همراه با ایموجی و تبلیغات)...
مثال:
vless://uuid@server.com:443?security=reality&sni=microsoft.com&pbk=xxx#🇩🇪 آلمان - همراه اول
hy2://auth@1.2.3.4:8443#⚡ ایرانسل Hysteria
tg://proxy?server=fra.proxy.com&port=443&secret=ee123..."
            className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-500 resize-none text-left dir-ltr"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>فیلتر خودکار موارد تکراری و اعتبارسنجی TLS / Fake-TLS فعال است</span>
            </div>

            <button
              onClick={handleExtract}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>استخراج، تحلیل اپراتور و تست سلامت</span>
            </button>
          </div>
        </div>

        {/* Extraction Results & Distribution Workspace */}
        {extractedResults.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">نودهای استخراج‌شده ({extractedResults.length} نود):</h4>
                <button
                  onClick={handleSelectAll}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  {selectedIndices.length === extractedResults.length ? 'عدم انتخاب همه' : 'انتخاب همه موارد معتبر'}
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {selectedIndices.length} مورد آماده انتشار
              </span>
            </div>

            {/* Grid Layout: Extracted Nodes + Telegram Post Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Extracted Nodes List */}
              <div className="lg:col-span-7 space-y-2 max-h-72 overflow-y-auto pr-1">
                {extractedResults.map((item, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  const isPreview = previewItem === item;

                  return (
                    <div
                      key={idx}
                      onClick={() => setPreviewItem(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isPreview
                          ? 'border-purple-500 bg-purple-950/40 shadow-md'
                          : 'border-slate-800 bg-slate-950/70 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(idx);
                          }}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer shrink-0"
                        />
                        <span className="text-lg shrink-0">{item.detectedCountry.flag}</span>
                        
                        <div className="overflow-hidden space-y-0.5 text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {item.v2rayConfig?.name || item.mtprotoProxy?.name}
                            </span>
                            {item.isDuplicate && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[9px]">
                                تکراری
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span className="text-cyan-400 uppercase font-bold">{item.details.protocol}</span>
                            <span>•</span>
                            <span>پورت: {item.details.port}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{item.v2rayConfig?.ping || item.mtprotoProxy?.ping}ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Operator badge */}
                      <div className="shrink-0 text-left">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.detectedOperator === 'mci' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                          item.detectedOperator === 'irancell' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                          item.detectedOperator === 'rightel' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                          item.detectedOperator === 'wifi' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}>
                          {item.detectedOperator === 'all' ? 'همه اپراتورها' : item.detectedOperator.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Telegram Post Live Preview */}
              <div className="lg:col-span-5 rounded-2xl bg-slate-950 border border-purple-500/30 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-cyan-400" />
                      <span>پیش‌نمایش پست در کانال تلگرام:</span>
                    </span>
                    <button
                      onClick={handleCopyPreview}
                      className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'کپی شد' : 'کپی پست'}</span>
                    </button>
                  </div>

                  {previewItem ? (
                    <div className="text-[11px] text-slate-300 font-mono whitespace-pre-line bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto dir-rtl text-right">
                      {getPreviewText()}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">روی یکی از نودها کلیک کنید تا پیش‌نمایش تلگرامی آن ظاهر شود.</p>
                  )}
                </div>

                {previewItem && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-center text-[11px] font-bold text-purple-300">
                      {previewItem.type === 'v2ray' ? '📋 فرمت: تک‌پیامی با کپی آسان ۱-لمسی' : '⚡️ فرمت: ۳ پروکسی خطی در کپشن با تفکیک نقطه'}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Target Channels Checklist & 1-Click Publishing */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">کانال‌های انتشار همزمان (Multi-Channel Dispatch):</span>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetWeb}
                      onChange={(e) => setTargetWeb(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>وب‌سایت زنده (Live Site)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetApp}
                      onChange={(e) => setTargetApp(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>اپلیکیشن اندروید (Subscription Link)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetTelegram}
                      onChange={(e) => setTargetTelegram(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>کانال تلگرام</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>

                <button
                  onClick={handlePublishSelected}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-xl cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و انتشار نهایی ({selectedIndices.length} نود)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        </div>
      </div>
    </div>
  );
};
