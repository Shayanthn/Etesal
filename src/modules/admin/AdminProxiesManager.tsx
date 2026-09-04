import React, { useState } from 'react';
import { 
  Radio, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  Copy, 
  X, 
  Zap, 
  Send,
  Sparkles
} from 'lucide-react';
import { MtprotoProxy } from '../../types';

interface AdminProxiesManagerProps {
  proxiesList: MtprotoProxy[];
  setProxiesList: React.Dispatch<React.SetStateAction<MtprotoProxy[]>>;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
  onOpenIngestionModal?: () => void;
}

export const AdminProxiesManager: React.FC<AdminProxiesManagerProps> = ({
  proxiesList,
  setProxiesList,
  onShowToast,
  onOpenIngestionModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<MtprotoProxy | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(443);
  const [secret, setSecret] = useState('');
  const [flag, setFlag] = useState('🇩🇪');
  const [location, setLocation] = useState('🇩🇪 فرانکفورت - آلمان');
  const [ping, setPing] = useState(38);
  const [sponsorChannel, setSponsorChannel] = useState('@vpnbuying');
  const [isVip, setIsVip] = useState(false);

  const handleOpenAdd = () => {
    setEditingProxy(null);
    setName('');
    setHost('');
    setPort(443);
    setSecret('ee' + Math.random().toString(36).substring(2, 15) + '7777772e6d6963726f736f66742e636f6d');
    setFlag('🇩🇪');
    setLocation('🇩🇪 فرانکفورت - آلمان');
    setPing(35);
    setSponsorChannel('@vpnbuying');
    setIsVip(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proxy: MtprotoProxy) => {
    setEditingProxy(proxy);
    setName(proxy.name);
    setHost(proxy.host);
    setPort(proxy.port);
    setSecret(proxy.secret);
    setFlag(proxy.flag);
    setLocation(proxy.location);
    setPing(proxy.ping);
    setSponsorChannel(proxy.sponsorChannel || '@vpnbuying');
    setIsVip(proxy.isVip || false);
    setIsModalOpen(true);
  };

  const handleCopyLink = (p: MtprotoProxy) => {
    const tgUrl = `tg://proxy?server=${p.host}&port=${p.port}&secret=${p.secret}`;
    navigator.clipboard.writeText(tgUrl);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast({
      title: 'لینک پروکسی کپی شد 📋',
      description: 'لینک اتصال مستقیم تلگرام در حافظه ذخیره گردید.',
      type: 'success'
    });
  };

  const handleDelete = (id: string) => {
    setProxiesList(prev => prev.filter(p => p.id !== id));
    onShowToast({
      title: 'پروکسی حذف شد 🗑️',
      description: 'پروکسی از دیتابیس و کلاینت‌ها حذف گردید.',
      type: 'info'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim() || !secret.trim()) {
      onShowToast({
        title: 'خطا',
        description: 'لطفاً هاست سرور و سکرت را وارد نمایید.',
        type: 'error'
      });
      return;
    }

    if (editingProxy) {
      // Update
      setProxiesList(prev => prev.map(p => {
        if (p.id === editingProxy.id) {
          return {
            ...p,
            name: name.trim() || p.name,
            host: host.trim(),
            port: Number(port) || 443,
            secret: secret.trim(),
            flag,
            location,
            ping: Number(ping) || 40,
            sponsorChannel: sponsorChannel.trim(),
            isVip,
            verifiedAt: 'لحظاتی پیش'
          };
        }
        return p;
      }));

      onShowToast({
        title: 'پروکسی ویرایش شد ⚙️',
        description: `تغییرات پروکسی ${name || editingProxy.name} ذخیره شد.`,
        type: 'success'
      });
    } else {
      // Create
      const newProxy: MtprotoProxy = {
        id: 'proxy-' + Date.now(),
        name: name.trim() || `⚡ ${flag} پروکسی سریع TLS`,
        host: host.trim(),
        port: Number(port) || 443,
        secret: secret.trim(),
        ping: Number(ping) || 35,
        location,
        flag,
        verifiedAt: 'لحظاتی پیش',
        sponsorChannel: sponsorChannel.trim(),
        isVip
      };

      setProxiesList(prev => [newProxy, ...prev]);
      onShowToast({
        title: 'پروکسی جدید اضافه شد 📡',
        description: `پروکسی ${newProxy.name} برای اتصال ۱-کلیک فعال گردید.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>پروکسی‌های MTProto تلگرام ({proxiesList.length} پروکسی فعال)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            افزودن و ویرایش سرورهای Fake-TLS و اتصال مستقیم کاربران در تلگرام.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenIngestionModal && (
            <button
              onClick={onOpenIngestionModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ استخراج و تست سلامت پروکسی</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن پروکسی MTProto جدید</span>
          </button>
        </div>
      </div>

      {/* Proxies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proxiesList.map((p) => (
          <div key={p.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.flag}</span>
                  <span className="text-xs font-bold text-white">{p.name}</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">{p.ping}ms</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-cyan-300 break-all text-left dir-ltr border border-slate-800/80">
                {p.host}:{p.port}
              </div>

              <div className="text-[10px] text-slate-500 font-mono truncate dir-ltr text-left">
                Secret: {p.secret.slice(0, 18)}...
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <a
                  href={`tg://proxy?server=${p.host}&port=${p.port}&secret=${p.secret}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>تست در تلگرام</span>
                </a>

                <button
                  onClick={() => handleCopyLink(p)}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="کپی لینک پروکسی"
                >
                  {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors"
                  title="ویرایش پروکسی"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                  title="حذف پروکسی"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-cyan-500/40 p-5 sm:p-6 shadow-2xl space-y-4 text-right my-4 sm:my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>{editingProxy ? 'ویرایش پروکسی MTProto' : 'افزودن پروکسی تلگرام جدید'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">نام نمایشی پروکسی:</label>
                <input
                  type="text"
                  placeholder="مثال: 🇩🇪 پروکسی اختصاصی آلمان"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">هاست / دامنه یا آی‌پی (Host/IP):</label>
                  <input
                    type="text"
                    required
                    placeholder="fra.proxy.domain.com"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">پورت (Port):</label>
                  <input
                    type="number"
                    min={1}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">سکرت رمزنگاری (Secret / Fake TLS Hex):</label>
                <input
                  type="text"
                  required
                  placeholder="ee... یا سکرت ۳۲ کاراکتری هگز"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">پرچم / کشور:</label>
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

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">کانال اسپانسر:</label>
                  <input
                    type="text"
                    value={sponsorChannel}
                    onChange={(e) => setSponsorChannel(e.target.value)}
                    placeholder="@vpnbuying"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono text-left"
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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg"
                >
                  {editingProxy ? 'ذخیره تغییرات پروکسی' : 'ثبت و انتشار پروکسی'}
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
