import React, { useState } from 'react';
import { 
  Send, 
  Menu, 
  X, 
  ShieldCheck, 
  BookOpen, 
  LogIn,
  LayoutDashboard,
  Sparkles,
  Headphones,
  ShieldAlert
} from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { Language, User } from '../../types';

interface HeaderProps {
  language: Language;
  currentUser: User | null;
  currentView: 'home' | 'dashboard' | 'download' | 'support' | 'news' | 'admin' | '404' | 'article';
  onToggleLanguage: () => void;
  onOpenApkModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onNavigate: (view: 'home' | 'dashboard' | 'download' | 'support' | 'news' | 'admin' | '404' | 'article') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  onOpenAuthModal,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080a0f]/85 border-b border-slate-800/80">
      <div className="container mx-auto px-4 max-w-6xl h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & View Switcher */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 text-right cursor-pointer"
          >
            <BrandLogo size="md" />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigate('download')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'download' ? 'text-purple-400 font-bold' : 'hover:text-purple-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>دانلود اپلیکیشن</span>
          </button>

          <button
            onClick={() => onNavigate('news')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'news' ? 'text-purple-400 font-bold' : 'hover:text-purple-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>اخبار و رصد شبکه</span>
          </button>

          <button
            onClick={() => onNavigate('support')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'support' ? 'text-purple-400 font-bold' : 'hover:text-purple-400'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-purple-400" />
            <span>پشتیبانی و تیکت</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
              currentView === 'admin'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950/50'
                : 'text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/40 font-bold'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>مدیریت کل (Admin)</span>
          </button>
          
          {currentView === 'home' && (
            <>
              <a href="#configs" className="hover:text-purple-400 transition-colors">
                <span>کانفیگ‌های V2Ray</span>
              </a>
              <a href="#articles" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>پایگاه دانش</span>
              </a>
              <a href="#faqs" className="hover:text-purple-400 transition-colors">
                <span>سوالات متداول</span>
              </a>
            </>
          )}
        </nav>

        {/* Action Buttons & Auth Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* If Logged In: Show User Profile Pill */}
          {currentUser ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-purple-500/40 text-slate-200'
              }`}
            >
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                alt={currentUser.name}
                className="w-7 h-7 rounded-xl bg-slate-950 p-0.5 border border-purple-400/40 object-cover"
              />
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-purple-300 font-mono">پنل کاربری VIP</div>
              </div>
              <LayoutDashboard className="w-4 h-4 text-purple-300" />
            </button>
          ) : (
            // If Not Logged In: Show Login / Register buttons
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>ورود</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('register')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>ثبت‌نام VIP</span>
              </button>
            </div>
          )}

          {/* Telegram Channel CTA */}
          <a
            href="https://t.me/vpnbuying"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>@vpnbuying</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-slate-900 border-b border-slate-800 space-y-3 animate-fade-in text-sm font-medium">
          {currentUser ? (
            <button
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-white font-bold"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>داشبورد کاربری {currentUser.name}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600">VIP</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold text-center"
              >
                ورود به حساب
              </button>
              <button
                onClick={() => { onOpenAuthModal('register'); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold text-center"
              >
                ثبت‌نام جدید
              </button>
            </div>
          )}

          <button
            onClick={() => { onNavigate('download'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-xs text-right cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>دانلود اپلیکیشن اختصاصی</span>
          </button>

          <button
            onClick={() => { onNavigate('news'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-xs text-right cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>اخبار و رصدخانه شبکه</span>
          </button>

          <button
            onClick={() => { onNavigate('support'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-xs text-right cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-purple-400" />
            <span>پشتیبانی و ثبت تیکت</span>
          </button>

          <button
            onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold text-right cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>داشبورد مدیریت کل (Master Admin)</span>
          </button>
          <a
            href="#articles"
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-xs"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>پایگاه دانش</span>
          </a>
          <a
            href="#faqs"
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 text-xs"
          >
            <span>سوالات متداول</span>
          </a>
        </div>
      )}
    </header>
  );
};
