import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Send, 
  Headphones, 
  ShieldCheck, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle,
  Paperclip,
  Radio,
  FileText,
  User,
  Mail,
  Zap
} from 'lucide-react';
import { createSupportTicket } from '../../services/ticketsService';

interface SupportPageProps {
  onBackToHome: () => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onBackToHome, onShowToast }) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'connection' | 'config' | 'app' | 'billing' | 'other'>('connection');
  const [operator, setOperator] = useState<'mci' | 'irancell' | 'rightel' | 'shatel' | 'mokhaberat' | 'other'>('mci');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketSubject.trim() || !message.trim()) {
      onShowToast({
        title: 'تکمیل فیلدهای اجباری',
        description: 'لطفاً عنوان و متن پیام تیکت را وارد نمایید.',
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSupportTicket({
        subject: ticketSubject,
        category: ticketCategory,
        operator: operator,
        userName: userName.trim() || 'کاربر مهمان اتصال',
        userEmail: userEmail.trim() || undefined,
        telegramUsername: telegramUsername.trim() || undefined,
        message: message.trim()
      });

      const generatedTicketId = result.ticket?.id || `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicketId(generatedTicketId);

      onShowToast({
        title: `تیکت با موفقیت ثبت شد ✅`,
        description: `کد رهگیری: ${generatedTicketId} - پیام شما به پایگاه داده و تیم فنی ارسال گردید.`,
        type: 'success'
      });
    } catch {
      onShowToast({
        title: 'خطا در ثبت تیکت 🛑',
        description: 'امکان برقراری ارتباط با سرور فراهم نشد. لطفاً مجدداً تلاش نمایید.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicketId(null);
    setTicketSubject('');
    setMessage('');
    setTelegramUsername('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right py-4 max-w-4xl mx-auto">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Top Breadcrumb */}
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
          <span>پشتیبانی آنلاین و پاسخگویی فعال</span>
        </div>
      </div>

      {/* Support Direct Channels Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Telegram Direct Support */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              پاسخگویی سریع
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">پشتیبانی آنلاین و مستقیم در تلگرام</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              برای ارتباط فوری، دریافت راهنمایی رفع اختلال و دریافت آخرین کانفیگ‌های پایدار به ادمین پشتیبانی پیام دهید.
            </p>
          </div>

          <a
            href="https://t.me/NetWithoutBorders"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>ارتباط مستقیم در تلگرام (@NetWithoutBorders)</span>
          </a>
        </div>

        {/* Telegram Community Channel */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-cyan-900/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
              اطلاع‌رسانی اختلالات
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">کانال رسمی جامعه و وضعیت شبکه</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              عضویت در کانال رسمی جهت اطلاع از فیلترشدن آی‌پی‌ها، انتشار نسخه‌های جدید اپلیکیشن و کانفیگ‌های اضطراری.
            </p>
          </div>

          <a
            href="https://t.me/vpnbuying"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-cyan-400" />
            <span>عضویت در کانال اطلاع‌رسانی (@vpnbuying)</span>
          </a>
        </div>

      </div>

      {/* Ticket Form Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">فرم ثبت تیکت و گزارش اختلال</h3>
              <p className="text-xs text-slate-400 mt-0.5">درخواست یا گزارش فنی خود را بنویسید؛ کارشناسان ما بررسی و اقدام خواهند کرد.</p>
            </div>
          </div>
        </div>

        {submittedTicketId ? (
          <div className="p-8 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">تیکت شما با موفقیت دریافت و ثبت شد</h4>
              <p className="text-xs text-slate-300">
                کد رهگیری تیکت: <span className="font-mono font-bold text-emerald-400 text-sm px-2 py-1 rounded bg-slate-900 border border-emerald-500/30 mx-1">{submittedTicketId}</span>
              </p>
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              پاسخ کارشناسان فنی در سریع‌ترین زمان ممکن از طریق تلگرام یا ایمیل به شما اطلاع‌رسانی خواهد شد.
            </p>
            <button
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              ثبت یک تیکت جدید
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Category & Operator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">دسته‌بندی موضوع</label>
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="connection">مشکل در اتصال / قطعی شبکه</option>
                  <option value="config">درخواست کانفیگ اختصاصی یا ارتقا</option>
                  <option value="app">مشکل در اپلیکیشن اندروید یا کلاینت‌ها</option>
                  <option value="billing">مسائل مالی و حساب کاربری</option>
                  <option value="other">سایر موضوعات و پیشنهادات</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">اپراتور اینترنت شما</label>
                <select
                  value={operator}
                  onChange={e => setOperator(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="mci">همراه اول (MCI)</option>
                  <option value="irancell">ایرانسل (MTN Irancell)</option>
                  <option value="rightel">رایتل (Rightel)</option>
                  <option value="shatel">شاتل / های‌وب / پارس‌آنلاین</option>
                  <option value="mokhaberat">مخابرات / اینترنت فیبر نوری</option>
                  <option value="other">سایر ارائه‌دهندگان اینترنت</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">عنوان تیکت *</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                placeholder="مثال: قطعی پورت Reality در اینترنت همراه اول یا سوال درباره Sing-Box"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Contact Info (Name, Email, Telegram) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">نام یا نام مستعار</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="نام شما"
                    className="w-full pr-8 pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">ایمیل جهت دریافت پاسخ</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pr-8 pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">آیدی تلگرام شما</label>
                <div className="relative">
                  <Send className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={e => setTelegramUsername(e.target.value)}
                    placeholder="@YourUsername"
                    className="w-full pr-8 pl-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">شرح پیام یا گزارش خطا *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="توضیحات تکمیلی، لاگ خطا یا سوال خود را اینجا بنویسید..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
            </div>

            {/* Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>پایانه ارتباطی و وب‌هوک تیکت‌ها به زودی به مرکز عملیات شبکه متصل خواهد شد و هیچ داده‌ای در سرورهای ناامن ذخیره نمی‌شود.</span>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال پردازش و ثبت...' : 'ارسال تیکت به پشتیبانی'}</span>
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
};
