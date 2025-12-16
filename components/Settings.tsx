
import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your Sustainable Business Launch System experience.</p>
      </div>
      <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm dark:shadow-premium border border-gray-200 dark:border-gray-800 space-y-8">
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    Appearance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Switch between light and dark themes.</p>
            </div>
            
            <button 
                onClick={toggleTheme}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out relative focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-300'}`}
                aria-label="Toggle Dark Mode"
            >
                <div 
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
                />
            </button>
        </div>

        {/* Default Platform */}
        <div>
            <label className="block text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2">Default Platform</label>
            <select className="w-full bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none transition-colors">
                <option>Instagram</option>
                <option>YouTube Shorts</option>
                <option>TikTok</option>
                <option>LinkedIn</option>
                <option>X (Twitter)</option>
            </select>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">SBL System v2.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
