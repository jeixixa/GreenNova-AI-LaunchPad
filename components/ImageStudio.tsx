import React, { useState, useRef, useEffect } from 'react';
import { editImageWithPrompt, generateImage, generateVideo, generateBlogPost, generateImageNanoPro } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { Loader2, Upload, Wand2, Image as ImageIcon, Download, Bookmark, Check, Sparkles, Video, Film, PlayCircle, Key, FileText, X, Copy, Zap, Type, AlignLeft, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MARKETING_PROMPT = `Create a clean, minimalist marketing poster in a modern illustrated vector style. Use a beige or off-white background with bold, high-contrast headline text on the left side. Add a professional business character (man or woman) confidently walking upward on stylized stairs or platforms. Integrate futuristic AI, digital marketing, or money-growth graphics on the right (neural networks, arrows, charts, dollar icons, data flow, etc.) using a consistent green color theme.

Include a short bold headline at the top left (replaceable), a sub-headline below it, and a small website or brand tag near the bottom. Design should look like a premium AI-driven marketing ad — simple, clean, high-impact, with plenty of open space and visual storytelling. Maintain consistency with the style of Omneky and GreenNova Systems ads.`;

const VIRAL_TEXT_TEMPLATE = `Create a high-impact "Viral Power Quote" image (3:4 portrait) optimized for social media engagement.

**Core Aesthetic:**
- **Style:** "Viral Power Quote". High-end digital art style.
- **Theme:** "Digital Empire" / "Future Tech". Dark, moody, and ultra-modern.
- **Lighting:** Cinematic lighting with strong contrast (chiaroscuro). Use volumetric lighting and glowing neon accents (Cyan, Electric Blue, or Golden Amber) to highlight the subject.
- **Background:** A dark, tech-themed environment with glowing elements. Think abstract digital grids, holographic data streams, or a futuristic control room. The background must be 80% dark (Deep Charcoal, Midnight Blue, or Black) to ensure text readability.
- **Mood:** Motivational, inspiring, intense, and triumphant.

**Subject:**
- **Character:** A single confident, powerful figure (e.g., modern entrepreneur, tech visionary, or leader).
- **Pose:** Strong, commanding stance. Looking forward or slightly off-camera with a focused expression.
- **Attire:** Modern professional or futuristic smart-casual.

**Composition (Critical):**
- **Subject Placement:** Subject positioned in the upper 60% of the frame.
- **Negative Space:** The bottom 40% of the image MUST be kept completely clean, dark, and empty. This space is strictly reserved for a text overlay. Do not place busy details or bright lights in this lower area.

**Text Overlay Instruction (for the model):**
- Render the text: "{{TEXT}}"
- **Font:** Large, Bold, Sans-Serif (e.g., Impact, Futura, Bebas Neue).
- **Color:** Bright White or Yellow/Gold to contrast against the dark background.
- **Position:** Centered within the bottom dark negative space.
- **Effect:** Subtle drop shadow or outer glow to enhance readability.`;

const AUTHORITY_PROMPT = `Create a clean rectangular authority-style social media graphic (4:5 aspect ratio).
Background: Dark Green (#14532d), high contrast, clean, minimal.
Layout Elements:
1. HEADER (Top-Left):
   - Circular Profile Photo: [Use the uploaded image provided in context. If no image is provided, use a high-quality professional avatar]
   - Name: "James Shizha" (Bold, White)
   - Handle: "@GreenNovaAI" (Small, Light Gray)
   - Verified Badge: Blue tick next to name.

2. CONTENT (Center Aligned, High Contrast):
   - HEADLINE: "AI IS GOING CRAZY IN 2025 🤯" (Big, Bold, White)
   - SUB-HEADLINE: "Here’s how to turn one idea into a real business in 24 hours." (White, slightly smaller)
   - BODY TEXT: "AI can now research your market, design your product, build your website, write your content, and automate your sales — all in one place." (Medium, clean sans-serif font, white).
   - HIGHLIGHT: Highlight words "one idea", "real business", "24 hours" in bright Yellow.

3. FOOTER (Bottom Center):
   - CTA: "Here are the 10 simple steps 👇" (White, Bold)
   - SUB-CTA: "(yes, these tools are free and anyone can start today)" (Small, Yellow/Orange)

Style: Crisp, vector-like quality, professional UI mock-up style, no artifacts. Center-aligned text blocks. Professional spacing and margins. No watermark.`;

const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<'edit' | 'generate' | 'animate'>('generate');
  
  // Edit/Animate Input State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  // Generate State
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [overlayText, setOverlayText] = useState('');
  const [showOverlayInput, setShowOverlayInput] = useState(false);

  // Shared State
  const [editPrompt, setEditPrompt] = useState(''); // Used for Edit and Animate prompts
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Blog Generation State
  const [blogPost, setBlogPost] = useState<string | null>(null);
  const [generatingBlog, setGeneratingBlog] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogCopied, setBlogCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkApiKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    } else {
        setHasApiKey(!!process.env.API_KEY);
    }
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const handleOpenKeySelect = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      setHasApiKey(true);
      setTimeout(checkApiKey, 1000);
    } else {
        alert("API Key selection dialog not available in this environment.");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        if (mode !== 'generate') {
             setResultImage(null); // Reset results on new upload only for non-generate modes
             setResultVideo(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearSelectedImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedImage(null);
      setMimeType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    setLoading(true);
    setResultImage(null);
    setResultVideo(null);
    setBlogPost(null); // Reset previous blog post
    setSaved(false);
    
    try {
      if (mode === 'edit') {
        // Powered by Nano Banana (Gemini 2.5 Flash Image)
        if (!selectedImage || !editPrompt) return;
        const base64Data = selectedImage.split(',')[1];
        const result = await editImageWithPrompt(base64Data, mimeType, editPrompt);
        setResultImage(result);
      } else if (mode === 'animate') {
        // Check API Key for Veo
        if (!hasApiKey) {
            await handleOpenKeySelect();
            setLoading(false);
            return;
        }

        // Powered by Veo
        if (!selectedImage || !editPrompt) return;
        const base64Data = selectedImage.split(',')[1];
        const result = await generateVideo({
            prompt: editPrompt,
            image: { data: base64Data, mimeType },
            aspectRatio: '16:9', // Default for animation
            resolution: '720p'
        });
        setResultVideo(result);
      } else {
        // Generate Mode
        let finalPrompt = generatePrompt;
        
        // Inject overlay text if available
        if (showOverlayInput && overlayText.trim()) {
             finalPrompt = VIRAL_TEXT_TEMPLATE.replace('{{TEXT}}', overlayText);
             
             // Use Nano Banana Pro (Gemini 3 Pro) for superior text rendering
             if (!hasApiKey) {
                await handleOpenKeySelect();
                setLoading(false);
                return;
             }
             const result = await generateImageNanoPro(finalPrompt, aspectRatio);
             setResultImage(result);

        } else if (generatePrompt === AUTHORITY_PROMPT) {
             // AUTHORITY MODE
             // Check API Key for Gemini 3 Pro
             if (!hasApiKey) {
                await handleOpenKeySelect();
                setLoading(false);
                return;
             }
             
             // Pass image context if uploaded (profile photo)
             let imageContext = undefined;
             if (selectedImage) {
                 imageContext = {
                     data: selectedImage.split(',')[1],
                     mimeType: mimeType
                 };
             }

             const result = await generateImageNanoPro(finalPrompt, aspectRatio, imageContext);
             setResultImage(result);

        } else {
             // Standard generation (Imagen)
             if (!finalPrompt) return;
             const result = await generateImage(finalPrompt, aspectRatio);
             setResultImage(result);
        }
      }
    } catch (error: any) {
      console.error("Process Error", error);
      if (error.message && error.message.includes("Requested entity was not found")) {
          setHasApiKey(false);
          await handleOpenKeySelect();
      } else {
          alert("Failed to process request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlog = async () => {
      if (!resultImage) return;
      
      setGeneratingBlog(true);
      setShowBlogModal(true);
      setBlogCopied(false);
      
      try {
          // Extract Base64 from data URL
          const base64Data = resultImage.split(',')[1];
          const mime = resultImage.substring(resultImage.indexOf(':') + 1, resultImage.indexOf(';'));
          
          // Use the prompt that generated the image
          let contextPrompt = mode === 'generate' ? generatePrompt : editPrompt;
          if (mode === 'generate' && showOverlayInput && overlayText) {
             contextPrompt = `Image with text: "${overlayText}"`;
          }
          
          const post = await generateBlogPost(contextPrompt, base64Data, mime);
          setBlogPost(post);
      } catch (error) {
          setBlogPost("Failed to generate blog post. Please try again.");
      } finally {
          setGeneratingBlog(false);
      }
  };

  const handleCopyBlog = () => {
      if (blogPost) {
          navigator.clipboard.writeText(blogPost);
          setBlogCopied(true);
          setTimeout(() => setBlogCopied(false), 2000);
      }
  };

  const handleSave = () => {
    if (!resultImage && !resultVideo) return;
    
    const content = resultVideo || resultImage;
    const type = resultVideo ? 'Video' : 'Image';
    
    if (!content) return;

    let title = mode === 'generate' ? `Generated: ${generatePrompt.substring(0,30)}` : `${mode === 'animate' ? 'Animated' : 'Edited'}: ${editPrompt.substring(0,30)}`;
    
    if (showOverlayInput && overlayText) {
        title = `Viral Quote: "${overlayText.substring(0,20)}..."`;
    }

    const success = saveItem({
      type: type,
      content: content,
      title: title,
    });
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  const resetState = (newMode: 'edit' | 'generate' | 'animate') => {
      setMode(newMode);
      setResultImage(null);
      setResultVideo(null);
      setBlogPost(null);
      setSelectedImage(null); // Clear uploaded image when switching modes
  };

  const fillMarketingPrompt = () => {
      setShowOverlayInput(false);
      setGeneratePrompt(MARKETING_PROMPT);
  };
  
  const fillAuthorityPrompt = () => {
      setShowOverlayInput(false);
      setGeneratePrompt(AUTHORITY_PROMPT);
      setAspectRatio('4:5'); // Good for social posts
  };

  const fillTextPrompt = () => {
      setShowOverlayInput(true);
      setGeneratePrompt(""); // Clear prompt to rely on text template
      setAspectRatio('3:4'); // Portrait often better for text posts
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in relative">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Image Studio</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                Viral Image Post Generator with Customizable Text.
            </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex flex-wrap gap-1">
            <button 
                onClick={() => resetState('generate')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${mode === 'generate' ? 'bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                <Sparkles className="w-4 h-4 mr-2" />
                Image Generator
            </button>
            <button 
                onClick={() => resetState('edit')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${mode === 'edit' ? 'bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                <Wand2 className="w-4 h-4 mr-2" />
                Edit
            </button>
            <button 
                onClick={() => resetState('animate')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${mode === 'animate' ? 'bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
                <Film className="w-4 h-4 mr-2" />
                Animate
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {mode !== 'generate' ? (
            <>
                {/* Upload Area for Edit & Animate */}
                <div 
                    className={`
                        bg-white dark:bg-gray-800 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group relative
                        ${selectedImage ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-brand-400'}
                    `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*" 
                    className="hidden" 
                    />
                    {selectedImage ? (
                        <div className="relative z-10">
                            <img src={selectedImage} alt="Original" className="max-h-64 mx-auto rounded-lg shadow-lg object-contain" />
                            <div className="mt-4 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 inline-block px-3 py-1 rounded-full text-xs font-bold">
                                Image Loaded
                            </div>
                        </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4 group-hover:bg-brand-100 dark:group-hover:bg-gray-600 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-300 group-hover:text-brand-500" />
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">Upload Source Image</p>
                        <p className="text-sm text-gray-500 mt-1">Click to browse or drag & drop</p>
                    </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                        {mode === 'edit' ? <Wand2 className="w-4 h-4 mr-2 text-brand-500" /> : <Video className="w-4 h-4 mr-2 text-brand-500" />}
                        {mode === 'edit' ? 'Edit Instructions (Nano Banana)' : 'Animation Prompt (Veo)'}
                    </h3>
                    <textarea 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder={mode === 'edit' ? "Make the background cyberpunk neon..." : "Cinematic slow motion pan, particles floating..."}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-28 resize-none text-gray-900 dark:text-white placeholder-gray-500"
                    />
                </div>
            </>
          ) : (
            <>
                {/* Generate Input */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-brand-500" />
                            Image Post Generator
                        </h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={fillMarketingPrompt}
                                className={`text-xs font-bold flex items-center px-2 py-1 rounded transition-colors ${!showOverlayInput && generatePrompt === MARKETING_PROMPT ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                title="Pre-fill with high-converting marketing prompt"
                            >
                                <Zap className="w-3 h-3 mr-1" />
                                Standard
                            </button>
                             <button 
                                onClick={fillAuthorityPrompt}
                                className={`text-xs font-bold flex items-center px-2 py-1 rounded transition-colors ${generatePrompt === AUTHORITY_PROMPT ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                title="Generate Professional Authority Image"
                            >
                                <Shield className="w-3 h-3 mr-1" />
                                Authority Post
                            </button>
                            <button 
                                onClick={fillTextPrompt}
                                className={`text-xs font-bold flex items-center px-2 py-1 rounded transition-colors shadow-sm ${showOverlayInput ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                                title="Generate Viral Quote Image with Custom Text"
                            >
                                <Type className="w-3 h-3 mr-1" />
                                Viral Quote Gen
                            </button>
                        </div>
                    </div>

                    {showOverlayInput ? (
                        <div className="animate-fade-in space-y-3">
                            <div>
                                <label className="text-xs font-bold text-purple-500 uppercase mb-1 block">Custom Text Overlay Content</label>
                                <textarea 
                                    value={overlayText}
                                    onChange={(e) => setOverlayText(e.target.value)}
                                    placeholder="Enter your quote or headline here (e.g. 'AI IS THE NEW LEVERAGE')"
                                    className="w-full p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none text-gray-900 dark:text-white placeholder-gray-500 font-bold text-lg"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                The AI (Nano Banana Pro) will generate a high-contrast dark mode image featuring this text in bold typography. 
                                <span className="text-amber-600 ml-1 font-bold">Requires Paid API Key.</span>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {/* Special Upload for Authority Mode */}
                             {generatePrompt === AUTHORITY_PROMPT && (
                                 <div 
                                    className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-3 flex items-center justify-between group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                 >
                                      <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        accept="image/*" 
                                        className="hidden" 
                                      />
                                      <div className="flex items-center gap-3">
                                          {selectedImage ? (
                                              <img src={selectedImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-green-500" />
                                          ) : (
                                              <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300">
                                                  <Upload className="w-5 h-5" />
                                              </div>
                                          )}
                                          <div>
                                              <p className="text-xs font-bold text-green-800 dark:text-green-300">Upload Profile Photo</p>
                                              <p className="text-[10px] text-green-600 dark:text-green-400">Used for profile avatar in image.</p>
                                          </div>
                                      </div>
                                      {selectedImage && (
                                          <button onClick={clearSelectedImage} className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full text-green-700 dark:text-green-300">
                                              <X className="w-4 h-4" />
                                          </button>
                                      )}
                                 </div>
                             )}

                            <textarea 
                                value={generatePrompt}
                                onChange={(e) => setGeneratePrompt(e.target.value)}
                                placeholder="A futuristic sustainable city with vertical gardens, 8k resolution, photorealistic..."
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-40 resize-none text-gray-900 dark:text-white placeholder-gray-500"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {['1:1', '3:4', '4:5', '16:9'].map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${aspectRatio === ratio ? 'bg-brand-600 text-white border-brand-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </>
          )}
          
          <button
            onClick={handleProcess}
            disabled={loading || (mode !== 'generate' ? (!selectedImage || !editPrompt) : (showOverlayInput ? !overlayText : !generatePrompt))}
            className={`
                w-full py-4 px-6 rounded-xl font-black text-lg flex items-center justify-center text-white transition-all shadow-lg
                ${loading || (mode !== 'generate' ? (!selectedImage || !editPrompt) : (showOverlayInput ? !overlayText : !generatePrompt))
                    ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none text-gray-300' 
                    : 'bg-brand-600 hover:bg-brand-700 hover:scale-[1.01] shadow-brand-200 dark:shadow-none'}
            `}
            >
            {loading ? (
                <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    {mode === 'animate' ? 'Rendering Video...' : 'Processing...'}
                </>
            ) : (
                mode === 'edit' ? 'Remix Image' : mode === 'animate' ? (
                    <>
                    {!hasApiKey && <Key className="w-4 h-4 mr-2" />}
                    {hasApiKey ? 'Animate Image' : 'Select Key & Animate'}
                    </>
                ) : (
                    (showOverlayInput || generatePrompt === AUTHORITY_PROMPT) ? (
                         <>
                         {!hasApiKey && <Key className="w-4 h-4 mr-2" />}
                         {hasApiKey ? 'Generate Pro Image' : 'Select Key & Generate'}
                         </>
                    ) : 'Generate Image Post'
                )
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-gray-900 rounded-xl p-1 lg:min-h-[600px] flex flex-col border border-gray-800 shadow-2xl">
           <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex justify-between items-center border-b border-gray-700">
             <span className="font-bold text-sm text-white flex items-center">
                 {resultVideo ? <Film className="w-4 h-4 mr-2 text-brand-500" /> : <ImageIcon className="w-4 h-4 mr-2 text-brand-500" />}
                 Result
             </span>
             {(resultImage || resultVideo) && (
                <div className="flex gap-2">
                    {/* Write Blog Post Button - Only for Images */}
                    {resultImage && (
                        <button
                            onClick={handleGenerateBlog}
                            className="text-gray-300 hover:text-white transition-colors flex items-center text-xs bg-white/10 hover:bg-brand-600 px-3 py-1.5 rounded-lg border border-white/5"
                        >
                            <FileText className="w-3 h-3 mr-1" /> Write Article
                        </button>
                    )}

                    <button 
                        onClick={handleSave} 
                        className="text-gray-300 hover:text-white transition-colors flex items-center text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                    >
                        {saved ? <Check className="w-3 h-3 mr-1 text-green-400" /> : <Bookmark className="w-3 h-3 mr-1" />}
                        {saved ? 'Saved' : 'Save'}
                    </button>
                    <a 
                        href={resultVideo || resultImage || '#'} 
                        download={resultVideo ? "animated-video.mp4" : "generated-image.png"} 
                        className="text-gray-300 hover:text-white transition-colors flex items-center text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                    >
                        <Download className="w-3 h-3 mr-1" /> Download
                    </a>
                </div>
             )}
           </div>
           
           <div className="flex-1 flex items-center justify-center bg-black/40 rounded-b-lg p-6 relative overflow-hidden">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-white font-bold text-lg">Creating Magic...</p>
                    <p className="text-brand-400 text-xs mt-2 font-mono uppercase tracking-wider">
                        {mode === 'edit' ? 'Nano Banana Processing' : mode === 'animate' ? 'Veo Rendering Frames' : (showOverlayInput || generatePrompt === AUTHORITY_PROMPT ? 'Nano Banana Pro Generating' : 'Imagen 3 Generating')}
                    </p>
                  </div>
                </div>
              )}
              
              {resultVideo ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <video 
                        src={resultVideo} 
                        controls 
                        autoPlay 
                        loop
                        className="max-h-[500px] w-auto rounded-lg shadow-2xl border border-gray-700"
                    />
                  </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Result" className="max-w-full max-h-[500px] rounded-lg shadow-2xl object-contain" />
              ) : (
                <div className="text-center text-gray-600 max-w-sm">
                  <div className="bg-gray-800 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      {mode === 'animate' ? <PlayCircle className="w-10 h-10 text-gray-600" /> : <ImageIcon className="w-10 h-10 text-gray-600" />}
                  </div>
                  <h3 className="text-gray-300 font-bold text-lg mb-2">Canvas Empty</h3>
                  <p className="text-sm text-gray-500">
                      {mode === 'generate' ? 'Describe your vision or enter text to create an image.' : 'Upload an image to edit or animate it.'}
                  </p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Blog Post Modal */}
      {showBlogModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                      <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
                          <FileText className="w-6 h-6 mr-2 text-brand-500" />
                          Generated Blog Post
                      </h2>
                      <div className="flex items-center gap-2">
                          {blogPost && (
                              <button 
                                onClick={handleCopyBlog}
                                className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                  {blogCopied ? <Check className="w-3 h-3 mr-1.5 text-green-500" /> : <Copy className="w-3 h-3 mr-1.5" />}
                                  {blogCopied ? 'Copied' : 'Copy Text'}
                              </button>
                          )}
                          <button onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                              <X className="w-6 h-6" />
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
                      {generatingBlog ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Writing your article...</h3>
                              <p className="text-gray-500 mt-2">Analyzing image context and crafting strict no-hype content.</p>
                          </div>
                      ) : (
                          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                              <ReactMarkdown>{blogPost || "No content available."}</ReactMarkdown>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-right text-xs text-gray-500">
                      Generated by Gemini 2.5 Flash • 1200-2000 chars • No Jargon
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ImageStudio;