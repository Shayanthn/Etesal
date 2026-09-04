import React, { useState, useEffect } from 'react';
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
  Radio, 
  User, 
  Mail, 
  Copy, 
  Check, 
  Search, 
  RefreshCw,
  Inbox
} from 'lucide-react';
import { 
  createSupportTicket, 
  getUserSubmittedTickets, 
  fetchTicketByCode 
} from '../../services/ticketsService';
import { AdminSupportTicket } from '../../types/admin';

interface SupportPageProps {
  onBackToHome: () => void;
  onShowToast: (toast: { title: string; description: string; type: 'success' | 'info' | 'warning' | 'error' }) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onBackToHome, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'my_tickets' | 'track'>('new');
  
  // New ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'connection' | 'config' | 'app' | 'billing' | 'other'>('connection');
  const [operator, setOperator] = useState<'mci' | 'irancell' | 'rightel' | 'shatel' | 'mokhaberat' | 'other'>('mci');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // My tickets & tracking state
  const [myTickets, setMyTickets] = useState<AdminSupportTicket[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedTicket, setSearchedTicket] = useState<AdminSupportTicket | null | undefined>(undefined);
  const [checkingTicketId, setCheckingTicketId] = useState<string | null>(null);

  useEffect(() => {
    setMyTickets(getUserSubmittedTickets());
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast({
      title: 'کپی شد 📋',
      description: `کد رهگیری ${code} در حافظه کپی شد.`,
      type: 'info'
    });
  };

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

      if (result.success && result.ticket) {
        setSubmittedTicketId(result.ticket.id);
        setMyTickets(getUserSubmittedTickets());
        onShowToast({
          title: `تیکت با موفقیت ثبت شد ✅`,
          description: `کد رهگیری: ${result.ticket.id} - پیام شما با موفقیت در پایگاه داده ثبت شد.`,
          type: 'success'
        });
      } else {
        onShowToast({
          title: 'خطا در ثبت تیکت 🛑',
          description: result.error || 'امکان ثبت در پایگاه داده فراهم نشد.',
          type: 'error'
        });
      }
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

  const handleCheckTicket = async (code: string) => {
    setCheckingTicketId(code);
    try {
      const ticket = await fetchTicketByCode(code);
      if (ticket) {
        setMyTickets(getUserSubmittedTickets());
        if (ticket.replyMessage) {
          onShowToast({
            title: 'پاسخ جدید کارشناس دریافت شد 📬',
            description: `تیکت ${code} توسط پشتیبانی پاسخ داده شده است.`,
            type: 'success'
          });
        } else {
          onShowToast({
            title: 'وضعیت: در انتظار بررسی ⏳',
            description: `تیکت در صف پاسخگویی کارشناسان فنی قرار دارد.`,
            type: 'info'
          });
        }
      } else {
        onShowToast({
          title: 'یافت نشد 🔍',
          description: 'تیکتی با این کد رهگیری در پایگاه داده یافت نشد.',
          type: 'warning'
        });
      }
    } catch {
      onShowToast({
        title: 'خطا در استعلام 🛑',
        description: 'خطا در برقراری ارتباط با پایگاه داده.',
        type: 'error'
      });
    } finally {
      setCheckingTicketId(null);
    }
  };

  const handleSearchByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsSearching(true);
    try {
      const ticket = await fetchTicketByCode(searchCode.trim());
      setSearchedTicket(ticket);
      if (ticket) {
        setMyTickets(getUserSubmittedTickets());
      }
    } catch {
      setSearchedTicket(null);
    } finally {
      setIsSearching(false);
    }
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

      {/* Ticket Center Section with Tabs */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">مرکز تیکت و پیگیری پشتیبانی</h3>
              <p className="text-xs text-slate-400 mt-0.5">ثبت تیکت فنی، استعلام پاسخ‌ها و پیگیری با کد رهگیری اختصاصی</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'new' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ثبت تیکت جدید
            </button>

            <button
              onClick={() => setActiveTab('my_tickets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my_tickets' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>تیکت‌های ارسالی من</span>
              {myTickets.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-400/20 text-purple-300 text-[10px]">
                  {myTickets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'track' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>پیگیری با کد</span>
            </button>
          </div>
        </div>

        {/* TAB 1: NEW TICKET FORM */}
        {activeTab === 'new' && (
          <div>
            {submittedTicketId ? (
              <div className="p-8 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-5 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white">تیکت شما با موفقیت در پایگاه داده ثبت شد</h4>
                  <p className="text-xs text-slate-300">
                    کد رهگیری یکتا و امن تیکت شما:
                  </p>
                  <div className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm mx-auto">
                    <span>{submittedTicketId}</span>
                    <button
                      onClick={() => handleCopyCode(submittedTicketId)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="کپی کد رهگیری"
                    >
                      {copiedId === submittedTicketId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  این تیکت در تاریخچه مرورگر شما ذخیره شده و پس از رفرش صفحه نیز در تب «تیکت‌های ارسالی من» قابل مشاهده و پیگیری لحظه‌ای خواهد بود.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('my_tickets')}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    مشاهده در لیست تیکت‌های من
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    ثبت یک تیکت دیگر
                  </button>
                </div>
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
                    placeholder="مثال: قطعی پورت Reality در اینترنت همراه اول یا سوال درباره اتصال"
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

                {/* Security Note */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>تیکت‌ها بر روی پایگاه داده Supabase رمزنگاری و ثبت می‌گردند. کد رهگیری اختصاصی برای پیگیری بدون نیاز به ورود ارائه خواهد شد.</span>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'در حال ثبت در پایگاه داده...' : 'ارسال تیکت به پشتیبانی'}</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {/* TAB 2: MY TICKETS LIST */}
        {activeTab === 'my_tickets' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {myTickets.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">هنوز تیکتی از این مرورگر ثبت نشده است</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  هر تیکتی که از طریق این صفحه ارسال نمایید به طور خودکار در این بخش ذخیره شده و پاسخ کارشناس در دسترس شما خواهد بود.
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  ثبت تیکت اول
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>تعداد تیکت‌های شما: {myTickets.length} مورد</span>
                  <span>برای دریافت آخرین وضعیت و پاسخ پشتیبانی روی دکمه استعلام کلیک کنید.</span>
                </div>

                {myTickets.map(ticket => {
                  const isAnswered = ticket.status === 'answered' || ticket.status === 'resolved' || Boolean(ticket.replyMessage);
                  const isChecking = checkingTicketId === ticket.id;

                  return (
                    <div 
                      key={ticket.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        isAnswered 
                          ? 'bg-slate-900 border-emerald-500/30' 
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{ticket.subject}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isAnswered 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {isAnswered ? 'پاسخ داده شده ✅' : 'در انتظار بررسی ⏳'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>تاریخ: {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
                            <span>دسته‌بندی: {ticket.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 font-mono text-xs text-purple-300">
                            <span>{ticket.id}</span>
                            <button
                              onClick={() => handleCopyCode(ticket.id)}
                              className="p-1 hover:text-white transition-colors cursor-pointer"
                              title="کپی کد رهگیری"
                            >
                              {copiedId === ticket.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <button
                            onClick={() => handleCheckTicket(ticket.id)}
                            disabled={isChecking}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer disabled:opacity-50"
                            title="استعلام آخرین پاسخ از دیتابیس"
                          >
                            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-purple-400' : ''}`} />
                            <span>{isChecking ? 'استعلام...' : 'استعلام وضعیت'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                        <span className="font-bold text-slate-400 block mb-1">متن تیکت شما:</span>
                        <p className="leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                      </div>

                      {/* Admin Response Area */}
                      {ticket.replyMessage && (
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-emerald-400 font-bold">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4" />
                              پاسخ رسمی کارشناس پشتیبانی
                            </span>
                            {ticket.repliedAt && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(ticket.repliedAt).toLocaleDateString('fa-IR')}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pt-1">{ticket.replyMessage}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRACK BY CODE */}
        {activeTab === 'track' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleSearchByCode} className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">کد رهگیری تیکت را وارد کنید:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={searchCode}
                  onChange={e => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="مثال: TCK-..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                  <span>{isSearching ? 'در حال جستجو...' : 'استعلام'}</span>
                </button>
              </div>
            </form>

            {searchedTicket !== undefined && (
              searchedTicket === null ? (
                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center text-xs text-rose-300">
                  تیکتی با کد رهگیری «{searchCode}» در پایگاه داده یافت نشد. لطفاً کد را مجدداً بررسی نمایید.
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{searchedTicket.subject}</h4>
                      <span className="text-[11px] text-slate-400">کد: {searchedTicket.id}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      searchedTicket.replyMessage || searchedTicket.status === 'answered'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {searchedTicket.replyMessage ? 'پاسخ داده شده ✅' : 'در انتظار بررسی ⏳'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-slate-400 block mb-1">متن ارسالی شما:</span>
                    <p className="whitespace-pre-wrap">{searchedTicket.message}</p>
                  </div>

                  {searchedTicket.replyMessage ? (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
                      <span className="font-bold text-emerald-400 block">پاسخ کارشناس پشتیبانی:</span>
                      <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{searchedTicket.replyMessage}</p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900 text-xs text-amber-300/90 border border-amber-500/20">
                      این تیکت در صف رسیدگی کارشناسان فنی قرار دارد و به زودی پاسخ آن ثبت خواهد شد.
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

      </div>

    </div>
  );
};
