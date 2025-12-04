
import React, { useState, useRef, useEffect } from 'react';
import { generateViralPost, ViralPostParams, generateImage, generateBlogPost, generateImageNano, generateImageNanoPro } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { Loader2, Copy, Check, Zap, Target, Upload, Link as LinkIcon, MessageCircle, Repeat, Trash2, Image as ImageIcon, Download, Sparkles, Youtube, Shield, FileText, MonitorPlay, Linkedin, Facebook, Instagram, Twitter, History, RotateCcw, ClipboardCopy, Edit3, AlertCircle, Save, Layers, Eye, Layout, Heart, Share, PenLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toPng } from 'html-to-image';
import GreenNovaLogo from './GreenNovaLogo';

const TOPICS = [
  "Anti-9-5 / GreenNova",
  "AI Tools & Strategies",
  "Money Mindset",
  "Results & Proof",
  "How-To / Tutorial",
  "Personal Stories",
  "Productivity Hacks",
  "Business Growth",
  "Passive Income",
  "Time Freedom",
  "Automation",
  "Side Hustle Ideas"
];

const HOOKS = [
  "Statistic Hook",
  "Anti-Conventional",
  "Transformation",
  "Results-Driven",
  "Controversial",
  "Social Proof",
  "Myth-Busting",
  "Comparison (Before/After)",
  "Surprise Me!",
  "Custom (Enter Your Own)"
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Hindi"];

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "X (Twitter)", "TikTok", "YouTube"];

// High-visibility Verified Badge (Solid Blue with White Check)
const VerifiedBadge = () => (
    <span className="inline-flex items-center justify-center ml-1 align-middle" title="Verified">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 12.5C22.5 10.92 21.625 9.55 20.352 8.9C20.506 8.465 20.59 7.995 20.59 7.5C20.59 5.29 18.88 3.502 16.772 3.502C16.302 3.502 15.852 3.586 15.436 3.752C14.818 2.415 13.51 1.5 12 1.5C10.49 1.5 9.184 2.417 8.563 3.75C8.148 3.585 7.697 3.5 7.227 3.5C5.117 3.5 3.409 5.29 3.409 7.5C3.409 7.995 3.492 8.465 3.647 8.9C2.375 9.55 1.5 10.918 1.5 12.5C1.5 13.995 2.282 15.298 3.442 15.986C3.422 16.156 3.41 16.326 3.41 16.5C3.41 18.71 5.118 20.5 7.228 20.5C7.698 20.5 8.148 20.414 8.563 20.25C9.184 21.584 10.49 22.5 12.001 22.5C13.513 22.5 14.819 21.584 15.438 20.25C15.853 20.413 16.303 20.498 16.774 20.498C18.884 20.498 20.592 18.708 20.592 16.5C20.592 16.326 20.58 16.156 20.559 15.987C21.717 15.3 22.502 13.997 22.502 12.502L22.5 12.5Z" fill="#1D9BF0"/>
            <path d="M10.208 16.6667L6.45801 12.9167L7.70801 11.6667L10.208 14.1667L16.458 7.91669L17.708 9.16669L10.208 16.6667Z" fill="white"/>
        </svg>
    </span>
);

// Helper to render text with viral styles (Yellow highlights for bold, Blue for hashtags/links)
const FormattedViralText = ({ text }: { text: string }) => {
    // Regex matches:
    // **bold** (Yellow)
    // [[bracket]] (Blue Underline)
    // #hashtag, @handle, http links (Blue)
    const regex = /(\*\*.*?\*\*|\[\[.*?\]\]|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+|https?:\/\/[^\s]+)/g;
    const parts = text.split(regex);
    
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    // Viral Yellow Highlight Style
                    return <span key={index} className="font-bold text-[#facc15] bg-[#facc15]/10 px-0.5 rounded decoration-[#facc15] underline underline-offset-4 decoration-2">{part.slice(2, -2)}</span>;
                }
                if (part.startsWith('\[\[') && part.endsWith(']]')) {
                    // Viral Blue Underline Style
                    return <span key={index} className="text-[#3b82f6] font-bold underline decoration-2 decoration-[#3b82f6] underline-offset-4">{part.slice(2, -2)}</span>;
                }
                if (part.startsWith('#') || part.startsWith('@') || part.startsWith('http')) {
                    // Blue Link Style
                    return <span key={index} className="text-[#1D9BF0] font-medium hover:underline cursor-pointer">{part}</span>;
                }
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};

