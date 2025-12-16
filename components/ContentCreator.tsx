
import React, { useState, useRef, useEffect } from 'react';
import { generateViralPost, ViralPostParams } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { Loader2, Copy, Check, Zap, Target, Upload, Link as LinkIcon, MessageCircle, Repeat, Trash2, Image as ImageIcon, Sparkles, Youtube, Shield, FileText, MonitorPlay, Linkedin, Facebook, Instagram, Twitter, History, RotateCcw, ClipboardCopy, Edit3, AlertCircle, Save, Layers, Eye, Layout, Heart, Share, PenLine, ArrowRight, Bookmark, X, AtSign, BadgeCheck, ChevronRight, ChevronLeft, RefreshCw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toPng } from 'html-to-image';

const ContentCreator: React.FC = () => {
  // State Definitions
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [editableImagePrompt, setEditableImagePrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'Main' | 'Slides'>('Main');
  
  // Interactive State for Editing
  const [carouselSlides, setCarouselSlides] = useState<string[]>([]);
  const [viralComments, setViralComments] = useState<string[]>([]);
  
  // Form State
  const [selectedTopic, setSelectedTopic] = useState('Business Growth');
  const [customTopic, setCustomTopic] = useState('');
  const [style, setStyle] = useState<ViralPostParams['style']>('CTA-Driven');
  const [platform, setPlatform] = useState<ViralPostParams['platform']>('LinkedIn');
  const [isThread, setIsThread] = useState(false);
  const [offerName, setOfferName] = useState('');
  const [offerLink, setOfferLink] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedHook, setSelectedHook] = useState('Curiosity Gap');
  const [handle, setHandle] = useState('@username');
  const [language, setLanguage] = useState('English');
  const [contentUrl, setContentUrl] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [copiedSectionIndex, setCopiedSectionIndex] = useState<number | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // AUTO-SAVE: Load data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('sbl_autosave_content_creator');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.selectedTopic) setSelectedTopic(parsed.selectedTopic);
            if (parsed.customTopic) setCustomTopic(parsed.customTopic);
            if (parsed.style) setStyle(parsed.style);
            if (parsed.platform) setPlatform(parsed.platform);
            if (parsed.offerName) setOfferName(parsed.offerName);
            if (parsed.offerLink) setOfferLink(parsed.offerLink);
            if (parsed.offerDescription) setOfferDescription(parsed.offerDescription);
            if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
            if (parsed.handle) setHandle(parsed.handle);
            if (parsed.contentUrl) setContentUrl(parsed.contentUrl);
            if (parsed.selectedHook) setSelectedHook(parsed.selectedHook);
            
            // Restore generated results
            if (parsed.generatedContent) setGeneratedContent(parsed.generatedContent);
            if (parsed.sections) setSections(parsed.sections);
            if (parsed.profileImage) setProfileImage(parsed.profileImage);
            if (parsed.carouselSlides) setCarouselSlides(parsed.carouselSlides);
            if (parsed.viralComments) setViralComments(parsed.viralComments);
        } catch (e) {
            console.error("Failed to load auto-saved content creator data", e);
        }
    }
  }, []);

  // AUTO-SAVE: Save data on change
  useEffect(() => {
    const dataToSave = {
        selectedTopic,
        customTopic,
        style,
        platform,
        offerName,
        offerLink,
        offerDescription,
        targetAudience,
        handle,
        contentUrl,
        selectedHook,
        generatedContent,
        sections,
        profileImage,
        carouselSlides,
        viralComments
    };
    localStorage.setItem('sbl_autosave_content_creator', JSON.stringify(dataToSave));
  }, [selectedTopic, customTopic, style, platform, offerName, offerLink, offerDescription, targetAudience, handle, contentUrl, selectedHook, generatedContent, sections, profileImage, carouselSlides, viralComments]);

  const validateForm = () => {
    if (selectedTopic === 'Other / Custom' && !customTopic) {
      alert("Please enter a custom topic.");
      return false;
    }
    if (!offerName) {
      alert("Please enter an offer name.");
      return false;
    }
    return true;
  };

  const clearForm = () => {
      if(window.confirm("Clear all fields and start fresh?")) {
          setCustomTopic('');
          setOfferName('');
          setOfferLink('');
          setOfferDescription('');
          setTargetAudience('');
          setHandle('@username');
          setContentUrl('');
          setProfileImage(null);
          setGeneratedContent('');
          setSections([]);
          setCarouselSlides([]);
          setViralComments([]);
          localStorage.removeItem('sbl_autosave_content_creator');
      }
  };

  const extractCarouselSlides = (content: string): string[] => {
      return content.split(/Slide \d+:/i).filter(s => s.trim().length > 0).map(s => s.trim());
  };

  const extractComments = (content: string): string[] => {
      // Legacy check for explicit numbering if AI falls back
      if (content.includes('**Comment')) {
          return content.split(/\*\*Comment \d+.*?\*\*:/i)
              .map(c => c.trim())
              .filter(c => c.length > 5);
      }

      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const comments: string[] = [];
      let currentBuffer = "";
      let isCollectingFinal = false;

      lines.forEach((line) => {
          // Detect start of final comment
          if (line.startsWith('🎯') || line.includes("Here’s what happens")) {
              if (currentBuffer) comments.push(currentBuffer);
              currentBuffer = line;
              isCollectingFinal = true;
              return;
          }

          if (isCollectingFinal) {
              // We are in the final comment, append everything (bullets, link, etc)
              currentBuffer += '\n' + line;
          } else {
              // Regular comments (1-7)
              // If line starts with "Strategy #", it's a new comment.
              if (line.match(/^Strategy #\d+/i)) {
                  if (currentBuffer) comments.push(currentBuffer);
                  currentBuffer = line;
              } else {
                  // This handles Comment 1 or continuations if the AI added unexpected newlines
                  if (!currentBuffer) {
                      currentBuffer = line;
                  } else {
                      // Append to current buffer to keep things together if they split lines
                      currentBuffer += ' ' + line;
                  }
              }
          }
      });
      
      if (currentBuffer) comments.push(currentBuffer);
      
      return comments;
  };

  const parseContentIntoSections = (text: string) => {
      const lines = text.split('\n');
      const parsedSections: { title: string; content: string }[] = [];
      
      let currentTitle = 'Main Content';
      let currentLines: string[] = [];
      
      const sectionHeaderRegex = /^\*\*(SECTION \d+: .*?)\*\*$/i;

      lines.forEach((line) => {
          const match = line.trim().match(sectionHeaderRegex);
          if (match) {
              // Save previous section
              if (currentLines.length > 0) {
                  const content = currentLines.join('\n').trim();
                  if (content.length > 0) {
                      parsedSections.push({
                          title: currentTitle,
                          content: content
                      });
                      
                      // Identify special sections for state
                      if (currentTitle.includes('CAROUSEL') || currentTitle.includes('THREAD')) {
                          setCarouselSlides(extractCarouselSlides(content));
                      }
                      if (currentTitle.includes('COMMENTS')) {
                          setViralComments(extractComments(content));
                      }
                  }
              }
              // Start new section
              currentTitle = match[1].replace(/SECTION \d+: /, '').toUpperCase();
              currentLines = [];
          } else {
              currentLines.push(line);
          }
      });

      // Push last section
      if (currentLines.length > 0) {
           const content = currentLines.join('\n').trim();
           parsedSections.push({
                title: currentTitle,
                content: content
           });
           
           if (currentTitle.includes('CAROUSEL') || currentTitle.includes('THREAD')) {
                setCarouselSlides(extractCarouselSlides(content));
           }
           if (currentTitle.includes('COMMENTS')) {
                setViralComments(extractComments(content));
           }
      }
      
      if (parsedSections.length === 0 && text.trim().length > 0) {
          return [{ title: 'GENERATED STRATEGY', content: text }];
      }

      return parsedSections;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSaved(false);
    setGeneratedContent('');
    setSections([]);
    setCarouselSlides([]);
    setViralComments([]);
    setGeneratedImage(null);
    setEditableImagePrompt(''); 
    setActiveTab('Main');
    
    try {
      const finalTopics = selectedTopic === 'Other / Custom' ? [customTopic] : [selectedTopic];

      const params: ViralPostParams = {
        style,
        platform,
        isThread,
        offerName,
        offerLink,
        offerDescription: offerDescription || "A valuable offer",
        targetAudience: targetAudience || "Everyone",
        topics: finalTopics,
        hookType: selectedHook,
        handle: handle || '@user',
        language: language,
        contentUrl: contentUrl || undefined,
        imageContext: profileImage ? {
            data: profileImage.split(',')[1],
            mimeType: profileImage.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || 'image/png'
        } : undefined
      };
      
      const result = await generateViralPost(params);
      trackEvent('post_generated');

      setGeneratedContent(result);
      const parsed = parseContentIntoSections(result);
      setSections(parsed);

    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!generatedContent) return;
    const success = saveItem({
      type: 'Post',
      content: generatedContent,
      title: `${style} for ${platform}: ${selectedTopic === 'Other / Custom' ? customTopic : selectedTopic}`,
    });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const copyText = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
  };

  const downloadComments = () => {
      if (viralComments.length === 0) return;
      const text = viralComments.map((c, i) => `Comment ${i+1}:\n${c}`).join('\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'viral-comments.txt';
      a.click();
      URL.revokeObjectURL(url);
  };

  const downloadSlide = async (id: string, index: number) => {
      const element = document.getElementById(id);
      if (element) {
          try {
              const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2 });
              const link = document.createElement('a');
              link.download = `sbl-carousel-slide-${index + 1}.png`;
              link.href = dataUrl;
              link.click();
          } catch (err) {
              console.error("Download failed", err);
              alert("Failed to download image.");
          }
      }
  };

  // Helper to extract items from list-based content (Hooks, Comments)
  const extractListItems = (content: string, prefixRegex: RegExp): string[] => {
      return content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.replace(prefixRegex, '').trim())
          .filter(line => line.length > 5); // Filter out empty or very short lines
  };

  // --------------------------------------------------------------------------
  // RENDERERS
  // --------------------------------------------------------------------------

  const renderHooks = (content: string) => {
      // Matches "Hook 1:", "- ", "* ", "1. "
      const hooks = extractListItems(content, /^(Hook \d+:?|[-•*]|\d+\.)\s*/i);
      
      return (
          <div className="grid gap-3">
              {hooks.map((hook, i) => {
                  const id = `hook-${i}`;
                  return (
                      <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-start gap-4 hover:border-brand-500/50 transition-colors group">
                          <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold text-xs px-2 py-1 rounded min-w-[24px] text-center mt-0.5">
                              {i + 1}
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 text-sm flex-1 pt-0.5">{hook}</p>
                          <button 
                              onClick={() => copyText(hook, id)}
                              className={`p-2 rounded-lg transition-colors ${copiedItem === id ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-brand-50 hover:text-brand-600'}`}
                          >
                              {copiedItem === id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                      </div>
                  );
              })}
          </div>
      );
  };

  const renderComments = () => {
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">Viral Thread Comments ({viralComments.length})</span>
                  </div>
                  <button 
                      onClick={downloadComments}
                      className="text-xs font-bold flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                      <Download className="w-3 h-3 mr-1" /> Download All
                  </button>
              </div>
              
              <div className="space-y-4">
                {viralComments.map((comment, i) => {
                    const id = `comment-${i}`;
                    return (
                        <div key={i} className="flex gap-3 group">
                            {/* Avatar */}
                            <div className="shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-100 dark:border-gray-600">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-600 text-white font-bold text-sm">
                                            {handle[1]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comment Bubble */}
                            <div className="flex-1 min-w-0">
                                <div className="bg-gray-100 dark:bg-gray-800/80 rounded-2xl p-4 rounded-tl-none border border-transparent focus-within:border-brand-300 dark:focus-within:border-brand-700 focus-within:bg-white dark:focus-within:bg-black transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {handle.replace('@', '') || 'User'}
                                            </span>
                                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-gray-400 font-mono">#{i + 1}</span>
                                            <button 
                                                onClick={() => copyText(comment, id)}
                                                className={`p-1.5 rounded-md transition-colors ${copiedItem === id ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-brand-600 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                                title="Copy"
                                            >
                                                {copiedItem === id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <textarea
                                        className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed resize-y min-h-[60px] p-0"
                                        value={comment}
                                        onChange={(e) => {
                                            const newComments = [...viralComments];
                                            newComments[i] = e.target.value;
                                            setViralComments(newComments);
                                        }}
                                        style={{ fieldSizing: 'content' } as any} // experimental css, but fallback is min-h
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-1 ml-2">
                                    <span className="text-xs font-bold text-gray-500 hover:underline cursor-pointer">Like</span>
                                    <span className="text-xs font-bold text-gray-500 hover:underline cursor-pointer">Reply</span>
                                    <span className="text-xs text-gray-400">{i === 0 ? 'Just now' : `${i + 2}m`}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
          </div>
      );
  };

  const renderTweets = (content: string) => {
      const tweets = extractListItems(content, /^(Tweet \d+:?|Thread \d+:?)\s*/i);
      
      return (
          <div className="space-y-6 max-w-xl mx-auto">
              {tweets.map((tweet, i) => {
                  const id = `tweet-${i}`;
                  return (
                      <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          {/* Twitter Header */}
                          <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-500 text-white font-bold">
                                            {handle[1]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                            {handle.replace('@', '') || 'User'}
                                        </span>
                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-current" />
                                        <span className="text-gray-500 text-sm truncate">{handle}</span>
                                        <span className="text-gray-500 text-sm">· 2h</span>
                                    </div>
                                    <p className="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap mt-1">
                                        {tweet}
                                    </p>
                                </div>
                          </div>

                          {/* Twitter Footer Stats (Fake) */}
                          <div className="flex justify-between items-center text-gray-500 mt-3 px-2">
                                <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-500">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs">24</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-pointer hover:text-green-500">
                                    <Repeat className="w-4 h-4" />
                                    <span className="text-xs">12</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-pointer hover:text-pink-500">
                                    <Heart className="w-4 h-4" />
                                    <span className="text-xs">148</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-500">
                                    <Share className="w-4 h-4" />
                                </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                <button 
                                  onClick={() => copyText(tweet, id)}
                                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${copiedItem === id ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
                                >
                                    {copiedItem === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedItem === id ? 'Copied' : 'Copy Tweet'}
                                </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  const formatSlideContent = (text: string) => {
    // Regex matches for special color syntax: **Blue**, ((Red)), {{White}}, [[Light Blue]]
    const parts = text.split(/(\*\*.*?\*\*|\(\(.*?\)\)|\{\{.*?\}\}|\[\[.*?\]\])/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <span key={index} className="text-blue-400 font-bold">{part.slice(2, -2)}</span>;
        }
        if (part.startsWith('((') && part.endsWith('))')) {
            return <span key={index} className="text-red-500 font-bold">{part.slice(2, -2)}</span>;
        }
        if (part.startsWith('{{') && part.endsWith('}}')) {
            return <span key={index} className="text-white font-bold underline decoration-blue-500/30">{part.slice(2, -2)}</span>;
        }
        if (part.startsWith('[[') && part.endsWith(']]')) {
            return <span key={index} className="text-blue-200 font-bold">{part.slice(2, -2)}</span>;
        }
        return <span key={index}>{part}</span>;
    });
  };

  const renderCarousel = () => {
      if (carouselSlides.length === 0) return null;

      return (
          <div className="space-y-6">
              <div className="flex overflow-x-auto gap-6 pb-8 snap-x custom-scrollbar pl-2">
                  {carouselSlides.map((slideContent, i) => {
                      const id = `slide-${i}`;
                      return (
                          <div key={i} className="flex flex-col gap-3 group">
                              <div 
                                id={id}
                                className="min-w-[300px] w-[300px] h-[375px] bg-black text-white rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-gray-800 snap-center relative overflow-hidden"
                              >
                                  {/* Background Gradient Effect - Blue & Red Theme */}
                                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
                                  <div className="absolute top-20 left-0 w-24 h-24 bg-red-600/10 rounded-full blur-3xl"></div>
                                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

                                  <div className="relative z-10 flex-1 flex flex-col">
                                      <div className="flex justify-between items-center mb-6">
                                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{i + 1} / {carouselSlides.length}</span>
                                          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                                              {profileImage ? (
                                                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                              ) : (
                                                  <span className="text-[8px] font-bold text-gray-400">{handle[1]?.toUpperCase()}</span>
                                              )}
                                          </div>
                                      </div>
                                      
                                      {/* Editable Area */}
                                      <div className="w-full h-full flex flex-col justify-center">
                                          <div className="font-bold text-2xl leading-tight tracking-tight whitespace-pre-wrap font-sans">
                                              {formatSlideContent(slideContent)}
                                          </div>
                                      </div>
                                  </div>

                                  <div className="relative z-10 mt-2 flex items-end justify-between">
                                      <div className="text-[10px] font-bold text-gray-500 tracking-wide uppercase">
                                          {handle}
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Controls */}
                              <div className="flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                      onClick={() => copyText(slideContent, id)}
                                      className="text-xs text-gray-500 hover:text-brand-500 font-bold flex items-center"
                                  >
                                      {copiedItem === id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                      {copiedItem === id ? 'Copied' : 'Copy'}
                                  </button>
                                  <button 
                                      onClick={() => downloadSlide(id, i)}
                                      className="text-xs text-gray-500 hover:text-blue-500 font-bold flex items-center"
                                  >
                                      <Download className="w-3 h-3 mr-1" /> Download PNG
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
              <div className="flex justify-center text-xs text-gray-400 italic">
                  <ArrowRight className="w-3 h-3 mr-1" /> Scroll horizontally to see all slides.
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Viral LaunchPad</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate high-converting social media content with AI.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-brand-500" />
                Strategy Setup
                </h3>
                <button 
                    onClick={clearForm}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center transition-colors"
                    title="Clear Auto-Saved Data"
                >
                    <RefreshCw className="w-3 h-3 mr-1" /> Reset
                </button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Platform</label>
              <select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
              >
                <option>LinkedIn</option>
                <option>X (Twitter)</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>TikTok</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Social Handle</label>
              <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="socialHandle"
                    autoComplete="username"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hook Style</label>
              <select 
                value={selectedHook} 
                onChange={(e) => setSelectedHook(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
              >
                <option value="Curiosity Gap">Curiosity Gap (The "Wait, what?")</option>
                <option value="Bold Statement">Bold Statement / Contrarian</option>
                <option value="Question">Direct Question</option>
                <option value="Story Opener">Story Opener ("I lost everything...")</option>
                <option value="Negative/Fear">Negative/Fear ("Stop doing this")</option>
                <option value="How-To">Clear Value / How-To</option>
                <option value="High Impact">High Impact (General)</option>
                <option value="Shocking Statistic">Shocking Statistic</option>
                <option value="Anti-Conventional Wisdom">Anti-Conventional Wisdom</option>
                <option value="Personal Transformation">Personal Transformation</option>
                <option value="Results + Curiosity">Results + Curiosity</option>
                <option value="Controversy">Controversy</option>
                <option value="Social Proof">Social Proof</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Style</label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
              >
                <option value="CTA-Driven">CTA Driven (Sales)</option>
                <option value="Authority-Building">Authority Building</option>
                <option value="Viral-Redo">Viral Redo (Remix)</option>
                <option value="YouTube-Viral">YouTube to Social</option>
                <option value="Script-Generator">Video Script</option>
              </select>
            </div>
            
            {/* Always show URL input now for caption linking */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube / Source URL</label>
                <input
                  type="text"
                  name="contentUrl"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                />
            </div>

            {style !== 'YouTube-Viral' && style !== 'Viral-Redo' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Topic</label>
                <select 
                  value={selectedTopic} 
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white mb-2"
                >
                  <option>Business Growth</option>
                  <option>AI Automation</option>
                  <option>Marketing Strategy</option>
                  <option>Personal Development</option>
                  <option>Anti-9-5 / Career Freedom</option>
                  <option>AI / Technology Opportunity</option>
                  <option>Money Mindset / Investment</option>
                  <option>Business Results / Social Proof</option>
                  <option>Educational Value / How-To</option>
                  <option>Personal Stories / Transformation</option>
                  <option>Other / Custom</option>
                </select>
                {selectedTopic === 'Other / Custom' && (
                  <input
                    type="text"
                    name="customTopic"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter custom topic..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                  />
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
             <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
              <Target className="w-4 h-4 mr-2 text-brand-500" />
              Offer Details
            </h3>
            
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Offer Name</label>
               <input
                  type="text"
                  name="offerName"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  placeholder="e.g. The Viral Vault"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
               />
            </div>
            
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Offer URL (Optional)</label>
               <input
                  type="text"
                  name="offerLink"
                  value={offerLink}
                  onChange={(e) => setOfferLink(e.target.value)}
                  placeholder="https://your-offer.com"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
               />
            </div>

            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Audience</label>
               <input
                  type="text"
                  name="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. content creators"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
               />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Image (Profile / Context)</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {profileImage ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-dark-input/50 border border-gray-200 dark:border-gray-700 rounded-xl group hover:border-brand-500/30 transition-colors">
                    <img 
                      src={profileImage} 
                      alt="Context" 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Profile Image Set</p>
                      <p className="text-[10px] text-gray-500 truncate">Used for Tweets & Context</p>
                    </div>
                    <button 
                      onClick={() => {
                        setProfileImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all flex items-center justify-center font-bold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Context Image
                  </button>
                )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center border-2 border-transparent
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
            {loading ? 'Generating Strategy...' : 'Generate Viral Content'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
          {sections.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-bold text-gray-900 dark:text-white">Generated Strategy</h3>
                  <div className="flex gap-2">
                    <button 
                       onClick={handleSave}
                       className="flex items-center px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                        {saved ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Bookmark className="w-3 h-3 mr-1" />}
                        {saved ? 'Saved' : 'Save'}
                    </button>
                    <button 
                       onClick={() => navigator.clipboard.writeText(generatedContent)}
                       className="flex items-center px-3 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-500"
                    >
                        <Copy className="w-3 h-3 mr-1" /> Copy All
                    </button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50 dark:bg-gray-900/50 space-y-6">
                  {sections.map((section, idx) => {
                      const isHooks = section.title.includes('HOOKS');
                      const isComments = section.title.includes('COMMENTS');
                      const isTweets = section.title.includes('TWEETS') || section.title.includes('TWITTER');
                      const isCarousel = section.title.includes('CAROUSEL') || section.title.includes('THREAD');

                      return (
                          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-brand-600 dark:text-brand-400 uppercase text-xs tracking-wider">
                                      {section.title}
                                  </h4>
                                  {!isHooks && !isComments && !isTweets && !isCarousel && (
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(section.content);
                                            setCopiedSectionIndex(idx);
                                            setTimeout(() => setCopiedSectionIndex(null), 2000);
                                        }}
                                        className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                    >
                                        {copiedSectionIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedSectionIndex === idx ? 'Copied' : 'Copy Section'}
                                    </button>
                                  )}
                              </div>
                              
                              {isHooks ? (
                                  renderHooks(section.content)
                              ) : isComments ? (
                                  renderComments()
                              ) : isTweets ? (
                                  renderTweets(section.content)
                              ) : isCarousel ? (
                                  renderCarousel()
                              ) : (
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <ReactMarkdown>{section.content}</ReactMarkdown>
                                  </div>
                              )}
                          </div>
                      );
                  })}
               </div>
            </div>
          ) : (
            <div className="h-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-12 text-center text-gray-400">
               <Sparkles className="w-12 h-12 mb-4 opacity-50" />
               <p className="font-bold text-lg">Ready to Launch</p>
               <p className="text-sm">Configure your strategy on the left and hit generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
