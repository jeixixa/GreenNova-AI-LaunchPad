
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContentCreator from './components/ContentCreator';
import ImageStudio from './components/ImageStudio';
import AudioStudio from './components/AudioStudio';
import VideoMaker from './components/VideoMaker';
import SavedPosts from './components/SavedPosts';
import PostTemplates from './components/PostTemplates';
import StudioJames from './components/StudioJames';
import LandingPage from './components/LandingPage';
import Account from './components/Account';
import ViralSearch from './components/ViralSearch';
import VideoRepurposer from './components/VideoRepurposer';
import Scheduler from './components/Scheduler';
import Settings from './components/Settings';
import FaceFusion from './components/FaceFusion';
import AuthorityGenerator from './components/AuthorityGenerator';
import FreeVideoGenerator from './components/FreeVideoGenerator';
import AdminDashboard from './components/AdminDashboard';
import Masterclass from './components/Masterclass';
import { View } from './types';
import { Menu, X } from 'lucide-react';

function App() {
  const [showLandingPage, setShowLandingPage] = useState(() => {
      return !localStorage.getItem('sbl_user_email');
  });
  
  const [currentView, setCurrentView] = useState<View>(View.VIRAL_GENERATOR); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('sbl_theme');
          if (saved === 'light' || saved === 'dark') return saved;
      }
      return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sbl_theme', theme);

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true' || params.get('payment_cancel') === 'true') {
        setShowLandingPage(false);
        setCurrentView(View.ACCOUNT);
    }
  }, [theme]);

  const handleLogout = () => {
      localStorage.removeItem('sbl_user_email');
      localStorage.removeItem('sbl_admin_auth');
      setShowLandingPage(true);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard onNavigate={(view) => setCurrentView(view as unknown as View)} />;
      case View.MASTERCLASS:
        return <Masterclass />;
      case View.VIRAL_GENERATOR:
        return <ContentCreator />;
      case View.VIRAL_SEARCH:
        return <ViralSearch onNavigate={(view) => setCurrentView(view)} />;
      case View.VIDEO_REPURPOSER:
        return <VideoRepurposer />;
      case View.SHORTS_GENERATOR:
        return <AudioStudio />;
      case View.VIDEO_MAKER:
        return <VideoMaker />;
      case View.FREE_VIDEO_GENERATOR:
        return <FreeVideoGenerator />;
      case View.AUTHORITY_GENERATOR:
        return <AuthorityGenerator />;
      case View.IMAGE_GENERATOR:
        return <ImageStudio />;
      case View.FACE_FUSION:
        return <FaceFusion />;
      case View.POST_TEMPLATES:
         return <PostTemplates />;
      case View.STUDIO_JAMES:
         return <StudioJames />;
      case View.SAVED_POSTS:
         return <SavedPosts />;
      case View.SCHEDULER:
         return <Scheduler />;
      case View.ADMIN:
         return <AdminDashboard />;
      case View.ACCOUNT:
         return <Account onNavigate={setCurrentView} onLogout={handleLogout} />;
      case View.SETTINGS:
         return <Settings theme={theme} setTheme={setTheme} />;
      default:
        return <ContentCreator />;
    }
  };

  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden font-sans transition-colors duration-200 relative selection:bg-brand-500 selection:text-white">
      
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }} 
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
        
        <header className="md:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 shrink-0 z-40 transition-colors duration-200">
          <span className="font-bold text-gray-900 dark:text-white">AI SBL System</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {renderView()}
        </main>

      </div>
    </div>
  );
}

export default App;
