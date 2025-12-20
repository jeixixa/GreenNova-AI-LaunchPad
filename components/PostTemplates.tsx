
import React, { useState, useEffect } from 'react';
import FacebookThreadTemplate from './FacebookThreadTemplate';
import TwitterThreadTemplate from './TwitterThreadTemplate';
import LinkedInPostTemplate from './LinkedInPostTemplate';
import { Facebook, Linkedin, Twitter, User, AtSign, Settings } from 'lucide-react';

const PostTemplates: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  
  // Profile state for template personalization
  const [profileName, setProfileName] = useState('James Shizha');
  const [profileHandle, setProfileHandle] = useState('@jamesshizha');
  const [profileHeadline, setProfileHeadline] = useState('Founder @ SBL System | Scaling businesses with AI');
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  useEffect(() => {
    const savedOffer = localStorage.getItem('sbl_global_offer');
    if (savedOffer) {
        try {
            const offer = JSON.parse(savedOffer);
            if (offer.handle) setProfileHandle(offer.handle.startsWith('@') ? offer.handle : `@${offer.handle}`);
            // If there's a name in general user email/profile, we could use it too
        } catch(e) {}
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Viral Templates</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Proven structures to copy, paste, and profit.</p>
        </div>
        <button 
            onClick={() => setShowProfileSettings(!showProfileSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${showProfileSettings ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 hover:border-brand-300'}`}
        >
            <Settings className={`w-3.5 h-3.5 ${showProfileSettings ? 'animate-spin-slow' : ''}`} />
            Preview Settings
        </button>
      </div>

      {showProfileSettings && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-200 dark:border-brand-900/30 shadow-lg animate-slide-up">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-4 h-4 mr-2 text-brand-500" />
                  Customize Template Previews
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Display Name</label>
                      <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input 
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full pl-9 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Twitter / X Handle</label>
                      <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input 
                              value={profileHandle}
                              onChange={(e) => setProfileHandle(e.target.value.startsWith('@') ? e.target.value : `@${e.target.value}`)}
                              className="w-full pl-9 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">LinkedIn Headline</label>
                      <input 
                          value={profileHeadline}
                          onChange={(e) => setProfileHeadline(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 inline-flex shadow-sm">
              <button
                  onClick={() => setActivePlatform('facebook')}
                  className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activePlatform === 'facebook' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
              </button>
              <button
                  onClick={() => setActivePlatform('twitter')}
                  className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activePlatform === 'twitter' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                  <Twitter className="w-4 h-4 mr-2" /> X (Twitter)
              </button>
              <button
                  onClick={() => setActivePlatform('linkedin')}
                  className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activePlatform === 'linkedin' ? 'bg-[#0a66c2] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                  <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
              </button>
          </div>
      </div>

      <div className="transition-all duration-300">
          {activePlatform === 'facebook' && <FacebookThreadTemplate mainHook={`I used AI to turn my Facebook page from quiet to cash-flowing`} />}
          {activePlatform === 'twitter' && <TwitterThreadTemplate name={profileName} handle={profileHandle} />}
          {activePlatform === 'linkedin' && <LinkedInPostTemplate name={profileName} headline={profileHeadline} />}
      </div>
    </div>
  );
};

export default PostTemplates;
