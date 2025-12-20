import React, { useState } from 'react';
import { Copy, Check, Heart, MessageCircle, Repeat, Share, BarChart2, MoreHorizontal } from 'lucide-react';

interface TwitterThreadTemplateProps {
  name?: string;
  handle?: string;
  profileImage?: string;
  isVerified?: boolean;
  tweets?: string[];
}

const TwitterThreadTemplate: React.FC<TwitterThreadTemplateProps> = ({ 
  name = "User Name", 
  handle = "@username",
  profileImage,
  isVerified = true,
  tweets = []
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Fallback demo tweets if none provided
  const displayTweets = tweets.length > 0 ? tweets : [
    `1/ 10 AI tools that will save you 20 hours a week (and make you money):\n\nA thread 🧵👇`,
    `2/ ChatGPT (The Brain)\n\nUse it for:\n- Strategy generation\n- Content outlining\n- Email drafting\n\nPro tip: Use custom instructions to set your brand voice once, and never repeat yourself.`,
    `6/ If you found this thread helpful:\n\n1. Follow me ${handle} for more AI leverage.\n2. RT the first tweet to share the knowledge.\n\nLet's build together. 🚀`
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(displayTweets.join('\n\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
       {/* Control Bar */}
       <div className="flex justify-between items-center mb-6 bg-white dark:bg-[#0A192F] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-premium">
          <div>
             <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                X (Twitter) Thread Suite
                {isVerified && (
                  <div className="bg-[#1D9BF0] rounded-full p-0.5 flex-shrink-0">
                    <Check size={8} strokeWidth={5} className="text-white" />
                  </div>
                )}
             </h2>
             <p className="text-xs text-gray-500">Optimized for high-engagement reach</p>
          </div>
          <button 
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-glow active:scale-95"
          >
             {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
             {copiedAll ? 'Copied' : 'Copy All'}
          </button>
       </div>

       {/* Thread Visual */}
       <div className="space-y-0">
          {displayTweets.map((tweet, idx) => (
             <div key={idx} className="relative pl-0">
                {/* Connector Line */}
                {idx !== displayTweets.length - 1 && (
                    <div className="absolute left-[26px] top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>
                )}
                
                <div className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors rounded-2xl group">
                   <div className="shrink-0 pt-1">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200 dark:border-gray-600 shadow-inner">
                         {profileImage ? <img src={profileImage} alt={name} className="w-full h-full object-cover" /> : name[0]}
                      </div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-gray-900 dark:text-white truncate flex items-center gap-1">
                                {name}
                                {isVerified && (
                                  <div className="bg-[#1D9BF0] rounded-full p-0.5 flex-shrink-0">
                                    <Check size={8} strokeWidth={5} className="text-white" />
                                  </div>
                                )}
                            </span>
                            <span className="text-gray-500 text-xs truncate">{handle} · {idx + 1}h</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <button 
                                onClick={() => handleCopy(tweet, idx)}
                                className="text-gray-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-brand-500/10"
                                title="Copy Tweet"
                             >
                                 {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                             </button>
                             <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
                         </div>
                      </div>
                      
                      <p className="mt-1 text-gray-900 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-[14px]">
                         {tweet}
                      </p>
                      
                      {/* Fake Engagement Metrics */}
                      <div className="flex justify-between mt-3 max-w-sm text-gray-500 opacity-60">
                         <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{Math.floor(Math.random() * 50)}</span>
                         </div>
                         <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
                            <Repeat className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{Math.floor(Math.random() * 20)}</span>
                         </div>
                         <div className="flex items-center gap-1 hover:text-pink-400 cursor-pointer">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{Math.floor(Math.random() * 200)}</span>
                         </div>
                         <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{Math.floor(Math.random() * 5)}k</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>
       
       <div className="mt-8 p-6 bg-brand-500/5 border border-brand-500/10 rounded-2xl text-center">
            <p className="text-xs text-gray-500 font-medium">Threads formatted for maximum authority and reach using the SBL Protocol.</p>
       </div>
    </div>
  );
};

export default TwitterThreadTemplate;