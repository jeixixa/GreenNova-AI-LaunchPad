
import React, { useState, useRef, useEffect } from 'react';
import { editImageWithPrompt, generateImage, generateVideo, generateImageNanoPro, generateImageNano } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { Loader2, Upload, Image as ImageIcon, Download, Bookmark, Check, Sparkles, Film, Key, Zap, Video, Type, Palette, X } from 'lucide-react';

const AUTHORITY_PROMPT = "Create a high-authority brand image. Professional, clean, and inspiring.";

const ImageStudio: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<'generate' | 'edit' | 'animate'>('generate');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState('');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [showOverlayInput, setShowOverlayInput] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('Modern');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [hasApiKey, setHasApiKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
    // Load Auto-Saved Data
    const savedData = localStorage.getItem('sbl_autosave_image_studio');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.generatePrompt) setGeneratePrompt(parsed.generatePrompt);
            if (parsed.editPrompt) setEditPrompt(parsed.editPrompt);
            if (parsed.overlayText) setOverlayText(parsed.overlayText);
            if (parsed.mode) setMode(parsed.mode);
            if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
            if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
            if (parsed.resultImage) setResultImage(parsed.resultImage);
            if (parsed.showOverlayInput) setShowOverlayInput(parsed.showOverlayInput);
        } catch (e) {
            console.error("Failed to load image studio data", e);
        }
    }
  }, []);

  // Save Auto-Saved Data
  useEffect(() => {
    const dataToSave = { 
        generatePrompt, 
        editPrompt, 
        overlayText, 
        mode, 
        selectedTheme, 
        aspectRatio, 
        resultImage, 
        showOverlayInput
    };
    try {
        localStorage.setItem('sbl_autosave_image_studio', JSON.stringify(dataToSave));
    } catch (e) {
        console.warn("Auto-save failed (likely storage quota exceeded)", e);
    }
  }, [generatePrompt, editPrompt, overlayText, mode, selectedTheme, aspectRatio, resultImage, showOverlayInput]);

  const checkApiKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        setHasApiKey(await win.aistudio.hasSelectedApiKey());
    } else {
        setHasApiKey(!!process.env.API_KEY);
    }
  };

  const handleOpenKeySelect = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
        setHasApiKey(true);
    } else {
        alert("API Key selection not supported in this environment");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setSelectedImage(event.target.result as string);
                setMimeType(file.type);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const getViralTextTemplate = (text: string, theme: string) => {
    return `Create an image with the text "${text}" overlaid in a ${theme} style. High quality, readable font.`;
  };

  const handleLoadTheme = () => {
      setGeneratePrompt("Generate a high-quality, brand-consistent image representing sustainable business growth. Use a 'Digital Empire' theme with dark, moody, neon elements, featuring a confident entrepreneur. Ensure the bottom 40% of the image has clean negative space for quote overlay.");
  };

  const handleGenerateNano = async () => {
      if (!generatePrompt) return;
      setLoading(true);
      setResultImage(null);
      setResultVideo(null);
      setSaved(false);

      try {
          const result = await generateImageNano(generatePrompt);
          setResultImage(result);
          trackEvent('image_generated');
      } catch (error: any) {
          console.error("Nano Generation failed", error);
          alert("Nano generation failed. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const handleProcess = async () => {
    setLoading(true);
    setResultImage(null);
    setResultVideo(null);
    setSaved(false);
    
    try {
      if (mode === 'edit') {
        // Powered by Nano Banana (Gemini 2.5 Flash Image)
        if (!selectedImage || !editPrompt) return;
        const base64Data = selectedImage.split(',')[1];
        const result = await editImageWithPrompt(base64Data, mimeType, editPrompt);
        setResultImage(result);
        trackEvent('image_generated');
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
        trackEvent('video_generated');
      } else {
        // Generate Mode
        let finalPrompt = generatePrompt;
        
        // Inject overlay text if available
        if (showOverlayInput && overlayText.trim()) {
             finalPrompt = getViralTextTemplate(overlayText, selectedTheme);
             
             // Use Nano Banana Pro (Gemini 3 Pro) for superior text rendering
             if (!hasApiKey) {
                await handleOpenKeySelect();
                setLoading(false);
                return;
             }
             const result = await generateImageNanoPro(finalPrompt, aspectRatio);
             setResultImage(result);
             trackEvent('image_generated');

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
             trackEvent('image_generated');

        } else {
             // Standard generation (Imagen)
             if (!finalPrompt) return;
             // Check if user has key for Imagen, otherwise fallback or prompt
             // Assuming Imagen requires key similar to others if not free
             // For now standard call
             const result = await generateImage(finalPrompt, aspectRatio);
             setResultImage(result);
             trackEvent('image_generated');
        }
      }
    } catch (error: any) {
        console.error("Processing failed", error);
        alert("Operation failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resultImage && !resultVideo) return;
    
    let contentToSave = resultImage || resultVideo || '';
    const type = resultVideo ? 'Video' : 'Image';

    if (resultVideo) {
        try {
             // Attempt to download the video to store offline/persistently
            const base64 = await blobUrlToBase64(resultVideo);
            if (base64.length < 4500000) { 
                contentToSave = base64;
            }
        } catch (e) {
            console.warn("Failed to download video for storage.", e);
        }
    }

    const success = saveItem({
        type,
        content: contentToSave,
        title: `${mode.toUpperCase()} - ${new Date().toLocaleTimeString()}`
    });

    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-6">
         <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
            <ImageIcon className="w-8 h-8 mr-3 text-brand-500" />
            Image Studio
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-1">Generate, Edit, or Animate visuals for your brand.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
                    {(['generate', 'edit', 'animate'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${mode === m ? 'bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-brand-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {mode === 'generate' && (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Image Prompt</label>
                                <button onClick={handleLoadTheme} className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center font-bold transition-colors">
                                    <Sparkles className="w-3 h-3 mr-1" /> Digital Empire Theme
                                </button>
                            </div>
                            <textarea
                                value={generatePrompt}
                                onChange={(e) => setGeneratePrompt(e.target.value)}
                                placeholder="Describe the image you want..."
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-24 resize-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <input type="checkbox" checked={showOverlayInput} onChange={(e) => setShowOverlayInput(e.target.checked)} id="overlay" />
                             <label htmlFor="overlay" className="text-sm text-gray-700 dark:text-gray-300">Add Text Overlay</label>
                        </div>
                        {showOverlayInput && (
                            <div>
                                <input
                                    type="text"
                                    value={overlayText}
                                    onChange={(e) => setOverlayText(e.target.value)}
                                    placeholder="Text to display on image..."
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white mb-2"
                                />
                                <select 
                                    value={selectedTheme} 
                                    onChange={(e) => setSelectedTheme(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm dark:text-white"
                                >
                                    <option>Modern</option>
                                    <option>Retro</option>
                                    <option>Neon</option>
                                    <option>Minimalist</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aspect Ratio</label>
                            <div className="flex gap-2">
                                {['1:1', '16:9', '9:16'].map(ratio => (
                                    <button 
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${aspectRatio === ratio ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(mode === 'edit' || mode === 'animate') && (
                    <div className="space-y-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                            {selectedImage ? (
                                <img src={selectedImage} alt="Selected" className="max-h-32 object-contain mb-2 rounded" />
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            )}
                            <span className="text-xs font-bold text-gray-500">{selectedImage ? 'Click to change' : 'Upload Source Image'}</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instruction Prompt</label>
                            <textarea
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder={mode === 'edit' ? "e.g., Make it snowy, add a cat..." : "e.g., Animate the water flowing..."}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-24 resize-none"
                            />
                        </div>
                    </div>
                )}

                {mode === 'generate' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                        <button
                            onClick={handleProcess}
                            disabled={loading || !generatePrompt}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center
                                ${loading || !generatePrompt
                                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none' 
                                    : 'bg-brand-900 hover:bg-brand-800 border-2 border-brand-700 shadow-brand-900/20'}`}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Imagen (Pro)
                        </button>
                        <button
                            onClick={handleGenerateNano}
                            disabled={loading || !generatePrompt}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center border
                                ${loading || !generatePrompt
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100'}`}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                            Nano (Free)
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleProcess}
                        disabled={loading || !selectedImage}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center mt-6
                            ${loading || !selectedImage 
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none' 
                                : 'bg-brand-900 hover:bg-brand-800 border-2 border-brand-700 shadow-brand-900/20'}`}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {mode === 'edit' ? 'Edit Image' : 'Generate Video'}
                    </button>
                )}
                
                {mode === 'animate' && !hasApiKey && (
                     <p className="text-[10px] text-red-400 mt-2 text-center">Video generation requires a paid API key.</p>
                )}
            </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {(resultImage || resultVideo) && (
                        <>
                            <button onClick={handleSave} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                                {saved ? <Check className="w-5 h-5 text-green-400" /> : <Bookmark className="w-5 h-5" />}
                            </button>
                            <a href={resultVideo || resultImage!} download className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                                <Download className="w-5 h-5" />
                            </a>
                        </>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                            <p className="text-white font-bold text-lg">Creating Magic...</p>
                        </div>
                    ) : resultVideo ? (
                        <video src={resultVideo} controls autoPlay loop className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    ) : resultImage ? (
                        <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    ) : (
                        <div className="text-center text-gray-600">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Your creation will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