const ContentCreator: React.FC = () => {
  const [style, setStyle] = useState<'CTA-Driven' | 'Authority-Building' | 'YouTube-Viral' | 'Script-Generator'>('CTA-Driven');
  const [platform, setPlatform] = useState<any>('Facebook');
  const [isThread, setIsThread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string>('');
  const [isRestored, setIsRestored] = useState(false);

  // Form State
  const [offerName, setOfferName] = useState('');
  const [offerLink, setOfferLink] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [handle, setHandle] = useState('@greennovasystems');
  const [contentUrl, setContentUrl] = useState('');
  
  // New Form Fields
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedHook, setSelectedHook] = useState('');
  const [language, setLanguage] = useState('English');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tab State for Results
  const [activeTab, setActiveTab] = useState<'Main' | 'Blog' | 'Image' | 'Comments' | 'Carousel' | 'Tweets'>('Main');
  const [carouselViewMode, setCarouselViewMode] = useState<'visual' | 'text'>('visual');
  const [carouselStyle, setCarouselStyle] = useState<'classic' | 'tweet-light' | 'tweet-dark'>('classic');
  const [editableSlides, setEditableSlides] = useState<string[]>([]);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [downloadingSlideId, setDownloadingSlideId] = useState<string | null>(null);

  // Image Gen State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingNano, setGeneratingNano] = useState(false);
  const [editableImagePrompt, setEditableImagePrompt] = useState(''); // New editable state
  
  // Blog Regen State
  const [regeneratingBlog, setRegeneratingBlog] = useState(false);
  
  // Comment Copy State
  const [copiedCommentIndex, setCopiedCommentIndex] = useState<number | null>(null);
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseSection = (text: string, sectionName: string) => {
    if (!text) return '';
    // Regex matches **SECTION X: TITLE** content until the next **SECTION
    const regex = new RegExp(`\\*\\*SECTION \\d+: ${sectionName}[^\\*]*\\*\\*([\\s\\S]*?)(?=\\*\\*SECTION|$)`, 'i');
    let match = text.match(regex);
    
    // Fallback if header doesn't have number or exact format
    if (!match) {
        const simpleRegex = new RegExp(`\\*\\*${sectionName}[^\\*]*\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
        match = text.match(simpleRegex);
    }
    
    return match ? match[1].trim() : '';
  };

  // Sync editable prompt with generated content when content changes
  useEffect(() => {
    if (generatedContent) {
        const extractedPrompt = parseSection(generatedContent, 'VIRAL IMAGE PROMPT');
        // Only update if it's different to avoid overwriting user edits if they are typing while this runs (rare but safe)
        if (extractedPrompt && !editableImagePrompt) {
            setEditableImagePrompt(extractedPrompt);
        }

        // Parse slides
        const carouselContent = parseSection(generatedContent, 'INSTAGRAM THREAD') || parseSection(generatedContent, 'INSTAGRAM CAROUSEL');
        const mainBody = parseSection(generatedContent, 'MAIN POST BODY') || parseSection(generatedContent, 'MAIN POST') || parseSection(generatedContent, 'FULL SCRIPT');
        
        let parsedSlides = carouselContent 
            ? carouselContent.split(/Slide \d+:/i).filter(s => s.trim().length > 10).map(s => s.trim())
            : [];
        
        if (parsedSlides.length === 0 && mainBody) {
            const chunks = mainBody.split('\n\n').filter(s => s.trim().length > 0);
            if (chunks.length > 0) parsedSlides = chunks;
        }

        if (parsedSlides.length > 0) {
            setEditableSlides(parsedSlides);
        }
    }
  }, [generatedContent]);

  // Load Auto-Saved Data on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('gn_content_autosave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.offerName) setOfferName(parsed.offerName);
        if (parsed.offerLink) setOfferLink(parsed.offerLink);
        if (parsed.offerDescription) setOfferDescription(parsed.offerDescription);
        if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
        if (parsed.handle) setHandle(parsed.handle);
        
        // Extended Fields
        if (parsed.style) setStyle(parsed.style);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.contentUrl) setContentUrl(parsed.contentUrl);
        if (parsed.selectedTopic) setSelectedTopic(parsed.selectedTopic);
        if (parsed.selectedHook) setSelectedHook(parsed.selectedHook);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.profileImage) setProfileImage(parsed.profileImage);
        
        // Text Content & Image Prompt
        if (parsed.generatedContent) setGeneratedContent(parsed.generatedContent);
        if (parsed.generatedImage) setGeneratedImage(parsed.generatedImage);
        if (parsed.editableImagePrompt) setEditableImagePrompt(parsed.editableImagePrompt);
        
        if (parsed.generatedContent || parsed.offerName) {
            setAutoSavedTime('Session Restored');
        }
      } catch (e) { console.error(e); }
    }
    // Mark as restored so auto-save can resume
    setIsRestored(true);
  }, []);

  // Auto-Save
  useEffect(() => {
    // Prevent overwriting local storage with empty initial state on mount
    if (!isRestored) return;

    const baseData = {
      offerName, 
      offerLink, 
      offerDescription, 
      targetAudience, 
      handle,
      style,
      platform,
      contentUrl,
      selectedTopic,
      selectedHook,
      language,
      generatedContent,
      editableImagePrompt,
      activeTab
    };

    try {
        // Attempt to save everything including images
        localStorage.setItem('gn_content_autosave', JSON.stringify({ ...baseData, generatedImage, profileImage }));
        
        if (offerName || generatedContent) {
            const now = new Date();
            setAutoSavedTime(`Auto-saved ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
        }
    } catch (e) {
        // If image is too big, save text only
        console.warn("Storage quota exceeded, saving text only.");
        try {
            localStorage.setItem('gn_content_autosave', JSON.stringify({ ...baseData, generatedImage: null, profileImage: null }));
            if (offerName || generatedContent) {
                const now = new Date();
                setAutoSavedTime(`Auto-saved (Text Only) ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
            }
        } catch (e2) {
            console.error("Auto-save failed completely", e2);
        }
    }
  }, [offerName, offerLink, offerDescription, targetAudience, handle, style, platform, contentUrl, selectedTopic, selectedHook, language, generatedContent, generatedImage, editableImagePrompt, activeTab, profileImage, isRestored]);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setProfileImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleManualAutoFill = () => {
    const savedData = localStorage.getItem('gn_content_autosave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.offerName) setOfferName(parsed.offerName);
        if (parsed.offerLink) setOfferLink(parsed.offerLink);
        if (parsed.offerDescription) setOfferDescription(parsed.offerDescription);
        if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
        if (parsed.handle) setHandle(parsed.handle);
        if (parsed.style) setStyle(parsed.style);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.contentUrl) setContentUrl(parsed.contentUrl);
        if (parsed.selectedTopic) setSelectedTopic(parsed.selectedTopic);
        if (parsed.selectedHook) setSelectedHook(parsed.selectedHook);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.profileImage) setProfileImage(parsed.profileImage);

        if (parsed.generatedContent) setGeneratedContent(parsed.generatedContent);
        if (parsed.generatedImage) setGeneratedImage(parsed.generatedImage);
        if (parsed.editableImagePrompt) setEditableImagePrompt(parsed.editableImagePrompt);
        
        setErrors({}); // Clear errors on restore
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        alert("Session restored successfully!");
      } catch (e) { console.error(e); }
    } else {
        alert("No saved session found.");
    }
  };

  const handleDeleteSession = () => {
      if(window.confirm("Are you sure you want to delete this session? This will clear all fields, generated text, and images.")) {
        setOfferName('');
        setOfferLink('');
        setOfferDescription('');
        setTargetAudience('');
        setHandle('@greennovasystems');
        setContentUrl('');
        setSelectedTopic('');
        setSelectedHook('');
        setGeneratedContent('');
        setGeneratedImage(null);
        setEditableImagePrompt('');
        setProfileImage(null);
        setErrors({});
        localStorage.removeItem('gn_content_autosave');
        setAutoSavedTime('');
      }
  };

  const handleSaveDraft = () => {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
  };

  const validateUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!offerName.trim()) {
        newErrors.offerName = "Offer Name is required";
        isValid = false;
    }

    if (offerLink.trim() && !validateUrl(offerLink)) {
        newErrors.offerLink = "Please enter a valid URL (include http:// or https://)";
        isValid = false;
    }

    if (!targetAudience.trim()) {
        newErrors.targetAudience = "Target Audience is required";
        isValid = false;
    }

    if (!handle.trim()) {
        newErrors.handle = "Social Handle is required";
        isValid = false;
    }

    if (!selectedTopic) {
        newErrors.selectedTopic = "Please select a topic";
        isValid = false;
    }

    if (!selectedHook) {
        newErrors.selectedHook = "Please select a hook style";
        isValid = false;
    }

    // Specific logic for Source URL based on Style
    if (style === 'YouTube-Viral') {
         if (!contentUrl.trim()) {
             newErrors.contentUrl = "Source URL is required for YouTube Viral mode";
             isValid = false;
         } else if (!validateUrl(contentUrl)) {
             newErrors.contentUrl = "Please enter a valid URL";
             isValid = false;
         }
    } else if (style === 'Script-Generator') {
         if (!selectedTopic && !contentUrl.trim()) {
             newErrors.contentUrl = "Please provide a Topic above or a Source URL here";
             isValid = false;
         }
         if (contentUrl.trim() && !validateUrl(contentUrl)) {
             newErrors.contentUrl = "Please enter a valid URL";
             isValid = false;
         }
    } else {
         // Other modes, contentUrl is optional but must be valid if present
         if (contentUrl.trim() && !validateUrl(contentUrl)) {
             newErrors.contentUrl = "Please enter a valid URL";
             isValid = false;
         }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSaved(false);
    setGeneratedContent('');
    setGeneratedImage(null);
    setEditableImagePrompt(''); // Clear previous prompt
    setActiveTab('Main');
    setEditableSlides([]);
    
    try {
      const params: ViralPostParams = {
        style,
        platform,
        isThread,
        offerName,
        offerLink,
        offerDescription: offerDescription || "A valuable offer",
        targetAudience: targetAudience || "Entrepreneurs",
        topics: selectedTopic ? [selectedTopic] : [],
        hookType: selectedHook || "High Impact",
        handle: handle || '@user',
        language: language,
        contentUrl: (style === 'YouTube-Viral' || style === 'Script-Generator') ? contentUrl : undefined,
        imageContext: profileImage ? {
            data: profileImage.split(',')[1],
            // Robust MimeType extraction
            mimeType: profileImage.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || 'image/png'
        } : undefined
      };
      
      const result = await generateViralPost(params);
      setGeneratedContent(result);
      
      // Immediately extract and set prompt to avoid delay/sync issues
      const extractedPrompt = parseSection(result, 'VIRAL IMAGE PROMPT');
      if (extractedPrompt) setEditableImagePrompt(extractedPrompt);

      // AUTOMATICALLY SAVE TO LIBRARY (PERSISTENT STORAGE)
      // This ensures content is saved even if session is cleared or user logs out.
      saveItem({
          type: 'Post',
          content: result,
          title: `Auto-Generated: ${params.offerName} (${new Date().toLocaleString()})`
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (error) {
      console.error(error);
      alert("Failed to generate content. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = (index: number, value: string) => {
      const newSlides = [...editableSlides];
      newSlides[index] = value;
      setEditableSlides(newSlides);
  };

  const handleDownloadSlide = async (index: number) => {
      const elementId = `slide-node-${index}`;
      const node = document.getElementById(elementId);
      
      if (!node) {
          console.error("Node not found", elementId);
          return;
      }
      
      setDownloadingSlideId(elementId);
      
      try {
          const dataUrl = await toPng(node, { 
              cacheBust: true,
              style: { transform: 'scale(1)' }, // Prevent scaling issues
          });
          
          const link = document.createElement('a');
          link.download = `GreenNova-Slide-${index + 1}.png`;
          link.href = dataUrl;
          link.click();
      } catch (err) {
          console.error('Failed to download image', err);
          alert('Failed to generate image. Please try again.');
      } finally {
          setDownloadingSlideId(null);
      }
  };

  const handleCopyHook = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedHookIndex(index);
      setTimeout(() => setCopiedHookIndex(null), 2000);
  };

  // Parsed Content
  const mainHook = parseSection(generatedContent, '7 VIRAL HOOKS') || parseSection(generatedContent, '5 VIRAL HOOKS') || parseSection(generatedContent, 'MAIN VIRAL HOOK') || parseSection(generatedContent, 'MAIN HOOK') || parseSection(generatedContent, 'VIDEO METADATA');
  const miniBlog = parseSection(generatedContent, 'VIRAL MINI-BLOG') || parseSection(generatedContent, 'MINI-BLOG');
  const comments = parseSection(generatedContent, '9 VIRAL COMMENTS') || parseSection(generatedContent, '9 COMMENTS');
  const carouselContent = parseSection(generatedContent, 'INSTAGRAM THREAD') || parseSection(generatedContent, 'INSTAGRAM CAROUSEL');
  const tweetsContent = parseSection(generatedContent, '5 VIRAL TWEETS') || parseSection(generatedContent, 'VIRAL TWEETS');
  const mainBody = parseSection(generatedContent, 'MAIN POST BODY') || parseSection(generatedContent, 'MAIN POST') || parseSection(generatedContent, 'FULL SCRIPT');
  
  // Parse Tweets
  const tweets = tweetsContent 
    ? tweetsContent.split(/Tweet \d+:/i).filter(s => s.trim().length > 5).map(s => s.trim())
    : [];
    
  // Parse Hooks (if multiple)
  const hooksList = mainHook 
    ? mainHook.split(/(?:Hook \d+:|Option \d+:)/i).filter(s => s.trim().length > 5).map(s => s.trim())
    : [];
  // Fallback if parsing fails but content exists
  const displayHooks = hooksList.length > 0 ? hooksList : (mainHook ? [mainHook] : []);

  const displayContent = mainHook ? (
      activeTab === 'Main' ? `${mainHook}\n\n${mainBody}` :
      activeTab === 'Blog' ? miniBlog :
      activeTab === 'Image' ? editableImagePrompt :
      activeTab === 'Carousel' ? carouselContent :
      activeTab === 'Tweets' ? tweetsContent :
      comments
  ) : generatedContent;

  const handleGenerateImage = async () => {
      if (!editableImagePrompt) return;
      setGeneratingImage(true);
      try {
          const img = await generateImage(editableImagePrompt);
          setGeneratedImage(img);
      } catch(e) { alert("Image Gen Failed"); }
      finally { setGeneratingImage(false); }
  };

  const handleGenerateImageNano = async () => {
    if (!editableImagePrompt) return;
    setGeneratingNano(true);
    try {
        const img = await generateImageNano(editableImagePrompt);
        setGeneratedImage(img);
    } catch(e) { alert("Nano Image Gen Failed"); }
    finally { setGeneratingNano(false); }
  };

  const handleRegenerateBlog = async () => {
      setRegeneratingBlog(true);
      try {
          const newBlog = await generateBlogPost(miniBlog || generatedContent);
          // Update the generatedContent state so auto-save picks it up
          setGeneratedContent(prev => {
              if (miniBlog) {
                return prev.replace(miniBlog, newBlog);
              }
              return prev + `\n\n**SECTION 3: VIRAL MINI-BLOG**\n${newBlog}`;
          });
      } catch(e) { alert("Blog Regen Failed"); }
      finally { setRegeneratingBlog(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };
  
  const handleCopyComment = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCommentIndex(index);
    setTimeout(() => setCopiedCommentIndex(null), 2000);
  };

  const handleSave = () => {
     if (!generatedContent) return;
     saveItem({ type: 'Post', content: generatedContent, title: `LaunchPad: ${offerName}` });
     setSaved(true);
     setTimeout(() => setSaved(false), 3000);
  };

  const renderPlatformIcon = (p: string) => {
      switch(p) {
          case 'Facebook': return <Facebook className="w-3 h-3 mr-1" />;
          case 'Instagram': return <Instagram className="w-3 h-3 mr-1" />;
          case 'LinkedIn': return <Linkedin className="w-3 h-3 mr-1" />;
          case 'X (Twitter)': return <Twitter className="w-3 h-3 mr-1" />;
          case 'YouTube': return <Youtube className="w-3 h-3 mr-1" />;
          default: return <Zap className="w-3 h-3 mr-1" />;
      }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 animate-fade-in">
      
      <div className="flex items-center justify-between mb-8">
        <div>
             <h1 className="text-4xl font-serif font-bold text-white mb-2 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-brand-500" /> Generate Viral Post
             </h1>
             {autoSavedTime && (
                 <p className="text-[10px] text-gray-500 flex items-center gap-1 ml-11">
                     <Check className="w-3 h-3 text-green-500" /> {autoSavedTime}
                 </p>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
            
            {/* Content Mode */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold block">Content Mode *</label>
                    <div className="flex gap-2">
                        <button onClick={handleSaveDraft} className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center transition-colors" title="Save current form as draft">
                             {draftSaved ? <Check className="w-3 h-3 mr-1" /> : <Save className="w-3 h-3 mr-1" />} 
                             {draftSaved ? 'Saved' : 'Save Draft'}
                        </button>
                        <button onClick={handleManualAutoFill} className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center transition-colors" title="Restore last session">
                             <History className="w-3 h-3 mr-1" /> Restore
                        </button>
                        <button 
                            onClick={handleDeleteSession} 
                            className="text-[10px] text-white hover:bg-red-600 bg-red-600 flex items-center transition-colors font-bold px-3 py-1.5 rounded-md shadow-sm border border-red-700" 
                            title="Delete Session"
                        >
                             <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button onClick={() => setStyle('CTA-Driven')} className={`py-3 text-[10px] font-bold rounded-xl flex items-center justify-center border transition-all ${style === 'CTA-Driven' ? 'bg-brand-900/40 border-brand-500 text-white shadow-glow-sm' : 'bg-dark-input border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                        <Target className="w-3 h-3 mr-1.5" /> CTA-Driven
                    </button>
                    <button onClick={() => setStyle('Authority-Building')} className={`py-3 text-[10px] font-bold rounded-xl flex items-center justify-center border transition-all ${style === 'Authority-Building' ? 'bg-brand-900/40 border-brand-500 text-white shadow-glow-sm' : 'bg-dark-input border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                        <Shield className="w-3 h-3 mr-1.5" /> Authority
                    </button>
                    <button onClick={() => setStyle('YouTube-Viral')} className={`py-3 text-[10px] font-bold rounded-xl flex items-center justify-center border transition-all ${style === 'YouTube-Viral' ? 'bg-brand-900/40 border-brand-500 text-white shadow-glow-sm' : 'bg-brand-500 border-brand-500 text-black hover:bg-brand-400'}`}>
                        <Youtube className="w-3 h-3 mr-1.5" /> YouTube
                    </button>
                    <button onClick={() => setStyle('Script-Generator')} className={`py-3 text-[10px] font-bold rounded-xl flex items-center justify-center border transition-all ${style === 'Script-Generator' ? 'bg-brand-900/40 border-brand-500 text-white shadow-glow-sm' : 'bg-dark-input border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                        <FileText className="w-3 h-3 mr-1.5" /> Script
                    </button>
                </div>
                
                {/* Description Area */}
                <div className="mt-3 text-[10px] text-gray-400 bg-dark-input/30 p-3 rounded-lg border border-gray-800/50 flex items-start leading-relaxed">
                     {style === 'CTA-Driven' && (
                        <>
                            <span className="mr-2 text-brand-500 text-sm">🎯</span>
                            <span>Strategic posts where every tip bridges to your offer (best for selling)</span>
                        </>
                    )}
                    {style === 'Authority-Building' && (
                        <>
                            <span className="mr-2 text-blue-400 text-sm">📚</span>
                            <span>Educational content that positions you as an expert in your niche.</span>
                        </>
                    )}
                    {style === 'YouTube-Viral' && (
                        <>
                            <span className="mr-2 text-red-500 text-sm">🎥</span>
                            <span>Scans your Offer & Video to create viral Facebook posts that bridge to your link.</span>
                        </>
                    )}
                     {style === 'Script-Generator' && (
                        <>
                            <span className="mr-2 text-purple-400 text-sm">📝</span>
                            <span>Create high-retention video scripts optimized for views.</span>
                        </>
                    )}
                </div>
            </div>

            {/* Offer Section */}
            <div className="bg-dark-card p-5 rounded-2xl border border-gray-800 space-y-4 shadow-sm">
                 <div>
                    <label className="text-[10px] text-brand-400 uppercase font-bold mb-1 block">Offer Name *</label>
                    <input 
                        name="offerName"
                        autoComplete="on"
                        value={offerName}
                        onChange={(e) => {
                            setOfferName(e.target.value);
                            if (errors.offerName) setErrors(prev => ({...prev, offerName: ''}));
                        }}
                        placeholder="e.g. AI GreenNova LaunchPad"
                        className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-brand-500 outline-none placeholder-gray-600 ${errors.offerName ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
                    />
                    {errors.offerName && (
                        <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.offerName}
                        </div>
                    )}
                 </div>
                 
                 <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Offer URL (optional)</label>
                    <input 
                        name="offerLink"
                        autoComplete="url"
                        value={offerLink}
                        onChange={(e) => {
                            setOfferLink(e.target.value);
                            if (errors.offerLink) setErrors(prev => ({...prev, offerLink: ''}));
                        }}
                        placeholder="https://..."
                        className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-brand-500 outline-none placeholder-gray-600 ${errors.offerLink ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
                    />
                    {errors.offerLink && (
                        <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.offerLink}
                        </div>
                    )}
                 </div>

                 {(style === 'YouTube-Viral' || style === 'Script-Generator') && (
                     <div>
                        <label className="text-[10px] text-red-400 uppercase font-bold mb-1 block">Source URL (YouTube / Blog / FB) *</label>
                        <input 
                            name="sourceUrl"
                            autoComplete="url"
                            value={contentUrl}
                            onChange={(e) => {
                                setContentUrl(e.target.value);
                                if (errors.contentUrl) setErrors(prev => ({...prev, contentUrl: ''}));
                            }}
                            placeholder="https://..."
                            className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-red-500 outline-none placeholder-gray-600 ${errors.contentUrl ? 'border-red-500 focus:border-red-500' : 'border-red-900/50'}`}
                        />
                        {errors.contentUrl ? (
                            <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.contentUrl}
                            </div>
                        ) : (
                            <p className="text-[10px] text-gray-500 mt-1">🎥 Paste any URL. We'll extract the content to build your asset.</p>
                        )}
                     </div>
                 )}

                 <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Offer Description (for CTA)</label>
                    <textarea 
                        name="offerDescription"
                        autoComplete="on"
                        value={offerDescription}
                        onChange={(e) => setOfferDescription(e.target.value)}
                        className="w-full p-3 bg-dark-input border border-gray-700 rounded-lg text-sm text-white focus:border-brand-500 outline-none h-20 resize-none placeholder-gray-600"
                    />
                 </div>
            </div>

            {/* Targeting Section */}
            <div className="space-y-4">
                 <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Target Audience *</label>
                    <input 
                        name="targetAudience"
                        autoComplete="on"
                        value={targetAudience}
                        onChange={(e) => {
                            setTargetAudience(e.target.value);
                            if (errors.targetAudience) setErrors(prev => ({...prev, targetAudience: ''}));
                        }}
                        placeholder="e.g., Entrepreneurs wanting to use AI"
                        className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-brand-500 outline-none placeholder-gray-600 ${errors.targetAudience ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
                    />
                    {errors.targetAudience && (
                        <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.targetAudience}
                        </div>
                    )}
                 </div>
                 
                 <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Platform</label>
                    <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full p-3 bg-dark-input border border-gray-700 rounded-lg text-sm text-white focus:border-brand-500 outline-none"
                    >
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Topic *</label>
                        <select 
                            value={selectedTopic}
                            onChange={(e) => {
                                setSelectedTopic(e.target.value);
                                if (errors.contentUrl && style === 'Script-Generator') setErrors(prev => ({...prev, contentUrl: ''}));
                                if (errors.selectedTopic) setErrors(prev => ({...prev, selectedTopic: ''}));
                            }}
                            className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-brand-500 outline-none ${errors.selectedTopic ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
                        >
                            <option value="">Select Topic</option>
                            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.selectedTopic && (
                            <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.selectedTopic}
                            </div>
                        )}
                     </div>
                     <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Hook Type *</label>
                        <select 
                            value={selectedHook}
                            onChange={(e) => {
                                setSelectedHook(e.target.value);
                                if (errors.selectedHook) setErrors(prev => ({...prev, selectedHook: ''}));
                            }}
                            className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-brand-500 outline-none ${errors.selectedHook ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
                        >
                            <option value="">Select Hook</option>
                            {HOOKS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        {errors.selectedHook && (
                            <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.selectedHook}
                            </div>
                        )}
                     </div>
                 </div>

                 <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Social Media Handle *</label>
                    <input 
                        name="socialHandle"
                        autoComplete="username"
                        value={handle}
                        onChange={(e) => {
                            setHandle(e.target.value);
                            if (errors.handle) setErrors(prev => ({...prev, handle: ''}));
                        }}
                        placeholder="@greennovasystems"
                        className={`w-full p-3 bg-dark-input border rounded-lg text-sm text-white focus:border-brand-500 outline-none placeholder-gray-600 ${errors.handle ? 'border-red-500 focus:border-red-500' : 'border-gray-700'}`}
                    />
                    {errors.handle && (
                        <div className="flex items-center mt-1 text-red-500 text-[10px] animate-fade-in">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.handle}
                        </div>
                    )}
                 </div>

                 <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Upload Image (Profile / Context)</label>
                     <div className="relative">
                         <input 
                             type="file" 
                             ref={fileInputRef}
                             onChange={handleProfileImageUpload}
                             className="hidden"
                         />
                         
                         {profileImage ? (
                            <div className="flex items-center gap-3 w-full p-2 bg-dark-input border border-brand-500/50 rounded-lg">
                                <img src={profileImage} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">Profile Image Set</p>
                                    <p className="text-[10px] text-gray-400">Used for Tweets & Context</p>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setProfileImage(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="p-1.5 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                         ) : (
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-3 bg-dark-input border border-gray-700 rounded-lg text-sm text-left text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center"
                             >
                                 <Upload className="w-4 h-4 mr-2" />
                                 Choose File
                             </button>
                         )}
                     </div>
                 </div>

                 <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block flex items-center"><Zap className="w-3 h-3 mr-1" /> Post Language</label>
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-3 bg-dark-input border border-gray-700 rounded-lg text-sm text-white focus:border-brand-500 outline-none"
                    >
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-lg shadow-lg flex items-center justify-center transition-all
                    ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50 hover:scale-[1.02]'}
                `}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2 fill-current" />}
                {loading ? 'Generating Assets...' : 'Generate Post'}
            </button>

        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-7 flex flex-col h-full">
            {generatedContent ? (
                <div className="bg-dark-card rounded-2xl border border-gray-800 shadow-premium flex flex-col h-full overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-800 bg-black/20 overflow-x-auto">
                         <button onClick={() => setActiveTab('Main')} className={`flex-1 min-w-[100px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'Main' ? 'border-brand-500 text-white bg-brand-500/10' : 'border-transparent text-gray-500 hover:text-white'}`}>
                            MAIN POST
                         </button>
                         <button onClick={() => setActiveTab('Image')} className={`flex-1 min-w-[100px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'Image' ? 'border-purple-500 text-white bg-purple-500/10' : 'border-transparent text-gray-500 hover:text-white'}`}>
                            IMAGE PROMPT
                         </button>
                         <button onClick={() => setActiveTab('Blog')} className={`flex-1 min-w-[100px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'Blog' ? 'border-blue-500 text-white bg-blue-500/10' : 'border-transparent text-gray-500 hover:text-white'}`}>
                            VIRAL BLOG
                         </button>
                         <button onClick={() => setActiveTab('Carousel')} className={`flex-1 min-w-[100px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'Carousel' ? 'border-pink-500 text-white bg-pink-500/10' : 'border-transparent text-gray-500 hover:text-white'}`}>
                            INSTA THREAD
                         </button>
                         <button onClick={() => setActiveTab('Tweets')} className={`flex-1 min-w-[100px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'Tweets' ? 'border-sky-500 text-white bg-sky-500/10' : 'border-transparent text-gray-500 hover:text-white'}`}>
                            TWEETS
                         </button>
                         <button onClick={() => setActiveTab('Comments')} className={`flex-1 min-w-[100px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'Comments' ? 'border-orange-500 text-white bg-orange-500/10' : 'border-transparent text-gray-500 hover:text-white'}`}>
                            9 COMMENTS
                         </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-dark-input/30 custom-scrollbar min-h-[500px]">
                        
                        {activeTab === 'Main' && (
                             <div className="space-y-6">
                                 <div className="bg-brand-900/20 border border-brand-500/30 p-4 rounded-xl">
                                     <div className="flex justify-between items-start mb-2">
                                         <h4 className="text-brand-400 font-bold text-xs uppercase flex items-center">
                                            {renderPlatformIcon(platform)}
                                            {style === 'Script-Generator' ? 'Video Metadata' : 'Main Viral Hook'}
                                         </h4>
                                         <button onClick={() => {navigator.clipboard.writeText(displayHooks[0] || mainHook); setCopied(true); setTimeout(()=>setCopied(false),1000)}} className="text-gray-400 hover:text-white">
                                             {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                         </button>
                                     </div>
                                     <p className="text-white text-lg font-bold leading-relaxed">{displayHooks[0] || mainHook || "Hook not detected"}</p>
                                 </div>
                                 <div className="prose prose-invert max-w-none">
                                     <ReactMarkdown>{mainBody || generatedContent}</ReactMarkdown>
                                 </div>
                             </div>
                        )}

                        {activeTab === 'Tweets' && (
                            <div className="space-y-4">
                                <div className="bg-sky-900/20 border border-sky-500/30 p-4 rounded-xl mb-6">
                                    <h4 className="text-sky-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center">
                                        <Twitter className="w-4 h-4 mr-2" /> Viral Tweets
                                    </h4>
                                    <p className="text-gray-400 text-xs">Short-form variations optimized for X (Twitter) engagement.</p>
                                </div>
                                
                                <div className="grid gap-4">
                                    {tweets.length > 0 ? (
                                        tweets.map((tweet, index) => (
                                            <div key={index} className="bg-dark-card p-4 rounded-xl border border-gray-800 hover:border-sky-500/50 transition-all group relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                            {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover"/> : <span className="font-bold text-xs text-white">{offerName?.[0]}</span>}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1">
                                                                <p className="font-bold text-xs text-blue-400">{offerName || "GreenNova AI LaunchPad"}</p>
                                                                <VerifiedBadge />
                                                            </div>
                                                            <p className="text-[10px] text-gray-500">{handle}</p>
                                                        </div>
                                                    </div>
                                                    <Twitter className="w-4 h-4 text-gray-600 group-hover:text-sky-500 transition-colors" />
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">
                                                    <FormattedViralText text={tweet} />
                                                </p>
                                                <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                                                    <span className="text-[10px] text-gray-500">{tweet.length} chars</span>
                                                    <button 
                                                        onClick={() => {navigator.clipboard.writeText(tweet); setCopied(true); setTimeout(()=>setCopied(false),1000)}}
                                                        className="text-xs font-bold text-sky-500 hover:text-sky-400 flex items-center"
                                                    >
                                                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} Copy
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                         <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-800 rounded-xl">
                                            Generate a post to see viral tweets here.
                                         </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Carousel' && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap justify-between items-center bg-pink-900/10 border border-pink-500/20 p-3 rounded-xl mb-4 gap-3">
                                     <div className="flex items-center">
                                        <div className="p-2 bg-pink-500/20 rounded-lg mr-3">
                                            <Layers className="w-4 h-4 text-pink-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Thread / Carousel</h4>
                                            <p className="text-xs text-gray-400">{editableSlides.length} Slides Generated</p>
                                        </div>
                                     </div>
                                     
                                     <div className="flex gap-2">
                                        {carouselViewMode === 'visual' && (
                                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 mr-2">
                                                <button onClick={() => setCarouselStyle('classic')} className={`px-2 py-1 text-[10px] rounded ${carouselStyle === 'classic' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>GreenNova</button>
                                                <button onClick={() => setCarouselStyle('tweet-light')} className={`px-2 py-1 text-[10px] rounded ${carouselStyle === 'tweet-light' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>Light</button>
                                                <button onClick={() => setCarouselStyle('tweet-dark')} className={`px-2 py-1 text-[10px] rounded ${carouselStyle === 'tweet-dark' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>Dark</button>
                                            </div>
                                        )}
                                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                            <button 
                                                onClick={() => setCarouselViewMode('visual')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${carouselViewMode === 'visual' ? 'bg-pink-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <Eye className="w-3 h-3" /> Visual
                                            </button>
                                            <button 
                                                onClick={() => setCarouselViewMode('text')}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${carouselViewMode === 'text' ? 'bg-pink-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <Layout className="w-3 h-3" /> Text
                                            </button>
                                        </div>
                                     </div>
                                </div>
                                
                                {carouselViewMode === 'visual' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                        {editableSlides.map((slide, index) => {
                                            const cleanText = slide.replace(/^Slide \d+: /i, '').trim();
                                            const isEditing = editingSlideIndex === index;
                                            const elementId = `slide-node-${index}`;
                                            const isDownloading = downloadingSlideId === elementId;
                                            
                                            // Render different card styles
                                            if (carouselStyle === 'classic') {
                                                return (
                                                    <div key={index} className="relative group perspective-1000">
                                                        <div 
                                                            id={elementId}
                                                            className="aspect-[4/5] bg-[#022c22] border border-[#064e3b] p-8 relative shadow-2xl flex flex-col justify-between overflow-hidden"
                                                        >
                                                            {/* GreenNova Card Header */}
                                                            <div className="flex items-center gap-3 shrink-0">
                                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#10b981] shadow-sm shrink-0">
                                                                    {profileImage ? (
                                                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">GN</div>
                                                                    )}
                                                                </div>
                                                                <div className="leading-tight">
                                                                    {offerName ? (
                                                                        <div className="flex flex-col justify-center">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="font-bold text-[#3b82f6] text-[15px]">{offerName}</span>
                                                                                <VerifiedBadge />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col justify-center">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="font-bold text-[#3b82f6] text-[15px] leading-none">GREENNOVA AI</span>
                                                                                <VerifiedBadge />
                                                                            </div>
                                                                            <span className="font-bold text-[#3b82f6] text-[15px] leading-none mt-0.5">LaunchPad</span>
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[#6ee7b7] text-xs font-medium block mt-0.5">{handle}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Content */}
                                                            <div className="flex-1 flex flex-col justify-center my-4 relative">
                                                                {/* NEW: Viral Hook Heading */}
                                                                <div className="mb-4 relative group/hook">
                                                                    <p 
                                                                        className="text-[#facc15] font-black text-2xl uppercase leading-[0.9] tracking-tighter cursor-pointer hover:opacity-90"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(displayHooks[0] || "");
                                                                            setCopied(true);
                                                                            setTimeout(() => setCopied(false), 1000);
                                                                        }}
                                                                        title="Click to copy Viral Hook"
                                                                    >
                                                                        {(displayHooks[0] || mainHook || "VIRAL HOOK HEADING").replace(/👇/g, '').trim().toUpperCase()}
                                                                    </p>
                                                                     {/* Visual hint for copy */}
                                                                    <span className="absolute -right-6 top-0 opacity-0 group-hover/hook:opacity-100 transition-opacity text-white/50">
                                                                        <Copy className="w-4 h-4" />
                                                                    </span>
                                                                </div>

                                                                {isEditing ? (
                                                                    <textarea 
                                                                        value={editableSlides[index]}
                                                                        onChange={(e) => handleSlideChange(index, e.target.value)}
                                                                        className="w-full h-full bg-black/20 border border-[#10b981]/50 text-white text-lg font-bold p-3 rounded-lg outline-none resize-none placeholder-gray-500 focus:ring-2 focus:ring-[#10b981]"
                                                                        autoFocus
                                                                    />
                                                                ) : (
                                                                    <div className="flex flex-col gap-2">
                                                                        {cleanText.split('\n').map((line, i) => {
                                                                            // Check if line is wrapped in parentheses for footnote style
                                                                            const isFootnote = line.trim().startsWith('(') && line.trim().endsWith(')');
                                                                            return (
                                                                                <p key={i} className={`whitespace-pre-wrap ${isFootnote ? 'text-[11px] text-[#6ee7b7] opacity-80 mt-2 font-medium leading-tight' : 'text-xl leading-relaxed font-bold text-white'}`}>
                                                                                    <FormattedViralText text={line} />
                                                                                </p>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Footer */}
                                                            <div className="pt-6 mt-auto border-t border-white/10 flex justify-between items-end shrink-0">
                                                                <div className="flex items-center gap-2 opacity-100">
                                                                    <GreenNovaLogo className="w-8 h-8 text-[#10b981]" />
                                                                    <div className="flex flex-col justify-center">
                                                                        <p className="text-[12px] font-black text-white leading-none tracking-wide">GREENNOVA AI</p>
                                                                        <p className="text-[10px] font-bold italic text-[#10b981] leading-none tracking-wider mt-0.5">LaunchPad</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-mono text-gray-500 mb-0.5">{index + 1} / {editableSlides.length}</span>
                                                            </div>
                                                        </div>

                                                        {/* Hover Actions - Only show when NOT downloading */}
                                                        {!isDownloading && (
                                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                <button 
                                                                    onClick={() => setEditingSlideIndex(isEditing ? null : index)}
                                                                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/20"
                                                                    title={isEditing ? "Finish Editing" : "Edit Text"}
                                                                >
                                                                    {isEditing ? <Check className="w-4 h-4 text-green-400" /> : <PenLine className="w-4 h-4" />}
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDownloadSlide(index)}
                                                                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/20"
                                                                    title="Download Slide"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } else {
                                                // TWEET STYLES
                                                const isDark = carouselStyle === 'tweet-dark';
                                                const bgColor = isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200';
                                                const textColor = isDark ? 'text-white' : 'text-gray-900';
                                                const nameColor = isDark ? 'text-blue-400' : 'text-blue-700';
                                                const subTextColor = isDark ? 'text-gray-500' : 'text-gray-500';
                                                const borderColor = isDark ? 'border-gray-800' : 'border-gray-100';

                                                return (
                                                    <div key={index} className={`aspect-[4/5] ${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-4 flex items-center justify-center relative group`}>
                                                        {/* Tweet Card */}
                                                        <div id={elementId} className={`w-full ${bgColor} p-6 rounded-none shadow-xl border ${isDark ? 'border-gray-800' : 'border-gray-200'} relative`}>
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex gap-3">
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                                                         {profileImage ? (
                                                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className={`w-full h-full ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} flex items-center justify-center font-bold`}>
                                                                                {offerName ? offerName[0] : 'U'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className={`font-bold text-[15px] ${nameColor}`}>{offerName || "GreenNova AI LaunchPad"}</span>
                                                                            <VerifiedBadge />
                                                                        </div>
                                                                        <div className={`text-[14px] ${subTextColor}`}>{handle}</div>
                                                                    </div>
                                                                </div>
                                                                <Twitter className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                                                            </div>
                                                            
                                                            <div className={`text-[18px] leading-snug whitespace-pre-wrap mb-4 ${textColor}`}>
                                                                {isEditing ? (
                                                                    <textarea 
                                                                        value={editableSlides[index]}
                                                                        onChange={(e) => handleSlideChange(index, e.target.value)}
                                                                        className={`w-full bg-transparent border border-gray-500 p-2 rounded outline-none h-40 resize-none ${textColor}`}
                                                                        autoFocus
                                                                    />
                                                                ) : <FormattedViralText text={cleanText.replace(/\*\*/g, '**')} /> }
                                                            </div>
                                                            
                                                            <div className={`text-[14px] ${subTextColor} mb-4 flex gap-1`}>
                                                                <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                                <span>·</span>
                                                                <span>{new Date().toLocaleDateString()}</span>
                                                            </div>
                                                            
                                                            <div className={`border-t ${borderColor} py-3 flex justify-between ${subTextColor}`}>
                                                                <MessageCircle className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
                                                                <Repeat className="w-5 h-5 hover:text-green-500 cursor-pointer" />
                                                                <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer" />
                                                                <Share className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
                                                            </div>
                                                        </div>

                                                        {/* Hover Actions */}
                                                        {!isDownloading && (
                                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                 <button 
                                                                    onClick={() => setEditingSlideIndex(isEditing ? null : index)}
                                                                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/20"
                                                                    title={isEditing ? "Finish Editing" : "Edit Text"}
                                                                >
                                                                    {isEditing ? <Check className="w-4 h-4 text-green-400" /> : <PenLine className="w-4 h-4" />}
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDownloadSlide(index)}
                                                                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/20"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                ) : (
                                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-h3:text-pink-300">
                                        <ReactMarkdown>{carouselContent || "Carousel content not generated in this mode."}</ReactMarkdown>
                                    </div>
                                )}
                                
                                {carouselViewMode === 'text' && (
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={() => {navigator.clipboard.writeText(carouselContent); setCopied(true); setTimeout(()=>setCopied(false),1000)}} 
                                            className="text-pink-400 border border-pink-900/50 bg-pink-900/20 hover:bg-pink-900/40 hover:text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center transition-colors"
                                        >
                                            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                            Copy Full Script
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Image' && (
                            <div className="space-y-6">
                                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl">
                                     <h4 className="text-purple-400 font-bold text-xs uppercase mb-2 flex justify-between items-center">
                                        <span className="flex items-center"><Edit3 className="w-3 h-3 mr-1" /> Viral Image Prompt (Editable)</span>
                                        <Copy className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(editableImagePrompt)} />
                                     </h4>
                                     <textarea 
                                        value={editableImagePrompt}
                                        onChange={(e) => setEditableImagePrompt(e.target.value)}
                                        className="w-full bg-black/30 border border-purple-500/30 rounded-lg p-3 text-sm text-gray-200 focus:border-purple-500 outline-none resize-none h-32"
                                        placeholder="AI will generate the prompt here. You can edit it before creating the image."
                                     />
                                </div>
                                
                                {generatedImage ? (
                                    <div className="text-center">
                                        <img src={generatedImage} alt="Generated" className="rounded-xl shadow-2xl max-h-[400px] mx-auto border border-gray-700" />
                                        <div className="flex justify-center gap-3 mt-4">
                                            <a href={generatedImage} download="viral-image.png" className="inline-flex items-center text-purple-400 text-xs font-bold hover:text-white border border-purple-900/50 bg-purple-900/20 px-4 py-2 rounded-lg">
                                                <Download className="w-3 h-3 mr-1" /> Download Image
                                            </a>
                                            <button 
                                                onClick={handleGenerateImageNano}
                                                disabled={generatingNano || !editableImagePrompt}
                                                className="inline-flex items-center text-yellow-400 text-xs font-bold hover:text-white border border-yellow-900/50 bg-yellow-900/20 px-4 py-2 rounded-lg"
                                            >
                                                {generatingNano ? <Loader2 className="animate-spin w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                                Regenerate viral image (powered by Nano banana)
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 flex flex-col items-center gap-4">
                                        <button 
                                            onClick={handleGenerateImage}
                                            disabled={generatingImage || !editableImagePrompt}
                                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center"
                                        >
                                            {generatingImage ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                                            Generate This Image Now
                                        </button>
                                        <button 
                                            onClick={handleGenerateImageNano}
                                            disabled={generatingNano || !editableImagePrompt}
                                            className="text-yellow-400 hover:text-white text-xs font-bold flex items-center border border-yellow-900/50 bg-yellow-900/20 px-4 py-2 rounded-lg"
                                        >
                                            {generatingNano ? <Loader2 className="animate-spin w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                            Regenerate viral image (powered by Nano banana)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Blog' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleRegenerateBlog}
                                        className="text-blue-400 text-xs font-bold flex items-center hover:text-white bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-800"
                                    >
                                        {regeneratingBlog ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Repeat className="w-3 h-3 mr-1" />}
                                        Regenerate Viral Blog
                                    </button>
                                </div>
                                <div className="prose prose-invert max-w-none bg-black/20 p-6 rounded-xl border border-gray-800">
                                    <ReactMarkdown>{miniBlog || "No blog content"}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Comments' && (
                            <div className="space-y-4">
                                {/* NEW: 7 Viral Hooks Selection */}
                                {displayHooks.length > 0 && (
                                    <div className="bg-dark-card rounded-xl border border-gray-800 p-5 mb-6 shadow-sm relative group">
                                        <div className="mb-4 border-b border-gray-800 pb-4">
                                            <h4 className="text-white font-bold text-sm flex items-center gap-2 mb-2">
                                                <Target className="w-4 h-4 text-brand-500" />
                                                Select Your Viral Hook (7 Variations)
                                            </h4>
                                            <p className="text-[10px] text-gray-500 mb-3">Copy the best hook to start your thread.</p>
                                            
                                            <div className="space-y-2">
                                                {displayHooks.map((hook, idx) => (
                                                    <div key={idx} className="flex gap-3 items-start p-3 bg-black/20 hover:bg-black/40 rounded-lg border border-gray-800/50 hover:border-brand-500/30 transition-all group/hook">
                                                        <span className="text-xs font-bold text-brand-500 mt-0.5 shrink-0">#{idx + 1}</span>
                                                        <p className="text-sm text-gray-300 font-medium leading-relaxed flex-1">{hook.replace(/^(Hook \d+:|Option \d+:)/i, '').trim()}</p>
                                                        <button 
                                                            onClick={() => handleCopyHook(hook.replace(/^(Hook \d+:|Option \d+:)/i, '').trim(), idx)}
                                                            className={`p-1.5 rounded-md transition-all shrink-0 ${copiedHookIndex === idx ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                                                            title="Copy Hook"
                                                        >
                                                            {copiedHookIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Main Post Body */}
                                        <div className="flex justify-between items-start mb-3 mt-4">
                                            <div>
                                                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-brand-500" />
                                                    Main Post Body
                                                </h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5">Paste this after your selected hook.</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const text = mainBody || '';
                                                    navigator.clipboard.writeText(text);
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 1000);
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-900/20 text-brand-400 hover:bg-brand-900/40 hover:text-white border border-brand-900/50 rounded-lg text-xs font-bold transition-all"
                                            >
                                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {copied ? 'Copied' : 'Copy Body'}
                                            </button>
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-4 border border-gray-800/50 text-sm text-gray-300 leading-relaxed">
                                            <ReactMarkdown className="prose prose-invert max-w-none prose-sm prose-p:my-2">{mainBody || ''}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gradient-to-r from-orange-900/20 to-transparent border-l-4 border-orange-500 p-4 rounded-r-xl mb-6 flex justify-between items-center">
                                    <div>
                                        <h4 className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-1">Engagement Strategy</h4>
                                        <p className="text-gray-400 text-xs">Paste these comments one-by-one under your post to trigger algorithm boosts.</p>
                                    </div>
                                    <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20">
                                        {comments ? comments.split(/\n+(?=\d+[\s.-])/).filter(c => c.trim().length > 0).length : 0} Comments
                                    </span>
                                </div>
                                
                                <div className="grid gap-3">
                                    {comments ? (
                                        comments.split(/\n+(?=\d+[\s.-])/).filter(c => c.trim().length > 0).map((comment, index) => {
                                            // Strip the leading number for cleaner display/copying
                                            const cleanText = comment.replace(/^\d+[\s.-]+\s*/, '').trim();
                                            const displayNum = index + 1;
                                            
                                            return (
                                                <div key={index} className="bg-dark-card rounded-xl border border-gray-800 hover:border-gray-600 transition-all shadow-sm group overflow-hidden flex flex-col sm:flex-row">
                                                    <div className="bg-gray-900/50 w-full sm:w-12 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-800 p-2 sm:p-0">
                                                        <span className="text-gray-500 font-mono text-sm font-bold group-hover:text-brand-500 transition-colors">#{displayNum}</span>
                                                    </div>
                                                    
                                                    <div className="flex-1 p-4 text-sm text-gray-300 leading-relaxed font-medium prose prose-invert prose-p:my-0 prose-strong:text-brand-400">
                                                        <ReactMarkdown>{cleanText}</ReactMarkdown>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-gray-900/30 border-t sm:border-t-0 sm:border-l border-gray-800 flex items-center justify-end sm:justify-center">
                                                        <button 
                                                            onClick={() => handleCopyComment(cleanText, index)}
                                                            className={`
                                                                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border w-full sm:w-auto justify-center
                                                                ${copiedCommentIndex === index 
                                                                    ? 'bg-green-500 text-white border-green-500 shadow-glow-sm scale-105' 
                                                                    : 'bg-dark-input text-gray-400 border-gray-700 hover:bg-white hover:text-black hover:border-white'}
                                                            `}
                                                        >
                                                            {copiedCommentIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                            {copiedCommentIndex === index ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                         <div className="text-gray-500 text-sm font-mono p-8 border-2 border-dashed border-gray-800 rounded-xl text-center">
                                            Generate a post to see viral comments here.
                                         </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Toolbar */}
                    <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-between items-center">
                        <div className="flex gap-2">
                             <button onClick={handleSave} className="text-gray-400 hover:text-green-400 transition-colors flex items-center text-xs font-bold bg-dark-input px-3 py-2 rounded-lg border border-gray-700">
                                {saved ? <Check className="w-3 h-3 mr-1" /> : <Upload className="w-3 h-3 mr-1" />} {saved ? 'Saved' : 'Save Asset'}
                             </button>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleCopyAll} className="bg-brand-900/50 hover:bg-brand-800 text-brand-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center transition-colors border border-brand-800">
                                {copiedAll ? <Check className="w-3 h-3 mr-1" /> : <ClipboardCopy className="w-3 h-3 mr-1" />}
                                {copiedAll ? 'Copied All' : 'Copy Full Output'}
                            </button>
                            <button onClick={handleCopy} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center transition-colors">
                                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                {copied ? 'Copied' : 'Copy Current Tab'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-dark-card rounded-2xl border border-gray-800 border-dashed">
                    <div className="bg-dark-input p-4 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Launch</h3>
                    <p className="text-gray-500 max-w-xs text-sm">
                        Fill in the form to generate your complete viral asset pack.
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ContentCreator;
