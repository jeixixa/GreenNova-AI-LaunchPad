
import React, { useState, useEffect } from 'react';
import { findViralContent, ViralSearchResponse } from '../services/geminiService';
import { 
  Search, 
  Loader2, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Copy, 
  Check, 
  Info, 
  Brain, 
  Flame, 
  Palette, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Smartphone,
  AlertTriangle,
  // Added Globe icon to imports
  Globe
} from 'lucide-react';
import { View } from '../types';
import VoiceInput from './VoiceInput';

interface ViralSearchProps {
    onNavigate: (view: View) => void;
}

const LOADING_MESSAGES = [
  "Powered Business Launch System AI is scanning viral content…",
  "Analyzing hooks and engagement patterns…",
  "Identifying why posts go viral…",
  "Repurposing content for you…"
];

type SocialPlatform = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'X (Twitter)' | 'LinkedIn';

const ViralSearch: React.FC<ViralSearchProps> = ({ onNavigate }) => {
  const [niche, setNiche] = useState('');
  const [results, setResults] = useState<ViralSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Facebook');
  const [activeRepurposeTab, setActiveRepurposeTab] = useState<keyof ViralSearchResponse['repurposed_content']>('facebook');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Rotating loading message logic
  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load Auto-Saved Data on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('sbl_viral_search_v3');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.niche) setNiche(parsed.niche);
        if (parsed.results) setResults(parsed.results);
        if (parsed.selectedPlatform) setSelectedPlatform(parsed.selectedPlatform);
      } catch (e) { console.error("Failed to load viral search data", e); }
    }
  }, []);

  // Auto-Save Data
  useEffect(() => {
    const dataToSave = { niche, results, selectedPlatform };
    localStorage.setItem('sbl_viral_search_v3', JSON.stringify(dataToSave));
  }, [niche, results, selectedPlatform]);

  const handleSearch = async () => {
    if (!niche.trim()) return;
    
    setLoading(true);
    setResults(null);
    try {
      const data = await findViralContent(niche, selectedPlatform);
      setResults(data);
    } catch (e) {
      alert("Failed to find viral content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const platforms: { name: SocialPlatform; icon: React.ElementType; color: string }[] = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { name: 'TikTok', icon: Smartphone, color: 'text-white' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
    { name: 'X (Twitter)', icon: Twitter, color: 'text-gray-200' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 animate-fade-in space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-brand-500" />
          Viral Search
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Discover what’s trending — then remix it with AI.</p>
      </div>

      <div className="bg-dark-card rounded-3xl p-8 border border-gray-800 shadow-premium space-y-10 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Platform Selector */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block ml-1">Select platform to analyze viral patterns</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {platforms.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelectedPlatform(p.name)}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border transition-all font-bold text-xs ${
                  selectedPlatform === p.name
                    ? 'bg-brand-900/30 border-brand-500 text-white shadow-glow-sm scale-[1.02]'
                    : 'bg-dark-input border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <p.icon className={`w-4 h-4 ${selectedPlatform === p.name ? p.color : 'text-gray-600'}`} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Search a topic, keyword, or paste a link…"
                    className="w-full bg-dark-input border border-gray-700 rounded-2xl py-5 pl-14 pr-14 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 text-lg shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <VoiceInput onTranscript={setNiche} className="w-11 h-11" />
                </div>
            </div>
            <button 
                onClick={handleSearch}
                disabled={loading || !niche}
                className={`px-10 py-5 rounded-2xl font-black text-white flex items-center justify-center transition-all border-2 border-transparent uppercase tracking-widest text-sm shadow-xl active:scale-95 ${loading || !niche ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-500 hover:bg-brand-400 shadow-brand-900/20'}`}
            >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Zap className="w-6 h-6 mr-2" />}
                Search Viral Content
            </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-8 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
               <Loader2 className="w-24 h-24 text-brand-500 animate-spin absolute inset-0 opacity-20" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-brand-500 animate-bounce" />
               </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 flex items-center justify-center">
                  <h3 className="text-2xl md:text-3xl font-black text-white transition-all duration-700 animate-pulse">
                    {LOADING_MESSAGES[loadingStep]}
                  </h3>
              </div>
              <p className="text-gray-500 text-sm font-bold flex items-center justify-center gap-2 tracking-wide">
                <Info size={16} className="text-brand-500" />
                This may take a few seconds. We’re doing deep pattern analysis.
              </p>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {results && !loading && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Hooks & Why */}
              <div className="lg:col-span-4 space-y-8">
                {/* Viral Hooks Card */}
                <div className="bg-[#0B1425] rounded-3xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <Flame size={160} className="text-orange-500" />
                  </div>
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Flame size={14} className="fill-current" /> Viral Hooks
                  </h3>
                  <div className="space-y-4">
                    {results.viral_hooks.map((hook, i) => (
                      <div key={i} className="p-5 bg-dark-input border border-gray-800/50 rounded-2xl relative group/hook hover:border-orange-500/30 transition-all">
                        <button 
                          onClick={() => handleCopy(hook, `hook-${i}`)}
                          className="absolute top-3 right-3 opacity-0 group-hover/hook:opacity-100 transition-all p-2 bg-gray-900 rounded-xl hover:text-white"
                        >
                          {copiedKey === `hook-${i}` ? <Check size={14} className="text-brand-500" /> : <Copy size={14} className="text-gray-400" />}
                        </button>
                        <p className="text-[15px] text-gray-200 font-bold pr-8 leading-relaxed italic">"{hook}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why This Works Card */}
                <div className="bg-[#0B1425] rounded-3xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <Brain size={160} className="text-brand-500" />
                  </div>
                  <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Brain size={14} className="fill-current" /> Why This Works
                  </h3>
                  <ul className="space-y-4">
                    {results.why_it_works.map((reason, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm text-gray-400 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0 shadow-glow shadow-brand-500/50" />
                        <span className="font-medium">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grounding Sources */}
                {results.sources && results.sources.length > 0 && (
                  <div className="bg-[#0B1425] rounded-3xl border border-gray-800 p-8 shadow-2xl">
                     <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <LinkIcon size={14} /> Pattern Sources
                     </h3>
                     <div className="space-y-3">
                        {results.sources.map((source, i) => (
                            <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3.5 bg-dark-input hover:bg-dark-input/80 border border-gray-800 rounded-xl text-xs text-gray-400 hover:text-white transition-all truncate"
                            >
                                {/* Globe icon fixed by adding to lucide-react imports */}
                                <Globe size={14} className="shrink-0 text-blue-500" />
                                <span className="truncate flex-1 font-bold">{source.title}</span>
                                <ExternalLink size={12} className="shrink-0 opacity-40" />
                            </a>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Right Column: Remix Studio */}
              <div className="lg:col-span-8 space-y-10">
                {/* Repurposed Content Card */}
                <div className="bg-[#0B1425] rounded-4xl border border-gray-800 shadow-premium overflow-hidden flex flex-col min-h-[600px] hover:border-brand-500/10 transition-colors">
                  <div className="p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 bg-dark-card/30">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500 shadow-glow-sm">
                            <RefreshCw size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-[0.1em]">Remix Studio</h3>
                    </div>
                    <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800/50">
                      {Object.keys(results.repurposed_content).map((plat) => (
                        <button
                          key={plat}
                          onClick={() => setActiveRepurposeTab(plat as any)}
                          className={`p-3 rounded-xl transition-all relative group/tab ${activeRepurposeTab === plat ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`}
                          title={`View ${plat} Remix`}
                        >
                          {plat === 'facebook' && <Facebook size={18} />}
                          {plat === 'instagram' && <Instagram size={18} />}
                          {plat === 'tiktok' && <Smartphone size={18} />}
                          {plat === 'x' && <Twitter size={18} />}
                          {plat === 'linkedin' && <Linkedin size={18} />}
                          {activeRepurposeTab === plat && (
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex-1 bg-[#0A192F] rounded-3xl border border-gray-800 p-8 relative group/content shadow-inner">
                      <div className="absolute top-6 right-6 flex items-center gap-2">
                        <button 
                            onClick={() => handleCopy(results.repurposed_content[activeRepurposeTab], 'remix')}
                            className="bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                        >
                            {copiedKey === 'remix' ? <Check size={14} /> : <Copy size={14} />}
                            {copiedKey === 'remix' ? 'Copied' : 'Copy Remix'}
                        </button>
                      </div>
                      <div className="prose prose-invert prose-lg max-w-none">
                        <textarea
                            readOnly
                            value={results.repurposed_content[activeRepurposeTab]}
                            className="w-full h-[320px] bg-transparent text-gray-200 resize-none outline-none font-sans text-lg leading-relaxed placeholder:text-gray-800"
                            placeholder="Generated remix will appear here..."
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Pattern CTAs</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {results.cta_variations.map((cta, i) => (
                          <button
                            key={i}
                            onClick={() => handleCopy(cta, `cta-${i}`)}
                            className="text-left p-4 bg-dark-input border border-gray-800 rounded-2xl text-xs text-gray-400 hover:text-white hover:border-brand-500/50 transition-all flex items-center justify-between group/cta"
                          >
                            <span className="truncate pr-4 font-bold">"{cta}"</span>
                            {copiedKey === `cta-${i}` ? <Check size={12} className="text-brand-500 shrink-0" /> : <Copy size={12} className="text-gray-600 group-hover/cta:text-gray-300 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Prompt Card */}
                <div className="bg-gradient-to-br from-[#0B1425] to-[#0A192F] rounded-4xl border border-brand-500/10 p-10 shadow-premium group relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Palette size={180} className="text-brand-500" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-[0.1em]">Creative Brief: Authority Image</h3>
                            <p className="text-xs text-gray-500 mt-1">One-click copy for SBL Image Studio</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(results.image_prompt, 'img-prompt')}
                      className="text-xs font-black uppercase tracking-widest text-brand-400 hover:text-brand-300 flex items-center gap-2 bg-brand-500/10 px-5 py-2.5 rounded-xl border border-brand-500/20 transition-all hover:bg-brand-500/20 active:scale-95 shadow-glow-sm"
                    >
                      {copiedKey === 'img-prompt' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === 'img-prompt' ? 'Prompt Copied' : 'Copy AI Prompt'}
                    </button>
                  </div>

                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-sm text-brand-200/80 leading-relaxed italic relative z-10 group-hover:text-white transition-colors">
                    "{results.image_prompt}"
                  </div>

                  <div className="mt-8 flex justify-end relative z-10">
                    <button 
                      onClick={() => {
                        localStorage.setItem('sbl_autosave_image_studio', JSON.stringify({ generatePrompt: results.image_prompt, mode: 'generate' }));
                        onNavigate(View.IMAGE_GENERATOR);
                      }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform py-2"
                    >
                      Design Visual Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!results && !loading && (
             <div className="text-center py-28 bg-[#0B1425]/40 rounded-4xl border border-gray-800/40 relative overflow-hidden group">
                 {/* Decorative Circle */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-brand-500/10 transition-all duration-1000"></div>
                 
                 <div className="relative z-10">
                    <div className="bg-dark-input w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 border border-gray-700 shadow-2xl group hover:border-brand-500 transition-all duration-500 group-hover:rotate-6">
                        <TrendingUp className="w-12 h-12 text-gray-500 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <h3 className="text-white font-serif font-bold text-3xl mb-4 tracking-tight">Discover Viral Patterns</h3>
                    <p className="text-gray-500 text-lg max-w-md mx-auto mb-10 leading-relaxed font-medium">
                        Enter a keyword, business topic, or paste a successful social post link to start scanning the viral landscape.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto px-4">
                        {[
                        '#AI Side Hustles', 
                        '#SustainableScaling', 
                        '#SolopreneurWealth', 
                        '#AutomationStrategies', 
                        '#DigitalMarketing2025'
                        ].map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setNiche(tag.replace('#', ''))}
                            className="px-5 py-2.5 bg-dark-input hover:bg-brand-900/30 text-gray-500 hover:text-brand-400 border border-gray-800 hover:border-brand-500/30 rounded-full text-xs font-black transition-all uppercase tracking-widest shadow-lg"
                        >
                            {tag}
                        </button>
                        ))}
                    </div>
                 </div>
             </div>
        )}

        {/* Feature Teaser / Dev State */}
        {!results && !loading && (
            <div className="mt-10 p-10 bg-gradient-to-br from-dark-input/50 to-brand-900/5 rounded-3xl border border-gray-800/50 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="p-5 bg-brand-500/10 rounded-3xl text-brand-500 border border-brand-500/20 shadow-glow-sm">
                    <AlertTriangle size={32} />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">🚧 Viral Search Training in Progress</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                        Powered Business Launch System AI is currently deepening its training on 2025 viral patterns across all major social media platforms. Soon you’ll be able to discover trending posts and repurpose them instantly with 99% accuracy.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest bg-brand-500/10 px-4 py-2 rounded-full border border-brand-500/20">
                        <Check size={10} /> Pattern Logic Active
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                        <Check size={10} /> Grounding Ready
                    </div>
                </div>
            </div>
        )}
      </div>
      
      {/* Monetization / Pro Footer */}
      <div className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-indigo-900/20 transition-all">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform shadow-glow shadow-indigo-500/20">
            <RefreshCw size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-1">Weekly Viral Reports</h4>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">Upgrade to Pro to get a curated list of viral hooks and proven pattern analysis delivered to your inbox every Monday morning.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate(View.ACCOUNT)}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-xl shadow-indigo-900/40 active:scale-95 flex items-center gap-3"
        >
          View Pro Plans <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ViralSearch;
