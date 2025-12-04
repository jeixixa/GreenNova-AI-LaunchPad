import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  Video, 
  Copy, 
  Bookmark, 
  User, 
  Sparkles,
  Settings,
  Star,
  Mic,
  LogOut,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isMobileMenuOpen: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMobileMenuOpen, onLogout }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.VIRAL_GENERATOR, label: 'Viral LaunchPad', icon: Sparkles }, 
    { id: View.VIRAL_SEARCH, label: 'Find Viral Content', icon: Search },
    { id: View.SHORTS_GENERATOR, label: 'Audio Studio', icon: Mic },
    { id: View.POST_TEMPLATES, label: 'Viral Templates', icon: Copy },
    { id: View.STUDIO_JAMES, label: 'Studio James Posts', icon: Star },
    { id: View.VIDEO_MAKER, label: 'Viral Video Maker', icon: Video },
    { id: View.IMAGE_GENERATOR, label: 'Image Studio', icon: ImageIcon },
    { id: View.SAVED_POSTS, label: 'Saved Assets', icon: Bookmark },
    { id: View.ACCOUNT, label: 'My Account', icon: User },
    { id: View.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-4 left-4 z-50 w-72 bg-dark-card rounded-3xl border border-gray-800 shadow-premium transform transition-all duration-300 ease-in-out flex flex-col
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[110%]'}
      md:relative md:translate-x-0 md:inset-y-0 md:left-0 md:my-4 md:ml-4 md:rounded-3xl
    `}>
      <div className="flex items-center justify-center h-24 shrink-0 border-b border-gray-800/50 mx-4 mb-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center text-brand-500">
            <GreenNovaLogo className="w-10 h-10" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-bold text-transparent bg-clip-text bg-brand-gradient leading-none tracking-tight">GREENNOVA AI</span>
            <span className="text-sm font-medium text-brand-500 leading-none mt-1">LaunchPad</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 pb-2 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Main Menu</p>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`
                flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 mb-1 group relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow translate-x-1' 
                  : 'text-gray-400 hover:bg-dark-input hover:text-white hover:translate-x-1 hover:shadow-glow-sm'}
              `}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
              <span className="truncate tracking-wide relative z-10">{item.label}</span>
              {isActive && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 pt-0 border-t border-gray-800 mt-2 shrink-0">
        <button 
          onClick={onLogout}
          title="Logout"
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-300 hover:text-white bg-dark-input hover:bg-red-900/30 rounded-2xl transition-all border border-transparent hover:border-red-900/50 group"
        >
            <LogOut className="w-4 h-4 mr-2 group-hover:text-red-500 transition-colors" />
            Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;