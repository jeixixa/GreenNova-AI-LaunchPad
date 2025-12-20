
import React, { useState } from 'react';
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
  Search,
  Calendar,
  Users,
  Shield,
  Film,
  BarChart3,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isMobileMenuOpen: boolean;
  onLogout: () => void;
  onClose: () => void;
}

type NavItem = {
  id: View;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMobileMenuOpen, onLogout, onClose }) => {
  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { id: View.MASTERCLASS, label: 'The SBL Blueprint', icon: BookOpen },
      ]
    },
    {
      title: 'Content Engine',
      items: [
        { id: View.VIRAL_GENERATOR, label: 'Viral LaunchPad', icon: Sparkles }, 
        { id: View.VIRAL_SEARCH, label: 'Find Viral Content', icon: Search },
        { id: View.VIDEO_REPURPOSER, label: 'Video Repurposer', icon: RefreshCw },
        { id: View.POST_TEMPLATES, label: 'Viral Templates', icon: Copy },
        { id: View.STUDIO_JAMES, label: 'Studio SBL Posts', icon: Star },
      ]
    },
    {
      title: 'Media Lab',
      items: [
        { id: View.VIDEO_MAKER, label: 'Viral Video Maker', icon: Video },
        { id: View.FREE_VIDEO_GENERATOR, label: 'Free Video Gen', icon: Film },
        { id: View.SHORTS_GENERATOR, label: 'Audio Studio', icon: Mic },
        { id: View.IMAGE_GENERATOR, label: 'Image Studio', icon: ImageIcon },
        { id: View.FACE_FUSION, label: 'Face Fusion', icon: Users },
        { id: View.AUTHORITY_GENERATOR, label: 'Authority Studio', icon: Shield },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: View.SAVED_POSTS, label: 'Saved Assets', icon: Bookmark },
        { id: View.SCHEDULER, label: 'Scheduler', icon: Calendar },
      ]
    },
    {
      title: 'System',
      items: [
        { id: View.ADMIN, label: 'Admin', icon: BarChart3 },
        { id: View.ACCOUNT, label: 'Account', icon: User },
        { id: View.SETTINGS, label: 'Settings', icon: Settings },
      ]
    }
  ];

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Overview': true,
    'Content Engine': true,
    'Media Lab': true,
    'Management': true,
    'System': true
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[45] md:hidden transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
        aria-label="Close menu"
      />

      <aside className={`
        fixed inset-y-4 left-4 z-[50] w-72 bg-dark-card rounded-3xl border border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[150%]'}
        md:relative md:translate-x-0 md:inset-y-0 md:left-0 md:my-4 md:ml-4 md:rounded-3xl overflow-hidden
      `}>
        <div className="flex items-center justify-center h-24 shrink-0 border-b border-gray-800/50 mx-4 mb-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center text-brand-500">
              <GreenNovaLogo className="w-10 h-10" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest leading-none mb-0.5">AI-POWERED</span>
              <span className="text-sm font-black text-transparent bg-clip-text bg-brand-gradient leading-none tracking-tight">BUSINESS LAUNCH</span>
              <span className="text-[10px] font-medium text-gray-500 leading-none mt-0.5 tracking-wider uppercase">SYSTEM</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 pb-2 space-y-2 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups[group.title];
            const hasActiveItem = group.items.some(item => item.id === currentView);

            return (
              <div key={group.title} className="space-y-1">
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors
                    ${hasActiveItem ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}
                  `}
                >
                  <span>{group.title}</span>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => {
                      const isActive = currentView === item.id;
                      const Icon = item.icon;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className={`
                            flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                            ${isActive 
                              ? 'bg-gradient-to-r from-brand-900/20 to-brand-900/5 text-brand-400' 
                              : 'text-gray-400 hover:bg-dark-input hover:text-white'}
                          `}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          )}
                          <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 pt-0 border-t border-gray-800 mt-2 shrink-0">
          <button 
            onClick={onLogout}
            title="Logout"
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-400 bg-transparent hover:bg-red-900/10 rounded-xl transition-all border border-gray-800 hover:border-red-900/30 group mt-4"
          >
              <LogOut className="w-4 h-4 mr-2 group-hover:text-red-500 transition-colors" />
              Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
