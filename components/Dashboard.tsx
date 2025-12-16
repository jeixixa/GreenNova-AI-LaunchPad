
import React from 'react';
import { View } from '../types';
import { Zap, Users, Eye, MousePointer, Sparkles, ArrowUpRight, Mic, Image as ImageIcon, Youtube } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.FC<any> }> = ({ title, value, trend, icon: Icon }) => (
  <div className="bg-dark-card p-6 rounded-3xl border border-gray-800 shadow-premium hover:border-gray-700 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-dark-input rounded-2xl group-hover:bg-brand-900/30 transition-colors">
        <Icon className="w-6 h-6 text-brand-500" />
      </div>
      <span className="text-xs font-bold text-brand-400 bg-brand-900/20 px-3 py-1.5 rounded-full flex items-center border border-brand-900/30">
        {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
      </span>
    </div>
    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-3xl font-black text-white">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto py-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Welcome to your LaunchPad</h1>
          <p className="text-gray-400 mt-2 text-lg">Ready to grow your sustainable business with the SBL System?</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 h-full">
            <button 
              onClick={() => onNavigate(View.VIRAL_GENERATOR)}
              className="bg-brand-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-800 border-2 border-brand-700 transition-all flex items-center justify-center shadow-brand-900/20 hover:shadow-glow-lg hover:-translate-y-0.5 h-full min-h-[60px]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Viral Post
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Viral Reach" value="2.4M" trend="+12%" icon={Eye} />
        <StatCard title="Community" value="12.8K" trend="+5%" icon={Users} />
        <StatCard title="Link Clicks" value="845" trend="+24%" icon={MousePointer} />
        <StatCard title="Conversions" value="32" trend="+8%" icon={Zap} />
      </div>

      <div className="bg-dark-card rounded-3xl border border-gray-800 p-10 text-center shadow-premium">
         <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-brand-500" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-4">Start Creating Content</h2>
         <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">Select a tool from the sidebar to begin your journey. Use the Viral Post Generator for Facebook threads or create Authority Images.</p>
         <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate(View.VIRAL_GENERATOR)} className="bg-brand-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-800 border-2 border-brand-700 shadow-brand-900/20 transition-all flex items-center">
               <Sparkles className="w-5 h-5 mr-2" />
               Viral Posts
            </button>
            <button onClick={() => onNavigate(View.IMAGE_GENERATOR)} className="bg-dark-input border border-gray-700 text-gray-200 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 hover:text-white flex items-center transition-all">
               <ImageIcon className="w-5 h-5 mr-2" />
               Image Posts
            </button>
            <button onClick={() => onNavigate(View.SHORTS_GENERATOR)} className="bg-dark-input border border-gray-700 text-gray-200 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 hover:text-white flex items-center transition-all">
               <Mic className="w-5 h-5 mr-2" />
               Audio Studio
            </button>
         </div>
      </div>

      {/* YouTube Subscribe Card - Moved to Bottom */}
      <div className="flex justify-center mt-8">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-red-900/30 shadow-lg flex items-center relative overflow-hidden group max-w-lg w-full justify-between">
            <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none rotate-12">
                <Youtube className="w-40 h-40 text-red-500" />
            </div>
            <div className="pr-2 relative z-10 flex-1">
                 <p className="text-xs font-bold text-gray-300 leading-tight mb-3 uppercase tracking-wider">
                    8 Figure Business Advice
                 </p>
                 <p className="text-white font-bold text-lg mb-4">
                    Want <span className="text-red-400">FREE Advice & Courses</span> <br/>From an 8 Figure Business Owner?
                 </p>
                 <a 
                    href="https://youtube.com/channel/UCN5cxymUeykhheJHWFiuSeg?sub_confirmation=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-red-900/50"
                >
                    <Youtube className="w-4 h-4 mr-2 fill-current" />
                    Subscribe on YouTube
                </a>
            </div>
             <div className="relative z-10 hidden sm:block">
                 <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                    <Youtube className="w-8 h-8 text-red-500" />
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
