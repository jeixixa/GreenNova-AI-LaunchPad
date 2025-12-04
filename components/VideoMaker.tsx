import React, { useState, useRef, useEffect } from 'react';
import { generateVideo, VideoGenerationParams } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { Loader2, Upload, Video, X, Play, Film, AlertCircle, Key, Bookmark, Check } from 'lucide-react';

const VideoMaker: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setMimeType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
        await handleOpenKeySelect();
        return;
    }

    if (!prompt) return;
    
    setLoading(true);
    setGeneratedVideo(null);
    setSaved(false);
    setStatusMessage('Initializing creation (approx 1-2 mins)...');

    try {
      const params: VideoGenerationParams = {
        prompt,
        aspectRatio,
        resolution,
        image: selectedImage ? {
            data: selectedImage.split(',')[1],
            mimeType
        } : undefined
      };

      const statusInterval = setInterval(() => {
         setStatusMessage(prev => {
            if (prev.includes('Initializing')) return 'Thinking and rendering frames...';
            if (prev.includes('Thinking')) return 'Polishing video pixels...';
            if (prev.includes('Polishing')) return 'Finalizing video output...';
            return prev;
         });
      }, 10000);

      const videoUrl = await generateVideo(params);
      
      clearInterval(statusInterval);
      setGeneratedVideo(videoUrl);
      setStatusMessage('');
    } catch (error: any) {
      console.error("Generation failed", error);
      if (error.message && error.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setStatusMessage("API Key session expired. Please select key again.");
        await handleOpenKeySelect();
      } else {
        setStatusMessage("Failed to generate video. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedVideo) return;
    try {
        // For video, we save the blob URL. 
        // NOTE: Blob URLs expire on reload. 
        // To truly persist, we'd need to convert to Base64, which might be too large for localStorage.
        // We'll try to convert to base64, but fallback to just saving URL with warning if it fails/too big.
        let contentToSave = generatedVideo;
        
        // Try converting small videos to base64
        try {
            const base64 = await blobUrlToBase64(generatedVideo);
             // Check size - if > 4MB, don't save base64
            if (base64.length < 4000000) {
                contentToSave = base64;
            } else {
                alert("Video is too large to save permanently. It will be available during this session only.");
            }
        } catch (e) {
            console.warn("Could not convert video to base64 for storage", e);
        }

        const success = saveItem({
            type: 'Video',
            content: contentToSave,
            title: `Video: ${prompt}`,
        });

        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    } catch (e) {
        console.error("Save failed", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Viral Video Maker</h1>
            <p className="text-gray-500 mt-1">Create stunning videos for Shorts, Reels, or Ads using Gemini Veo.</p>
        </div>
        {!hasApiKey && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg text-sm border border-amber-200">
                <AlertCircle className="w-4 h-4 mr-2" />
                API Key Required
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Prompt Input */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-900 mb-2">Video Prompt</label>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create in detail..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 h-32 resize-none text-sm"
            />
          </div>

          {/* Image Reference */}
          <div 
             onClick={() => fileInputRef.current?.click()}
             className={`
               bg-white p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors group relative
               ${selectedImage ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
             `}
          >
             <input 
               type="file" 
               ref={fileInputRef}
               onChange={handleFileSelect}
               accept="image/*"
               className="hidden"
             />
             
             {selectedImage ? (
               <div className="relative">
                 <div className="flex items-center space-x-3">
                   <img src={selectedImage} alt="Reference" className="h-16 w-16 object-cover rounded-lg shadow-sm" />
                   <div>
                     <p className="text-sm font-bold text-gray-900">Image Reference Added</p>
                     <p className="text-xs text-gray-500">Veo will use this to guide the video.</p>
                   </div>
                 </div>
                 <button 
                   onClick={clearImage}
                   className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-2 text-center">
                  <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
                     <Upload className="w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Reference Image (Optional)</p>
               </div>
             )}
          </div>

          {/* Settings */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setAspectRatio('9:16')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${aspectRatio === '9:16' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                        9:16 (Shorts/Reels)
                    </button>
                    <button 
                        onClick={() => setAspectRatio('16:9')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${aspectRatio === '16:9' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                        16:9 (Landscape)
                    </button>
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Resolution</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setResolution('720p')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${resolution === '720p' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                        720p (Faster)
                    </button>
                    <button 
                        onClick={() => setResolution('1080p')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${resolution === '1080p' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                        1080p (HD)
                    </button>
                </div>
             </div>
          </div>
          
          {!hasApiKey ? (
            <button
                onClick={handleOpenKeySelect}
                className="w-full py-4 px-6 rounded-xl font-black text-lg text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all flex items-center justify-center"
            >
                <Key className="w-5 h-5 mr-2" />
                Select API Key to Enable
            </button>
          ) : (
            <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className={`
                    w-full py-4 px-6 rounded-xl font-black text-lg text-white shadow-lg transition-all flex items-center justify-center
                    ${loading || !prompt ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-brand-600 hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] shadow-brand-200'}
                `}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        Generating Video...
                    </>
                ) : (
                    <>
                        <Video className="w-5 h-5 mr-2" />
                        Generate Video
                    </>
                )}
            </button>
          )}
          
          <div className="text-center">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-brand-600 underline">
                View Billing Information
            </a>
          </div>
        </div>

        {/* Output Display */}
        <div className="lg:col-span-7">
           <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col border border-gray-800">
              <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <Film className="w-4 h-4 text-brand-500" />
                    <span className="text-gray-300 text-sm font-medium">Video Preview</span>
                </div>
                {generatedVideo && (
                    <button 
                        onClick={handleSave}
                        className="text-gray-300 hover:text-white flex items-center text-xs font-medium bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {saved ? <Check className="w-3 h-3 mr-1 text-green-400" /> : <Bookmark className="w-3 h-3 mr-1" />}
                        {saved ? 'Saved' : 'Save to Library'}
                    </button>
                )}
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center relative bg-black/50 backdrop-blur-sm p-8">
                 {loading ? (
                    <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                            <Video className="absolute inset-0 m-auto w-8 h-8 text-white" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">Creating Magic</p>
                        <p className="text-brand-200 text-sm animate-pulse">{statusMessage}</p>
                    </div>
                 ) : generatedVideo ? (
                    <div className="w-full h-full flex flex-col items-center">
                        <video 
                            src={generatedVideo} 
                            controls 
                            autoPlay 
                            loop
                            className="max-h-[600px] w-auto rounded-lg shadow-2xl border border-gray-700"
                        />
                        <div className="mt-6 flex items-center space-x-4">
                             <a 
                               href={generatedVideo} 
                               download="generated-video.mp4"
                               className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors flex items-center"
                             >
                                Download Video
                             </a>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center max-w-sm">
                        <div className="bg-gray-800 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transform rotate-12">
                            <Film className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Ready to Produce</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Enter your prompt on the left and select your settings. The Veo model will generate a high-quality video based on your vision.
                        </p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMaker;