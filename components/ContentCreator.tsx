import React, { useState, useRef, useEffect } from 'react';
import { generateViralPost } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';
import { 
  Loader2, Copy, Check, Zap, RotateCcw, 
  MessageSquare, Wand2, Link2, Target, User, 
  FileText, Sparkles, MessageCircle, Twitter, 
  Instagram, Linkedin, Youtube, Smartphone, Facebook, Menu, AtSign, Hand, Search, Globe,
  Upload,
  Briefcase,
  SearchCode,
  Tags,
  Anchor,
  LayoutList,
  Layers,
  Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TwitterThreadTemplate from './TwitterThreadTemplate';
import InstagramCarouselTemplate from './InstagramCarouselTemplate';

type PreviewTab = 'COMMENT LADDER' | 'INSTA CAROUSEL' | 'X THREAD' | 'VIRAL BLOG' | 'LINKEDIN' | 'MAIN POST' | '13-OPTION MENU' | 'PROMOS';
type SocialPlatform = 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'TikTok' | 'YouTube' | 'Threads';

const PLATFORMS: { name: SocialPlatform; icon: any }[] = [
    { name: 'Facebook', icon: Facebook },
    { name: 'Instagram', icon: Instagram },
    { name: 'LinkedIn', icon: Linkedin },
    { name: 'Twitter', icon: Twitter },
    { name: 'TikTok', icon: Smartphone },
    { name: 'YouTube', icon: Youtube },
    { name: 'Threads', icon: MessageCircle },
];

const ContentCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PreviewTab>('COMMENT LADDER');
  
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Facebook');
  const [hookType, setHookType] = useState('Curiosity Gap');
  const [nicheTopic, setNicheTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [isVerified, setIsVerified] = useState(true);

  const [offerName, setOfferName] = useState('AI-POWERED BUSINESS LAUNCH SYSTEM');
  const [offerUrl, setOfferUrl] = useState('https://linkedaffiliatehour.systeme.io/free-checklist');
  const [offerDescription, setOfferDescription] = useState('');
  const [brandHandle, setBrandHandle] = useState('@GreenNova');
  const [displayName, setDisplayName] = useState('James Shizha');
  const [targetAudience, setTargetAudience] = useState('Beginners who want to build an online business and Entrepreneurs');
  const [ctaKeyword, setCtaKeyword] = useState('AI LAUNCH SYSTEM');
  const [sourceUrl, setSourceUrl] = useState('');
  
  const [profileImage, setProfileImage] = useState<{data: string, mimeType: string, url: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseSections = (text: string) => {
    const segments = text.split(/\*\*(MAIN POST|VIRAL BLOG|LINKEDIN POST|COMMENT LADDER|INSTA CAROUSEL|X THREAD|13-OPTION POST MENU|PROMOS|SECTION \d+.*?)\*\*/gi);
    const results: {title: string, content: string}[] = [];
    
    for (let i = 1; i < segments.length; i += 2) {
        results.push({
            title: segments[i].toUpperCase().trim(),
            content: segments[i+1]?.trim() || ""
        });
    }
    
    if (results.length === 0) {
        return [{ title: 'CONTENT', content: text }];
    }
    return results;
  };

  const handleGenerate = async () => {
    if (!offerUrl || !targetAudience || !nicheTopic) {
      alert("Drop your niche topic, offer + audience below 👇");
      return;
    }
    setLoading(true);
    try {
      const result = await generateViralPost({
        style: 'Viral-Redo',
        platform: selectedPlatform,
        offerName,
        offerLink: offerUrl,
        offerDescription,
        ctaKeyword,
        targetAudience,
        topics: [nicheTopic],
        hookType,
        language,
        contentUrl: sourceUrl
      });
      setGeneratedContent(result);
      setSections(parseSections(result));
      setActiveTab('COMMENT LADDER');
      trackEvent('post_generated');
    } catch (error) {
      console.error(error);
      alert("Failed to generate. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTabContent = () => {
    if (sections.length === 0 && !loading) {
        return (
            <div className="text-center py-20 text-gray-600">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">Drop your niche, offer + audience below 👇</p>
                <p className="text-sm opacity-50">Specify your topic and hook to generate your GreenNova suite.</p>
            </div>
        );
    }

    if (activeTab === 'COMMENT LADDER') {
        const mainPostSec = sections.find(s => s.title === 'MAIN POST');
        const ladderSec = sections.find(s => s.title === 'COMMENT LADDER');
        
        let mainText = mainPostSec?.content || "";
        mainText = mainText.replace(/^\*\*MAIN POST\*\*/i, "").trim();

        const rawLadder = ladderSec?.content || "";
        // Match specific comment boundaries like "COMMENT X:" or "Comment X:"
        const ladderParts = rawLadder.split(/COMMENT \d:?|Comment \d:?/gi).filter(c => c.trim().length > 10).map(c => c.trim());

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">MAIN POST (120-130 CHARS)</label>
                    <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-blue-700 shadow-premium flex items-center justify-center text-center relative group min-h-[180px]">
                        <h3 className="text-xl md:text-2xl font-black text-white leading-tight max-w-lg">
                            {mainText || "Architecting your 1+8 post..."}
                        </h3>
                        <button onClick={() => copyToClipboard(mainText, 'main')} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-3 bg-black/40 text-white rounded-2xl transition-all">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-6 rounded-r-3xl my-8">
                    <h4 className="text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
                        <MessageSquare size={14} /> The Viral 1+8 Ladder
                    </h4>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Bridging source insights directly into your profit system</p>
                </div>

                <div className="space-y-4">
                    {ladderParts.map((comment, i) => (
                        <div key={i} className={`group border p-6 rounded-[2rem] relative transition-all bg-[#0B1425] border-gray-800 hover:border-emerald-500/30 shadow-sm`}>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm shrink-0 shadow-inner">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            {i === 0 ? "Problem Setup" : i === 7 ? "Final Offer Summary" : `Value Strategy #${i}`}
                                        </span>
                                        <button onClick={() => copyToClipboard(comment, `c-${i}`)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500 transition-colors">
                                            {copiedId === `c-${i}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        <ReactMarkdown>{comment}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activeTab === 'VIRAL BLOG') {
        const blogSec = sections.find(s => s.title === 'VIRAL BLOG');
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <FileText className="text-brand-500" /> VIRAL BLOG (SEO ENHANCED)
                    </h3>
                    <button onClick={() => copyToClipboard(blogSec?.content || "", 'blog')} className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700">
                        {copiedId === 'blog' ? <Check size={18} className="text-brand-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <div className="bg-[#0B1425] border border-gray-800 rounded-[2.5rem] p-10 prose prose-invert prose-lg max-w-none leading-relaxed shadow-premium">
                    <div className="bg-brand-500/5 border-l-4 border-brand-500 p-6 rounded-r-xl mb-8">
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">SEO ARCHITECTURE</p>
                        <p className="text-xs text-gray-400">Main Title in ALL CAPS. Meta Description and internal Title Case sub-headings follow. Strictly no all-caps inside the body.</p>
                    </div>
                    <ReactMarkdown>{blogSec?.content || "Generating SEO-optimized blog..."}</ReactMarkdown>
                </div>
            </div>
        );
    }

    if (activeTab === 'LINKEDIN') {
        const linkedinSec = sections.find(s => s.title === 'LINKEDIN POST');
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Linkedin className="text-[#0a66c2]" /> LINKEDIN AUTHORITY
                    </h3>
                    <button onClick={() => copyToClipboard(linkedinSec?.content || "", 'linkedin')} className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700">
                        {copiedId === 'linkedin' ? <Check size={18} className="text-brand-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-200 p-10 prose prose-lg max-w-none leading-relaxed shadow-premium text-gray-900">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 text-xl overflow-hidden shadow-inner">
                            {profileImage ? <img src={profileImage.url} alt="U" className="w-full h-full object-cover" /> : (displayName?.[0] || 'U')}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{displayName}</p>
                            <p className="text-xs text-gray-500">CEO @ GreenNova Threads System</p>
                        </div>
                    </div>
                    <ReactMarkdown>{linkedinSec?.content || "Generating authority summary..."}</ReactMarkdown>
                </div>
            </div>
        );
    }

    if (activeTab === 'INSTA CAROUSEL') {
        const carouselSec = sections.find(s => s.title === 'INSTA CAROUSEL');
        const rawContent = carouselSec?.content || "";
        
        const slideBlocks = rawContent.split(/Slide \d+:?/gi).filter(s => s.trim().length > 5);
        const slides = slideBlocks.map(block => {
            const lines = block.split('\n').filter(l => l.trim());
            const headline = lines.find(l => l.toLowerCase().includes('headline'))?.split(':')?.slice(1)?.join(':')?.trim() || lines[0]?.trim();
            const body = lines.find(l => l.toLowerCase().includes('body'))?.split(':')?.slice(1)?.join(':')?.trim() || lines[1]?.trim();
            return { headline, body };
        });

        return <InstagramCarouselTemplate slides={slides} />;
    }

    if (activeTab === 'X THREAD') {
        const xSec = sections.find(s => s.title === 'X THREAD');
        const tweets = (xSec?.content || "").split(/Tweet \d+:?/gi).map(t => t.trim()).filter(t => t.length > 5);
        return (
          <TwitterThreadTemplate 
            name={displayName} 
            handle={brandHandle} 
            isVerified={isVerified} 
            tweets={tweets} 
            profileImage={profileImage?.url}
          />
        );
    }

    if (activeTab === '13-OPTION MENU') {
        const menuSec = sections.find(s => s.title.includes('MENU'));
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <LayoutList className="text-yellow-500" /> 13-OPTION POST MENU
                    </h3>
                    <button onClick={() => copyToClipboard(menuSec?.content || "", 'menu')} className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700">
                        {copiedId === 'menu' ? <Check size={18} className="text-brand-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <div className="bg-[#0B1425] border border-gray-800 rounded-[2.5rem] p-10 prose prose-invert max-w-none shadow-premium">
                    <ReactMarkdown>{menuSec?.content || "Generating menu options..."}</ReactMarkdown>
                </div>
            </div>
        );
    }

    if (activeTab === 'PROMOS') {
        const promosSec = sections.find(s => s.title === 'PROMOS');
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Heart className="text-red-500" /> ACTIVE PROMOS
                    </h3>
                    <button onClick={() => copyToClipboard(promosSec?.content || "", 'promos')} className="p-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700">
                        {copiedId === 'promos' ? <Check size={18} className="text-brand-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <div className="bg-[#0B1425] border border-gray-800 rounded-[2.5rem] p-10 shadow-premium">
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>{promosSec?.content || "Promo links and context appear here."}</ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'MAIN POST') {
        const mainPostSec = sections.find(s => s.title === 'MAIN POST');
        const content = mainPostSec?.content || "Generating scroll-stopping hook...";
        return (
            <div className="space-y-6 animate-fade-in flex flex-col items-center justify-center h-full text-center">
                <h3 className="text-xs font-black text-brand-500 uppercase tracking-widest mb-4">Final Optimized Hook</h3>
                <div className="p-16 rounded-[3rem] bg-gradient-to-br from-brand-600 via-blue-600 to-indigo-700 shadow-premium max-w-xl group relative">
                    <p className="text-2xl md:text-3xl font-black text-white leading-tight">
                        {content}
                    </p>
                    <button onClick={() => copyToClipboard(content, 'main-tab')} className="absolute top-6 right-6 p-3 bg-black/30 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                        <Copy size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0A192F] rounded-[2rem] border border-gray-800 shadow-premium p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">Synthesis Engine</label>
                <h2 className="text-xl font-bold text-white">GreenNova Threads Suite</h2>
              </div>
              <button onClick={() => { setGeneratedContent(''); setSections([]); }} className="p-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-brand-500 transition-colors border border-gray-700">
                  <RotateCcw size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">Social Platform</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {PLATFORMS.map(p => (
                          <button
                            key={p.name}
                            onClick={() => setSelectedPlatform(p.name)}
                            className={`p-3 rounded-xl border flex items-center justify-center transition-all ${selectedPlatform === p.name ? 'bg-brand-50/10 border-brand-500 text-brand-500 shadow-glow-sm' : 'bg-dark-input border-gray-800 text-gray-600 hover:text-gray-400'}`}
                            title={p.name}
                          >
                              <p.icon size={16} />
                          </button>
                      ))}
                  </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Tags size={12} /> Niche Topic (Required)
                  </label>
                  <input 
                    value={nicheTopic}
                    onChange={(e) => setNicheTopic(e.target.value)}
                    className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="e.g. AI Side Hustles, Passive Income..."
                  />
              </div>

              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Anchor size={12} /> Hook Type
                  </label>
                  <select 
                    value={hookType}
                    onChange={(e) => setHookType(e.target.value)}
                    className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                  >
                    <option>Curiosity Gap</option>
                    <option>Hard Proof</option>
                    <option>Contrarian Shift</option>
                    <option>Fear of Missing Out</option>
                    <option>Step-by-Step Blueprint</option>
                  </select>
              </div>

              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Link2 size={12} /> Source Content (Optional YouTube URL)
                  </label>
                  <input 
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Paste link to extract true explanation..."
                  />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">1️⃣ What's your offer? (URL)</label>
                <input 
                  value={offerUrl}
                  onChange={(e) => setOfferUrl(e.target.value)}
                  className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="https://your-offer.io"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">Offer Name</label>
                <input 
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="AI-POWERED BUSINESS LAUNCH SYSTEM"
                />
              </div>

              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">2️⃣ Who's your target audience?</label>
                  <input 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Beginners wanting an online business"
                  />
              </div>

              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest ml-1">CTA Keyword</label>
                  <input 
                  value={ctaKeyword}
                  onChange={(e) => setCtaKeyword(e.target.value)}
                  className="w-full bg-[#0B1425] border border-gray-700 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. AI LAUNCH SYSTEM"
                  />
              </div>

              <div className="bg-[#0B1425] p-6 rounded-3xl border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-brand-400" />
                        <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Digital Persona</h4>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-14 h-14 rounded-full border-2 border-dashed border-gray-700 hover:border-brand-500 flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden bg-gray-900 shadow-inner"
                      >
                          {profileImage ? <img src={profileImage.url} alt="P" className="w-full h-full object-cover" /> : <Upload size={14} className="text-gray-600" />}
                      </div>
                      <div className="flex-1 space-y-2">
                          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full Name" className="w-full bg-transparent border-b border-gray-800 py-1 text-xs text-white focus:border-brand-500 outline-none font-bold" />
                          <input value={brandHandle} onChange={(e) => setBrandHandle(e.target.value)} placeholder="@username" className="w-full bg-transparent border-b border-gray-800 py-1 text-[10px] text-gray-400 focus:border-brand-500 outline-none" />
                      </div>
                      <input type="file" ref={fileInputRef} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setProfileImage({ data: (ev.target?.result as string).split(',')[1], mimeType: file.type, url: ev.target?.result as string });
                              reader.readAsDataURL(file);
                          }
                      }} className="hidden" accept="image/*" />
                  </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-glow
                  ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-400 text-white active:scale-95'}`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                {loading ? 'Architecting Suite...' : 'Architect Viral Launch'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#0A192F] rounded-[2rem] border border-gray-800 shadow-premium flex flex-col h-[900px] overflow-hidden">
          <div className="flex border-b border-gray-800 shrink-0 bg-dark-card/30 overflow-x-auto custom-scrollbar">
             {(['COMMENT LADDER', 'INSTA CAROUSEL', 'X THREAD', 'VIRAL BLOG', 'LINKEDIN', 'MAIN POST', '13-OPTION MENU', 'PROMOS'] as PreviewTab[]).map(tab => (
               <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[140px] py-5 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative
                  ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 {tab === 'INSTA CAROUSEL' ? <span className="flex items-center justify-center gap-1.5"><Layers size={10} /> CAROUSEL</span> : 
                  tab === 'X THREAD' ? <span className="flex items-center justify-center gap-1.5"><Twitter size={10} /> THREAD</span> : tab}
                 {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 shadow-glow"></div>}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative bg-[#020C1B]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                 <div className="relative w-24 h-24 mb-6">
                    <Loader2 size={96} className="animate-spin absolute inset-0 text-brand-500 opacity-20" />
                    <Zap size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-brand-500" />
                 </div>
                 <h3 className="text-white font-bold text-xl mb-2">Deep Synthesis Active</h3>
                 <p className="text-gray-500 text-sm max-w-xs mx-auto text-center">Generating your high-converting GreenNova Threads suite with SEO metadata...</p>
              </div>
            ) : getTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
