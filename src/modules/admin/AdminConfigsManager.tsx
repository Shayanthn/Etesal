import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Globe2,
  Sparkles,
  Zap
} from 'lucide-react';
import { V2RayConfig, OperatorType } from '../../types';

interface AdminConfigsManagerProps {
  configsList: V2RayConfig[];
  setConfigsList: React.Dispatch<React.SetStateAction<V2RayConfig[]>>;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onBatchPing: () => void;
  onOpenIngestionModal?: () => void;
}

export const AdminConfigsManager: React.FC<AdminConfigsManagerProps> = ({
  configsList,
  setConfigsList,
  onShowToast,
  onBatchPing,
  onOpenIngestionModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<V2RayConfig | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState<V2RayConfig['protocol']>('vless');
  const [configString, setConfigString] = useState('');
  const [operator, setOperator] = useState<OperatorType>('all');
  const [location, setLocation] = useState('🇩🇪 آلمان - Frankfurt Dedicated');
  const [flag, setFlag] = useState('🇩🇪');
  const [ping, setPing] = useState(48);
  const [tlsType, setTlsType] = useState('Reality / TLS 1.3');
  const [transport, setTransport] = useState('gRPC / TCP');

  const handleOpenAdd = () => {
    setEditingConfig(null);
    setName('');
    setProtocol('vless');
    setConfigString('');
    setOperator('all');
    setLocation('🇩🇪 آلمان - Frankfurt Dedicated');
    setFlag('🇩🇪');
    setPing(45);
    setTlsType('Reality / TLS 1.3');
    setTransport('gRPC / TCP');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cfg: V2RayConfig) => {
    setEditingConfig(cfg);
    setName(cfg.name);
    setProtocol(cfg.protocol);
    setConfigString(cfg.configString);
    setOperator(cfg.operator);
    setLocation(cfg.location);
    setFlag(cfg.flag);
    setPing(cfg.ping);
    setTlsType(cfg.tlsType);
    setTransport(cfg.transport);
    setIsModalOpen(true);
  };

  const handleCopyConfig = (cfg: V2RayConfig) => {
    navigator.clipboard.writeText(cfg.configString);
    setCopiedId(cfg.id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast({
      title: 'کانفیگ کپی شد 📋',
      description: `کد دسترسی ${cfg.name} در حافظه موقت کپی گردید.`,
      type: 'success'
    });
  };

  const handleDelete = (id: string) => {
    setConfigsList(prev => prev.filter(c => c.id !== id));
    onShowToast({
      title: 'کانفیگ حذف شد 🗑️',
      description: 'نود مورد نظر از لیست سرورهای در دسترس خارج شد.',
      type: 'info'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configString.trim()) {
      onShowToast({
        title: 'خطا',
        description: 'لطفاً رشته کانفیگ را وارد کنید.',
        type: 'error'
      });
      return;
    }

    // Auto-detect protocol from string if standard prefix
    let detectedProto = protocol;
    const str = configString.trim();
    if (str.startsWith('vless://')) detectedProto = 'vless';
    else if (str.startsWith('vmess://')) detectedProto = 'vmess';
    else if (str.startsWith('trojan://')) detectedProto = 'trojan';
    else if (str.startsWith('hy2://') || str.startsWith('hysteria2://')) detectedProto = 'hysteria2';
    else if (str.startsWith('ss://')) detectedProto = 'shadowsocks';
    else if (str.startsWith('tuic://')) detectedProto = 'tuic';

    if (editingConfig) {
      // Update
      setConfigsList(prev => prev.map(c => {
        if (c.id === editingConfig.id) {
          return {
            ...c,
            name: name.trim() || c.name,
            protocol: detectedProto,
            configString: str,
            operator,
            location,
            flag,
            ping: Number(ping) || 50,
            tlsType,
            transport,
            verifiedAt: 'لحظاتی پیش'
          };
        }
        return c;
      }));

      onShowToast({
        title: 'کانفیگ ویرایش شد ⚙️',
        description: `تغییرات نود ${name || editingConfig.name} با موفقیت اعمال گردید.`,
        type: 'success'
      });
    } else {
      // Create
      const newCfg: V2RayConfig = {
        id: 'cfg-' + Date.now(),
        name: name.trim() || `⚡ ${flag} اختصاصی - ${detectedProto.toUpperCase()}`,
        protocol: detectedProto,
        configString: str,
        ping: Number(ping) || Math.floor(Math.random() * 40) + 45,
        location,
        flag,
        operator,
        quality: 'excellent',
        tlsType,
        transport,
        verifiedAt: 'لحظاتی پیش',
        isOfficial: true
      };

      setConfigsList(prev => [newCfg, ...prev]);
      onShowToast({
        title: 'کانفیگ جدید ذخیره شد 🔑',
        description: `نود ${newCfg.name} در لیست سرورهای کلاینت منتشر شد.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>مدیریت کانفیگ‌های V2Ray، Reality و Hysteria 2 ({configsList.length} نود)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            افزودن دستی، ویرایش پروتکل‌ها و رشته اتصال، تست پینگ و حذف نودهای مسدود شده.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenIngestionModal && (
            <button
              onClick={onOpenIngestionModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ استخراج هوشمند و تزریق به ۳ کانال</span>
            </button>
          )}

          <button
            onClick={onBatchPing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تست پینگ همگانی</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن دستی</span>
          </button>
        </div>
      </div>

      {/* Configs Table */}
      <div className="overflow-x-auto rounded-3xl bg-slate-900/80 border border-slate-800">
        <table className="w-full text-right text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3.5">نام نود و موقعیت</th>
              <th className="p-3.5">پروتکل</th>
              <th className="p-3.5">اپراتور سازگار</th>
              <th className="p-3.5">تاخیر (پینگ)</th>
              <th className="p-3.5">رشته کانفیگ</th>
              <th className="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {configsList.map((cfg) => (
              <tr key={cfg.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-bold text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cfg.flag}</span>
                    <div>
                      <span>{cfg.name}</span>
                      <span className="text-[10px] text-slate-500 block font-normal">{cfg.location}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-mono uppercase font-bold">
                    {cfg.protocol}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    cfg.operator === 'mci' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                    cfg.operator === 'irancell' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                    cfg.operator === 'rightel' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                    'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}>
                    {cfg.operator === 'all' ? 'همه اپراتورها' : cfg.operator.toUpperCase()}
                  </span>
                </td>
                <td className="p-3.5 font-mono text-emerald-400 font-bold">
                  {cfg.ping}ms
                </td>
                <td className="p-3.5 font-mono text-[10px] text-cyan-300 max-w-[180px] truncate dir-ltr text-left">
                  {cfg.configString}
                </td>
                <td className="p-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleCopyConfig(cfg)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                      title="کپی کانفیگ"
                    >
                      {copiedId === cfg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cfg)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors"
                      title="ویرایش کانفیگ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cfg.id)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                      title="حذف کانفیگ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Config Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-purple-500/40 p-5 sm:p-6 shadow-2xl space-y-4 text-right my-4 sm:my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-400" />
                <span>{editingConfig ? 'ویرایش کانفیگ نود Reality / V2Ray' : 'افزودن کانفیگ اختصاصی جدید'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">نام نمایشی نود:</label>
                  <input
                    type="text"
                    placeholder="مثال: 🇩🇪 آلمان - Reality اختصاصی"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">پروتکل:</label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="vless">VLESS (Reality / Vision)</option>
                    <option value="vmess">VMess (WS / TCP)</option>
                    <option value="hysteria2">Hysteria 2 (UDP QUIC)</option>
                    <option value="trojan">Trojan (gRPC / TLS)</option>
                    <option value="shadowsocks">Shadowsocks (2022)</option>
                    <option value="tuic">TUIC (v5)</option>
                  </select>
                </div>
              </div>

              {/* Raw Config String */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">رشته کامل کانفیگ (vless://... یا vmess://... یا hy2://...):</label>
                <textarea
                  rows={4}
                  required
                  placeholder="vless://uuid@server:443?security=reality&sni=microsoft.com..."
                  value={configString}
                  onChange={(e) => setConfigString(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono text-left focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">اپراتور سازگار:</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">سازگار با تمام اپراتورها</option>
                    <option value="mci">همراه اول (MCI)</option>
                    <option value="irancell">ایرانسل (MTN)</option>
                    <option value="rightel">رایتل (Rightel)</option>
                    <option value="wifi">وای‌فای / شاتل / مخابرات</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">کشور / پرچم:</label>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="🇩🇪"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">پینگ اولیه (ms):</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={ping}
                    onChange={(e) => setPing(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">نوع امنیت TLS:</label>
                  <input
                    type="text"
                    value={tlsType}
                    onChange={(e) => setTlsType(e.target.value)}
                    placeholder="Reality / TLS 1.3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">موقعیت دیتاسنتر:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="🇩🇪 آلمان - Frankfurt Dedicated"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg"
                >
                  {editingConfig ? 'ذخیره تغییرات کانفیگ' : 'تایید و ذخیره نود'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
