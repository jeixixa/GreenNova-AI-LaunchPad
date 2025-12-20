
import React, { useState, useEffect } from 'react';
import { repurposeYouTubeVideo, GroundingSource } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { 
  Loader2, Youtube, Copy, Check, Bookmark, Sparkles, Wand2, Globe, ArrowRight, MessageSquare, FileText, ImageIcon, RefreshCw, ExternalLink, Target, Share2, Smartphone, Monitor, Twitter, Linkedin
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type RepurposeTab = 'titles' | 'script' | 'x-thread' | 'linkedin' | 'thumbnail';

const VideoRepurposer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [offerName, setOfferName] = useState('AI-Powered Business Launch System');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<RepurposeTab>('titles');

  // Load primary offer on mount
  useEffect(() => {
    const savedOffer = localStorage.getItem('sbl_global_offer');
    if (savedOffer) {
        try {
            const offer = JSON.parse(savedOffer);
            if (offer.name) setOfferName(offer.name);
        } catch(e) {}
    }

    const saved = localStorage.getItem('sbl_autosave_repurposer_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.url) setUrl(parsed.url);
        if (parsed.sections) setSections(parsed.sections);
        if (parsed.sources) setSources(parsed.sources);
      } catch (e) {}
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('sbl_autosave_repurposer_v2', JSON.stringify({ url, sections, sources }));
  }, [url, sections, sources]);

  const parseSections = (text: string) => {
    const markers = [
      "## SECTION 1: SEO-OPTIMIZED VIRAL TITLES",
      "## SECTION 2: HIGH-RETENTION SHORT SCRIPT",
      "## SECTION 3: X (TWITTER) VIRAL THREAD",
      "## SECTION 4: LINKEDIN AUTHORITY POST",
      "## SECTION 5: THUMBNAIL CREATIVE BRIEF"
    ];

    const results: {title: string, content: string}[] = [];
    
    markers.forEach((marker, idx) => {
        const start = text.indexOf(marker);
        if (start === -1) return;
        
        const contentStart = start + marker.length;
        let contentEnd = text.length;
        
        // Find next marker for end
        let nextMarkerIdx = -1;
        for (let j = idx + 1; j < markers.length; j++) {
            const nextM = text.indexOf(markers[j]);
            if (nextM !== -1) {
                nextMarkerIdx = nextM;
                break;
            }
        }
        if (nextMarkerIdx !== -1) contentEnd = nextMarkerIdx;
        
        results.push({
            title: marker.replace('## SECTION ' + (idx + 1) + ': ', ''),
            content: text.substring(contentStart, contentEnd).trim()
        });
    });

    if (results.length === 0) return [{ title: 'Overview', content: text }];
    return results;
  };

  const handleProcess = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setSections([]);
    setSources([]);
    try {
      const response = await repurposeYouTubeVideo(url, offerName);
      const parsed = parseSections(response.text);
      setSections(parsed);
      setSources(response.sources);
      trackEvent('post_generated');
    } catch (e) {
      alert("Analysis failed. Ensure the URL is valid.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
      setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUoIEdlbWluaSBXZWJzZWFyY2ggZ3JvdW5kaW5nIFRvb2wgTmV3IFZlcnNpb24%3D');
      setOfferName('AI-Powered Business Launch System');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSectionContent = (key: string) => sections.find(s => s.title.includes(key))?.content || "";

  // Helper to parse individual titles from Markdown list
  const parseTitlesToList = (markdown: string) => {
    return markdown
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('**'))
      .map(line => line.replace(/^(\d+\.|-|\*)\s+/, ''))
      .filter(line => line.length > 3);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Viral Video Repurposer</h1>
          <p className="text-gray-400 mt-2 text-lg">Convert any YouTube asset into a viral vertical strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-dark-card rounded-3xl border border-gray-800 p-8 shadow-premium space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-black text-brand-500 uppercase tracking-widest ml-1">Analysis Target</label>
                        <button onClick={loadExample} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
                            Load Quick Example
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Youtube className="h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                        </div>
                        <input 
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube URL..."
                            className="block w-full pl-12 pr-4 py-4 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 shadow-inner"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bridge to Offer</label>
                    <div className="relative">
                         <Target className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                         <textarea 
                            value={offerName}
                            onChange={(e) => setOfferName(e.target.value)}
                            placeholder="e.g. SBL System Monetizer"
                            className="block w-full pl-12 pr-4 py-4 bg-dark-input border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-gray-600 h-24 resize-none"
                         />
                    </div>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !url.trim()}
                    className={`w-full py-4 rounded-2xl font-black text-white shadow-glow transition-all flex items-center justify-center gap-3 border-2 border-transparent uppercase tracking-widest text-sm
                        ${loading || !url.trim() ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 active:scale-95 shadow-brand-900/20'}`}
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    {loading ? 'Synthesizing...' : 'Repurpose Now'}
                </button>
            </div>

            {/* Case Study Feature */}
            {!loading && sections.length === 0 && (
                <div className="bg-gradient-to-br from-blue-900/20 to-brand-900/10 rounded-3xl border border-blue-500/20 p-6 shadow-xl group hover:border-blue-500/40 transition-all cursor-pointer" onClick={loadExample}>
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Featured Case Study</h3>
                    </div>
                    <p className="text-sm text-gray-300 font-bold mb-2">Gemini Websearch Grounding Analysis</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        See how we repurpose technical AI tool tutorials into high-converting Viral Suites for the SBL System.
                    </p>
                    <div className="mt-4 flex justify-end">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Click to Load <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            )}

            {sources.length > 0 && (
                <div className="bg-dark-card rounded-3xl border border-gray-800 p-6 shadow-premium">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Globe size={12} /> Sources Analyzed
                    </h4>
                    <div className="space-y-2">
                        {sources.map((source, i) => (
                            <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-dark-input hover:bg-dark-input/80 border border-gray-800 rounded-xl text-[10px] text-gray-400 hover:text-white transition-all group"
                            >
                                <ExternalLink size={10} className="shrink-0 text-blue-500" />
                                <span className="truncate flex-1">{source.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 flex flex-col min-h-[700px]">
            {loading ? (
                <div className="flex-1 bg-dark-card border border-gray-800 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 shadow-premium">
                    <div className="relative w-20 h-20 mb-8">
                        <Loader2 className="w-20 h-20 text-brand-500 animate-spin absolute inset-0 opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pattern Extraction in Progress</h3>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Identifying high-value grounding points and drafting your multi-channel Viral Post Suite.</p>
                </div>
            ) : sections.length > 0 ? (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Navigation Tabs */}
                    <div className="flex bg-dark-card border border-gray-800 p-1.5 rounded-2xl w-fit overflow-x-auto custom-scrollbar shrink-0">
                        <button 
                            onClick={() => setActivePreview('titles')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activePreview === 'titles' ? 'bg-brand-500 text-white shadow-glow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <FileText size={14} /> Titles
                        </button>
                        <button 
                            onClick={() => setActivePreview('script')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activePreview === 'script' ? 'bg-brand-500 text-white shadow-glow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Smartphone size={14} /> Script
                        </button>
                        <button 
                            onClick={() => setActivePreview('x-thread')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activePreview === 'x-thread' ? 'bg-brand-500 text-white shadow-glow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Twitter size={14} /> X Thread
                        </button>
                        <button 
                            onClick={() => setActivePreview('linkedin')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activePreview === 'linkedin' ? 'bg-brand-500 text-white shadow-glow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Linkedin size={14} /> LinkedIn
                        </button>
                        <button 
                            onClick={() => setActivePreview('thumbnail')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activePreview === 'thumbnail' ? 'bg-brand-500 text-white shadow-glow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ImageIcon size={14} /> Thumbnail
                        </button>
                    </div>

                    {/* Content Display */}
                    <div className="flex-1 bg-dark-card border border-gray-800 rounded-[2rem] shadow-premium overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-dark-card/30">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">
                                {activePreview.replace('-', ' ').toUpperCase()} SUITE
                            </h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => saveItem({ type: 'Post', content: getSectionContent(activePreview.toUpperCase()), title: `Repurposed: ${activePreview}` })}
                                    className="p-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
                                    title="Save to Library"
                                >
                                    <Bookmark size={18} />
                                </button>
                                <button 
                                    onClick={() => copyToClipboard(getSectionContent(activePreview.toUpperCase()), activePreview)}
                                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow active:scale-95 flex items-center gap-2"
                                >
                                    {copiedId === activePreview ? <Check size={14} /> : <Copy size={14} />}
                                    {copiedId === activePreview ? 'Copied' : 'Copy All'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                             {activePreview === 'script' ? (
                                 <div className="max-w-md mx-auto bg-black rounded-[3rem] border-[12px] border-gray-800 shadow-2xl overflow-hidden aspect-[9/19] flex flex-col relative">
                                     {/* Fake Phone UI */}
                                     <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-8 text-[10px] text-gray-500 font-bold z-10 pt-4">
                                         <span>9:41</span>
                                         <div className="flex gap-1.5">
                                             <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                             <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                         </div>
                                     </div>
                                     <div className="flex-1 p-8 pt-16 flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900">
                                         <div className="flex-1 overflow-y-auto custom-scrollbar-hide prose prose-invert prose-sm">
                                             <ReactMarkdown>{getSectionContent('SCRIPT')}</ReactMarkdown>
                                         </div>
                                         <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-black text-xs">SBL</div>
                                             <div className="flex-1 space-y-1">
                                                 <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                                                 <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                                             </div>
                                             <Share2 size={18} className="text-white/40" />
                                         </div>
                                     </div>
                                 </div>
                             ) : activePreview === 'titles' ? (
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {parseTitlesToList(getSectionContent('TITLES')).map((titleText, idx) => (
                                        <div 
                                            key={idx} 
                                            className="group bg-dark-input/50 border border-gray-800 hover:border-brand-500/50 p-6 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-dark-input hover:shadow-glow-sm"
                                        >
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1 opacity-50">Variant 0{idx + 1}</div>
                                                <p className="text-white font-bold text-lg leading-snug">{titleText}</p>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(titleText, `title-variant-${idx}`)}
                                                className="shrink-0 p-3 bg-gray-800/50 hover:bg-brand-500/20 text-gray-400 hover:text-brand-500 rounded-xl transition-all border border-gray-700 group-hover:border-brand-500/30"
                                                title="Copy Title"
                                            >
                                                {copiedId === `title-variant-${idx}` ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                 <div className="prose prose-invert prose-lg max-w-none prose-headings:text-brand-400 prose-strong:text-white leading-relaxed">
                                     <ReactMarkdown>{getSectionContent(activePreview.toUpperCase().replace('-', ' '))}</ReactMarkdown>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 border-2 border-dashed border-gray-800 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 text-gray-600">
                    <Monitor className="w-20 h-20 mb-6 opacity-10" />
                    <h3 className="text-xl font-bold text-gray-500 mb-2">No Content Active</h3>
                    <p className="text-sm max-w-xs mx-auto">Paste a YouTube URL to generate your high-leverage Viral Post Suite.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoRepurposer;
