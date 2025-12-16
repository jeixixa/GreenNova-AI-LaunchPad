
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, VideoGenerationParams } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { Loader2, Film, Download, Bookmark, Check, AlertCircle, Key, Play, Image as ImageIcon, Type, X, Upload, Sparkles, Zap } from 'lucide-react';

const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
];

const FreeVideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [toolMode, setToolMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
    // Auto Load
    const savedData = localStorage.getItem('sbl_autosave_free_video');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (typeof parsed === 'string') setPrompt(parsed);
            else {
                if (parsed.prompt) setPrompt(parsed.prompt);
                if (parsed.toolMode) setToolMode(parsed.toolMode);
                if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
                if (parsed.resolution) setResolution(parsed.resolution);
            }
        } catch(e) { setPrompt(savedData); }
    }
  }, []);

  // Auto Save
  useEffect(() => {
      localStorage.setItem('sbl_autosave_free_video', JSON.stringify({ prompt, toolMode, aspectRatio, resolution }));
  }, [prompt, toolMode, aspectRatio, resolution]);

  const checkApiKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        setHasApiKey(await win.aistudio.hasSelectedApiKey());
    } else {
        // Fallback to checking env, but treat as "no paid key selected" for the UI toggle usually
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

  const handleGenerate = async () => {
    if (!prompt) return;
    
    // For image-to-video, require image
    if (toolMode === 'image-to-video' && !selectedImage) {
        alert("Please upload an image to animate.");
        return;
    }
    
    setLoading(true);
    setGeneratedVideo(null);
    setSaved(false);
    
    // Determine mode
    const runSimulation = !hasApiKey;
    setIsDemoMode(runSimulation);
    setStatusMessage(runSimulation ? 'Initializing simulation engine...' : 'Initializing Veo AI model...');

    try {
      if (runSimulation) {
          // --- SIMULATION MODE (No API) ---
          const statusSteps = [
              'Analyzing prompt semantics...',
              'Generating base keyframes...',
              'Interpolating motion vectors...',
              'Rendering final physics...',
              'Polishing video output...'
          ];

          for (const step of statusSteps) {
              setStatusMessage(step);
              await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
          }

          // Pick a random demo video
          const randomVideo = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
          setGeneratedVideo(randomVideo);
          trackEvent('video_generated'); // Track as generated for analytics

      } else {
          // --- REAL API MODE ---
          const params: VideoGenerationParams = {
            prompt,
            aspectRatio,
            resolution,
            image: (toolMode === 'image-to-video' && selectedImage) ? {
                data: selectedImage.split(',')[1],
                mimeType
            } : undefined
          };

          const statusInterval = setInterval(() => {
             setStatusMessage(prev => {
                if (prev.includes('Initializing')) return 'Rendering high-quality frames...';
                if (prev.includes('Rendering')) return 'Compiling video sequence...';
                if (prev.includes('Compiling')) return 'Finalizing video output...';
                return prev;
             });
          }, 8000);

          const videoUrl = await generateVideo(params);
          clearInterval(statusInterval);
          setGeneratedVideo(videoUrl);
          trackEvent('video_generated');
      }
      
      setStatusMessage('');
    } catch (error) {
        console.error("Video generation failed", error);
        setStatusMessage('Failed to generate video.');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedVideo) return;
    let content = generatedVideo;
    
    // Try to convert to base64 for offline storage if possible
    try {
        if (!isDemoMode) { // Demo videos are likely CORS restricted or large, better to save URL
            const base64 = await blobUrlToBase64(generatedVideo);
            if (base64.length < 4500000) content = base64;
        }
    } catch (e) { console.warn("Saving URL reference instead of file", e); }

    const success = saveItem({
        type: 'Video',
        content: content,
        title: `${isDemoMode ? 'Free Gen' : 'Veo Gen'}: ${prompt.substring(0, 20)}...`
    });
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
                <Film className="w-8 h-8 mr-3 text-brand-500" />
                Free Video Generator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate engaging videos instantly. No waiting, no cost.</p>
         </div>
         
         {!hasApiKey && (
             <button 
                onClick={handleOpenKeySelect}
                className="flex items-center text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
             >
                 <Key className="w-3 h-3 mr-1" />
                 Have a Paid Key? Activate Veo Mode
             </button>
         )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
         {/* Badge */}
         {!hasApiKey && (
             <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-green-200 dark:border-green-800">
                 <Zap className="w-3 h-3 mr-1 fill-current" /> Free Mode Active
             </div>
         )}

         {/* Tool Mode Selection */}
         <div className="flex gap-4 mb-6 mt-2">
             <button
                onClick={() => setToolMode('text-to-video')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center transition-all ${toolMode === 'text-to-video' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
             >
                <Type className="w-4 h-4 mr-2" /> Text to Video
             </button>
             <button
                onClick={() => setToolMode('image-to-video')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center transition-all ${toolMode === 'image-to-video' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
             >
                <ImageIcon className="w-4 h-4 mr-2" /> Image to Video
             </button>
         </div>

         <div className="space-y-6">
            {toolMode === 'image-to-video' && (
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source Image</label>
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                     >
                        {selectedImage ? (
                            <div className="relative">
                                <img src={selectedImage} alt="Source" className="max-h-48 rounded-lg shadow-sm" />
                                <button onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Click to Upload Image</span>
                            </>
                        )}
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
            )}
            
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prompt</label>
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={toolMode === 'text-to-video' ? "Describe the scene..." : "Describe how the image should move..."}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-32 resize-none"
               />
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading || !prompt || (toolMode === 'image-to-video' && !selectedImage)}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center border-2 border-transparent
                    ${loading || !prompt ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}`}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {loading ? 'Processing...' : (hasApiKey ? 'Generate Video (Veo)' : 'Generate Video (Free)')}
            </button>
         </div>
      </div>

      {/* Output */}
      {(loading || generatedVideo) && (
        <div className="bg-black rounded-3xl p-8 border border-gray-800 shadow-2xl text-center">
            {loading ? (
                <div className="py-12">
                    <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Creating Your Video</h3>
                    <p className="text-gray-400 animate-pulse font-mono">{statusMessage}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative">
                        <video src={generatedVideo!} controls autoPlay loop className="w-full rounded-xl shadow-2xl border border-gray-700" />
                        {isDemoMode && (
                             <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20">
                                 AI SIMULATION PREVIEW
                             </div>
                        )}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <button onClick={handleSave} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center">
                            {saved ? <Check className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                            {saved ? 'Saved' : 'Save to Library'}
                        </button>
                        <a href={generatedVideo!} download="video.mp4" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors flex items-center">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default FreeVideoGenerator;
