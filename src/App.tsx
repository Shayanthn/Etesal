import React, { useState, useEffect } from 'react';
import { 
  SAMPLE_CONFIGS, 
  SAMPLE_PROXIES, 
  FAQS_LIST 
} from './data';
import { 
  V2RayConfig, 
  MtprotoProxy, 
  NewsItem, 
  Article, 
  Language, 
  User, 
  ToastMessage 
} from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { NotFoundPage } from './components/NotFoundPage';
import { Header } from './modules/layout/Header';
import { HeroSection } from './modules/layout/HeroSection';
import { CommunityBanner } from './modules/layout/CommunityBanner';
import { MusicHubSection } from './modules/layout/MusicHubSection';
import { FaqSection } from './modules/layout/FaqSection';
import { Footer } from './modules/layout/Footer';
import { LiveConfigBox } from './modules/configs/LiveConfigBox';
import { LiveProxyBox } from './modules/proxies/LiveProxyBox';
import { NewsModal } from './modules/news/NewsModal';
import { ArticlesSection } from './modules/articles/ArticlesSection';
import { ArticleModal } from './modules/articles/ArticleModal';
import { AndroidAppSection } from './modules/android-app/AndroidAppSection';
import { AndroidAppModal } from './modules/android-app/AndroidAppModal';
import { DownloadPage } from './modules/download/DownloadPage';
import { SupportPage } from './modules/support/SupportPage';
import { NewsHub } from './modules/news/NewsHub';
import { NewsDetailPage } from './modules/news/NewsDetailPage';
import { ArticleDetailPage } from './modules/articles/ArticleDetailPage';
import { AuthModal } from './modules/auth/AuthModal';
import { UpdatePasswordModal } from './modules/auth/UpdatePasswordModal';
import { Suspense, lazy } from 'react';
const UserDashboard = lazy(() => import('./modules/dashboard/UserDashboard').then(m => ({ default: m.UserDashboard })));
const MasterAdminDashboard = lazy(() => import('./modules/admin/MasterAdminDashboard').then(m => ({ default: m.MasterAdminDashboard })));
import { AdminRouteGuard } from './components/auth/AdminRouteGuard';
import { ToastContainer } from './modules/feedback/ToastContainer';
import { NewsArticle } from './types/news';
import { getSavedLocalSession, logoutUser, saveLocalSession, syncSessionWithSupabase } from './services/authService';
import { fetchArticleBySlug, fetchArticles, fetchNews } from './services/contentService';
import { fetchLiveConfigs, fetchLiveProxies } from './services/configDbService';
import { runBatchEdgePing } from './services/edgePingService';

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('fa');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'download' | 'support' | 'news' | 'admin' | '404' | 'article'>('home');
  const [activeNewsArticle, setActiveNewsArticle] = useState<NewsArticle | null>(null);
  const [activeArticleData, setActiveArticleData] = useState<any | null>(null);
  const [configs, setConfigs] = useState<V2RayConfig[]>([]);
  const [proxies, setProxies] = useState<MtprotoProxy[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isTestingPing, setIsTestingPing] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Modals state
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.durationMs || 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // 1. Initial Auth Restore
    let initialUser = getSavedLocalSession();
    if (initialUser) {
      setCurrentUser(initialUser);
    }
    
    // 2. Sync with Supabase Auth state (especially for OAuth like Google)
    const unsubscribeSync = syncSessionWithSupabase(
      (user) => setCurrentUser(user),
      () => setIsUpdatePasswordModalOpen(true)
    );

    // 2.5 Fetch initial dynamic data
    Promise.all([
      fetchLiveConfigs(),
      fetchLiveProxies(),
      fetchArticles(),
      fetchNews()
    ]).then(([c, p, a, n]) => {
      if (c && c.length) setConfigs(c);
      if (p && p.length) setProxies(p);
      if (a && a.length) setArticles(a as any);
      if (n && n.length) setNews(n as any);
    });

    // 3. Check initial pathname for standard SEO routing
    const path = window.location.pathname;
    if (path !== '/' && path !== '') {
      if (path === '/dashboard') {
        if (initialUser) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('home');
        }
      } else if (path === '/download' || path === '/downloads') {
        setCurrentView('download');
      } else if (path === '/support' || path === '/ticket' || path === '/tickets') {
        setCurrentView('support');
      } else if (path === '/admin' || path === '/master-admin') {
        setCurrentView('admin');
      } else if (path === '/news' || path.startsWith('/news/')) {
        setCurrentView('news');
        if (path.startsWith('/news/')) {
          const slug = path.replace('/news/', '').trim();
          fetchNews().then(n => {
            const found = n.find((a: any) => a.slug === slug);
            if (found) setActiveNewsArticle(found);
          });
        }
      } else if (path.startsWith('/article/')) {
        const slug = path.replace('/article/', '').trim();
        setCurrentView('article');
        fetchArticleBySlug(slug).then(data => {
          if (data) setActiveArticleData(data);
        });
      } else {
        // Any unknown or invalid route triggers standard 404
        setCurrentView('404');
      }
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const u = getSavedLocalSession();
      if (currentPath === '/' || currentPath === '') {
        setCurrentView('home');
      } else if (currentPath === '/dashboard') {
        setCurrentView(u ? 'dashboard' : 'home');
      } else if (currentPath === '/download' || currentPath === '/downloads') {
        setCurrentView('download');
      } else if (currentPath === '/support' || currentPath === '/ticket' || currentPath === '/tickets') {
        setCurrentView('support');
      } else if (currentPath === '/admin' || currentPath === '/master-admin') {
        setCurrentView('admin');
      } else if (currentPath === '/news' || currentPath.startsWith('/news/')) {
        setCurrentView('news');
        if (currentPath.startsWith('/news/')) {
          const slug = currentPath.replace('/news/', '').trim();
          fetchNews().then(n => {
            const found = n.find((a: any) => a.slug === slug);
            if (found) {
              setActiveNewsArticle(found);
            } else {
              setActiveNewsArticle(null);
            }
          });
        } else {
          setActiveNewsArticle(null);
        }
      } else if (currentPath.startsWith('/article/')) {
        const slug = currentPath.replace('/article/', '').trim();
        setCurrentView('article');
        fetchArticleBySlug(slug).then(data => {
          if (data) setActiveArticleData(data);
        });
      } else {
        setCurrentView('404');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial smooth entrance
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
      unsubscribeSync();
    };
  }, []); // Run ONCE on mount

  // SPA Technical SEO: Synchronize document title and URL on view change
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'اتصال | Etesal Hub - پورتال هوشمند ارتباطات ابری و کانفیگ‌های تست‌شده شبکه',
      download: 'دانلود اپلیکیشن اتصال | Etesal Hub - نسخه اختصاصی اندروید v6.0.0',
      support: 'مرکز پشتیبانی، راهنمای فنی و تیکت آنلاین | Etesal Hub',
      news: 'اخبار و پایش وضعیت لحظه‌ای شبکه اینترنت | Etesal Hub',
      dashboard: 'داشبورد کاربری و اشتراک اختصاصی | Etesal Hub',
      admin: 'پنل مدیریت ارشد و مرکز کنترل فنی | Etesal Hub',
      '404': 'صفحه یافت نشد (404) | Etesal Hub'
    };

    if (currentView !== 'article') {
      const pageTitle = titles[currentView] || 'اتصال | Etesal Hub';
      document.title = pageTitle;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        if (currentView === 'download') {
          metaDesc.setAttribute('content', 'دانلود آخرین نسخه اپلیکیشن اندروید اتصال (Etesal Hub) با قابلیت تست خودکار پینگ، سوییچ سرور و اتصال هوشمند.');
        } else if (currentView === 'support') {
          metaDesc.setAttribute('content', 'مرکز پشتیبانی فنی و سوالات متداول اتصال. پاسخگویی و رفع اشکال اتصال اینترنت، پروتکل‌های امن و بررسی آنلاین وضعیت تیکت.');
        } else if (currentView === 'news') {
          metaDesc.setAttribute('content', 'آخرین اخبار، گزارش‌های اختلالات اینترنت کشور و تحلیل وضعیت شبکه همراه اول و ایرانسل در پایگاه خبری اتصال.');
        }
      }
    }
  }, [currentView]);

  const handleRefreshPing = async () => {
    setIsTestingPing(true);
    try {
      const currentConfigs = configs.length ? configs : await fetchLiveConfigs();
      const currentProxies = proxies.length ? proxies : await fetchLiveProxies();

      const { updatedConfigs, updatedProxies } = await runBatchEdgePing(currentConfigs, currentProxies);
      if (updatedConfigs && updatedConfigs.length) setConfigs(updatedConfigs);
      if (updatedProxies && updatedProxies.length) setProxies(updatedProxies);

      addToast({
        title: 'بروزرسانی پینگ زنده انجام شد 📶',
        description: 'تاخیر واقعی گیت‌وی‌ها و وضعیت سوکت سرورها با موفقیت سنجیده شد و مقادیر بروزرسانی شدند.',
        type: 'info'
      });
    } catch {
      addToast({
        title: 'خطا در اتصال به لبه 🛑',
        description: 'بررسی سلامت با خطای موقت مواجه شد؛ مقادیر کش محلی نگهداری شدند.',
        type: 'error'
      });
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'fa' ? 'en' : 'fa'));
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    saveLocalSession(user);
    window.history.pushState({}, '', '/dashboard');
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentView('home');
    addToast({
      title: 'خروج از حساب کاربری 🔒',
      description: 'سشن شما با موفقیت و امنیت بسته شد.',
      type: 'info'
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // 404 View
  if (currentView === '404') {
    return (
      <div className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
        <Header
          language={language}
          currentUser={currentUser}
          currentView={currentView}
          onToggleLanguage={handleToggleLanguage}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onNavigate={view => setCurrentView(view)}
        />
        <NotFoundPage onGoHome={() => {
          window.history.pushState({}, '', '/');
          setCurrentView('home');
        }} />
        <Footer />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      
      {/* Top Header Navigation */}
      <Header
        language={language}
        currentUser={currentUser}
        currentView={currentView}
        onToggleLanguage={handleToggleLanguage}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onNavigate={view => {
          if (view === 'home') {
            window.history.pushState({}, '', '/');
            setCurrentView('home');
          } else if (view === 'download') {
            window.history.pushState({}, '', '/download');
            setCurrentView('download');
          } else if (view === 'support') {
            window.history.pushState({}, '', '/support');
            setCurrentView('support');
          } else if (view === 'admin') {
            window.history.pushState({}, '', '/admin');
            setCurrentView('admin');
          } else if (view === 'news') {
            window.history.pushState({}, '', '/news');
            setActiveNewsArticle(null);
            setCurrentView('news');
          } else if (view === 'dashboard') {
            window.history.pushState({}, '', '/dashboard');
            setCurrentView(currentUser ? 'dashboard' : 'home');
          } else {
            window.history.pushState({}, '', '/404');
            setCurrentView('404');
          }
        }}
      />

      {/* View Routing: Dashboard vs Download vs Support vs News vs Admin vs Home */}
      {currentView === 'dashboard' && currentUser ? (
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-4 dir-rtl"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <UserDashboard
              user={currentUser}
              onLogout={handleLogout}
              onBackToHome={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('home');
              }}
              onShowToast={addToast}
              onUpdateUser={(updatedUser) => {
                setCurrentUser(updatedUser);
                saveLocalSession(updatedUser);
              }}
            />
          </Suspense>
        </main>
      ) : currentView === 'admin' ? (
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          <AdminRouteGuard
            onAccessDenied={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('home');
              addToast({
                title: 'دسترسی غیرمجاز 🛑',
                description: 'ورود به پنل مدیریت نیازمند سشن معتبر است.',
                type: 'error'
              });
            }}
          >
            <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dir-rtl relative"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <MasterAdminDashboard
                onShowToast={addToast}
                onExitAdmin={() => {
                  window.history.pushState({}, '', '/');
                  setCurrentView('home');
                }}
              />
            </Suspense>
          </AdminRouteGuard>
        </main>
      ) : currentView === 'download' ? (
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          <DownloadPage
            onBackToHome={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('home');
            }}
            onShowToast={addToast}
          />
        </main>
      ) : currentView === 'support' ? (
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          <SupportPage
            onBackToHome={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('home');
            }}
            onShowToast={addToast}
          />
        </main>
      ) : currentView === 'news' ? (
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          {activeNewsArticle ? (
            <NewsDetailPage
              article={activeNewsArticle}
              onBackToNews={() => {
                window.history.pushState({}, '', '/news');
                setActiveNewsArticle(null);
              }}
              onSelectOtherArticle={(art) => {
                window.history.pushState({}, '', `/news/${art.slug}`);
                setActiveNewsArticle(art);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={addToast}
            />
          ) : (
            <NewsHub
              onSelectArticle={(art) => {
                window.history.pushState({}, '', `/news/${art.slug}`);
                setActiveNewsArticle(art);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToHome={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('home');
              }}
              onShowToast={addToast}
            />
          )}
        </main>
      ) : currentView === 'article' && activeArticleData ? (
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          <ArticleDetailPage 
            article={activeArticleData}
            onBackToArticles={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={addToast}
          />
        </main>
      ) : currentView === 'article' && !activeArticleData ? (
        <main className="container mx-auto px-4 py-20 max-w-6xl text-center space-y-4">
          <div className="text-purple-400 font-bold">در حال بارگذاری مقاله یا مقاله یافت نشد...</div>
          <button onClick={() => {
            window.history.pushState({}, '', '/');
            setCurrentView('home');
          }} className="text-slate-400 hover:text-white underline">بازگشت به صفحه اصلی</button>
        </main>
      ) : (
        /* Main Home Content Layout */
        <main className="container mx-auto px-4 max-w-6xl space-y-4">
          
          {/* Hero Banner Section with Side-by-Side 10 Tech News Box */}
          <HeroSection 
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onNavigateToDownload={() => {
              window.history.pushState({}, '', '/download');
              setCurrentView('download');
            }}
            onNavigateToNewsHub={() => {
              window.history.pushState({}, '', '/news');
              setActiveNewsArticle(null);
              setCurrentView('news');
            }}
            news={news}
            onSelectNews={item => setSelectedNews(item)}
          />

          {/* Interactive Android App & Sing-Box Core Simulator */}
          <AndroidAppSection
            configs={configs}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onNavigateToDownload={() => {
              window.history.pushState({}, '', '/download');
              setCurrentView('download');
            }}
          />

          {/* Live V2Ray / Reality Configs Module */}
          <LiveConfigBox
            configs={configs}
            onRefreshPing={handleRefreshPing}
            isTestingPing={isTestingPing}
          />

          {/* Live 1-Click Telegram Proxies Module */}
          <LiveProxyBox
            proxies={proxies}
            onRefreshPing={handleRefreshPing}
            isTestingPing={isTestingPing}
          />

          {/* Technical SEO & Knowledge Base Articles */}
          <ArticlesSection
            articles={articles}
            onSelectArticle={art => {
              const slug = (art as any).slug || art.id;
              window.history.pushState({}, '', `/article/${slug}`);
              setCurrentView('article');
              fetchArticleBySlug(slug).then(data => {
                if (data) setActiveArticleData(data);
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Music Hub & Radio Player */}
          <MusicHubSection onShowToast={addToast} />

          {/* Telegram Community & VIP Hub Banner */}
          <CommunityBanner />

          {/* Frequently Asked Questions */}
          <FaqSection faqs={FAQS_LIST} />

        </main>
      )}

      {/* Footer */}
      <Footer 
        onNavigate={view => {
          if (view === 'home') {
            window.history.pushState({}, '', '/');
            setCurrentView('home');
          } else if (view === 'download') {
            window.history.pushState({}, '', '/download');
            setCurrentView('download');
          } else if (view === 'support') {
            window.history.pushState({}, '', '/support');
            setCurrentView('support');
          } else if (view === 'admin') {
            window.history.pushState({}, '', '/admin');
            setCurrentView('admin');
          } else if (view === 'news') {
            window.history.pushState({}, '', '/news');
            setActiveNewsArticle(null);
            setCurrentView('news');
          } else if (view === 'dashboard') {
            window.history.pushState({}, '', '/dashboard');
            setCurrentView(currentUser ? 'dashboard' : 'home');
          } else {
            window.history.pushState({}, '', '/404');
            setCurrentView('404');
          }
        }}
      />

      {/* Interactive Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessAuth={handleAuthSuccess}
        onShowToast={addToast}
      />
      
      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => setIsUpdatePasswordModalOpen(false)}
        onShowToast={addToast}
      />

      <AndroidAppModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        onOpenDownloadPage={() => {
          window.history.pushState({}, '', '/download');
          setCurrentView('download');
        }}
      />

      <NewsModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Interactive Toast Notifications System */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />

    </div>
  );
};
