
import React, { useState, useEffect } from 'react';
import { findViralContent } from '../services/geminiService';
import { Search, Loader2, TrendingUp, ArrowRight, Zap, ExternalLink, RefreshCw, Facebook, Instagram, Twitter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { View } from '../types';
import VoiceInput from './VoiceInput';

interface ViralSearchProps {
    onNavigate: (view: View) => void;
}

interface ViralLink {
    title: string;
    url: string;
}

const ViralSearch: React.FC<ViralSearchProps> = ({ onNavigate }) => {
  const [niche, setNiche] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [viralLinks, setViralLinks] = useState<ViralLink[]>([]);

  // Load Auto-Saved Data on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('sbl_viral_search');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.niche) setNiche(parsed.niche);
        if (parsed.results) setResults(parsed.results);
        if (parsed.viralLinks) setViralLinks(parsed.viralLinks);
      } catch (e) { console.error("Failed to load viral search data", e); }
    }
  }, []);

  // Auto-Save Data
  useEffect(() => {
    const dataToSave = { niche, results, viralLinks };
    localStorage.setItem('sbl_viral_search', JSON.stringify(dataToSave));
  }, [niche, results, viralLinks]);

  const handleSearch = async (overrideQuery?: string) => {
    const query = overrideQuery || niche;
    if (!query.trim()) return;
    
    setLoading(true);
    setViralLinks([]);
    try {
      const data = await findViralContent(query);
      setResults(data);
      
      // Parse markdown links: [Title](URL)
      // Also fallback to raw URLs if markdown parsing misses them
      const items: ViralLink[] = [];
      
      // Regex 1: [Title](URL)
      const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      let match;
      while ((match = mdLinkRegex.exec(data)) !== null) {
          items.push({ title: match[1], url: match[2] });
      }

      // Regex 2: Raw URLs that might be standing alone
      // Filter out URLs we already found
      const rawUrlRegex = /(https?:\/\/[^\s\)]+)/g;
      let rawMatch;
      while ((rawMatch = rawUrlRegex.exec(data)) !== null) {
          const url = rawMatch[1];
          if (!items.some(item => item.url === url)) {
              items.push({ title: 'Viral Source', url: url });
          }
      }

      // Remove duplicates
      const uniqueItems = items.filter((item, index, self) => 
          index === self.findIndex((t) => t.url === item.url)
      );

      setViralLinks(uniqueItems);

    } catch (e) {
      setResults("Failed to find viral content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformScan = (platform: 'Facebook' | 'Instagram' | 'X' | 'TikTok') => {
      if (!niche) {
          alert("Please enter a niche first.");
          return;
      }
      const query = `site:${platform.toLowerCase()}.com viral trending "${niche}"`;
      handleSearch(query);
  };

  const handleRepurpose = (url: string) => {
      // 1. Determine correct style based on URL structure
      const isYouTube = url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be');
      const targetStyle = isYouTube ? 'YouTube-Viral' : 'Viral-Redo';

      // 2. Get existing Content Creator data to preserve user's offer/handle
      const existingData = localStorage.getItem('sbl_autosave_content_creator');
      let data = existingData ? JSON.parse(existingData) : {};
      
      // 3. Update with new URL and switch mode
      data = {
          ...data,
          contentUrl: url,
          style: targetStyle,
          // Reset generated output so user knows to click Generate
          generatedContent: '', 
          sections: [],
          carouselSlides: [],
          viralComments: []
      };
      
      // 4. Save to the correct key used by ContentCreator
      localStorage.setItem('sbl_autosave_content_creator', JSON.stringify(data));
      
      // 5. Navigate to Generator
      onNavigate(View.VIRAL_GENERATOR);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Find Viral Content</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover trending topics and high-engagement posts in your niche to repurpose.</p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-premium">
        
        {/* Platform Deep Scan Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button 
                onClick={() => handlePlatformScan('Facebook')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800"
            >
                <Facebook className="w-4 h-4" /> Scan Facebook
            </button>
            <button 
                onClick={() => handlePlatformScan('Instagram')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 font-bold text-xs hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors border border-pink-200 dark:border-pink-800"
            >
                <Instagram className="w-4 h-4" /> Scan Instagram
            </button>
            <button 
                onClick={() => handlePlatformScan('X')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
                <Twitter className="w-4 h-4" /> Scan X (Twitter)
            </button>
            <button 
                onClick={() => handlePlatformScan('TikTok')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-900 dark:bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors border border-gray-800"
            >
                <TrendingUp className="w-4 h-4" /> Scan TikTok
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Enter your niche (e.g., AI Marketing, Keto Diet, SaaS Sales)..."
                    className="w-full bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <VoiceInput onTranscript={setNiche} />
                </div>
            </div>
            <button 
                onClick={() => handleSearch()}
                disabled={loading || !niche}
                className={`px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center transition-all border-2 border-transparent ${loading || !niche ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}`}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <TrendingUp className="w-5 h-5 mr-2" />}
                Find Trends
            </button>
        </div>

        {results && (
            <div className="space-y-6">
                 {/* Extracted Links Section - Quick Actions */}
                 {viralLinks.length > 0 && (
                     <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-500/30 rounded-2xl p-6 shadow-lg shadow-brand-900/5">
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-brand-700 dark:text-brand-400 font-bold uppercase text-xs tracking-wider flex items-center">
                                <Zap className="w-4 h-4 mr-2" /> Quick Actions: Repurpose Discovered Content
                             </h3>
                             <span className="text-[10px] text-brand-600 dark:text-brand-300/50 uppercase font-bold">{viralLinks.length} Viral Sources Found</span>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-3">
                             {viralLinks.map((item, idx) => (
                                 <div key={idx} className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-dark-input p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500/50 transition-colors gap-3">
                                     <div className="flex-1 min-w-0 w-full">
                                         <p className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">{item.title}</p>
                                         <p className="text-xs text-gray-500 truncate font-mono">{item.url}</p>
                                     </div>
                                     <div className="flex gap-2 w-full sm:w-auto">
                                         <a 
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                            title="Open Original Link"
                                         >
                                             <ExternalLink className="w-4 h-4" />
                                         </a>
                                         <button 
                                            onClick={() => handleRepurpose(item.url)}
                                            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-all shadow-glow-sm hover:scale-[1.02]"
                                         >
                                             <RefreshCw className="w-3 h-3 mr-2" />
                                             Repurpose
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                {/* Raw Results */}
                <div className="bg-gray-50 dark:bg-dark-input/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                    <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" /> Search Results
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{results}</ReactMarkdown>
                    </div>
                </div>
            </div>
        )}
        
        {!results && !loading && (
             <div className="text-center py-12">
                 <div className="bg-gray-100 dark:bg-dark-input w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-800">
                     <Search className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                 </div>
                 <h3 className="text-gray-900 dark:text-gray-300 font-bold mb-2">Start Your Research</h3>
                 <p className="text-gray-500 text-sm max-w-md mx-auto">
                     Enter a topic to find the latest viral hooks and videos you can model your content after.
                 </p>
             </div>
        )}
      </div>
    </div>
  );
};

export default ViralSearch;
