
import React, { useState, useRef, useEffect } from 'react';
import { generateFaceFusion, generateFaceFusionNano, generateVideoFromImages } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { Loader2, Upload, Users, Image as ImageIcon, X, Download, Bookmark, Check, Key, Zap, Film, Sparkles } from 'lucide-react';
import VoiceInput from './VoiceInput';

interface GeneratedAsset {
    id: string;
    type: 'image' | 'video';
    url: string;
    prompt: string;
}

const FaceFusion: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<{data: string, mimeType: string, url: string}[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'pro' | 'nano' | 'animate' | null>(null);
  
  // History of generated items
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  
  const [saved, setSaved] = useState<string | null>(null); // Store ID of saved item
  const [hasApiKey, setHasApiKey] = useState(false);
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
    // Auto Load
    const savedData = localStorage.getItem('sbl_autosave_face_fusion');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (typeof parsed === 'string') setPrompt(parsed);
            else {
                if (parsed.prompt) setPrompt(parsed.prompt);
                if (parsed.generatedAssets) setGeneratedAssets(parsed.generatedAssets);
            }
        } catch(e) { setPrompt(savedData); }
    }
  }, []);

  // Auto Save
  useEffect(() => {
      try {
        // Only save last 5 assets to save space
        const recentAssets = generatedAssets.slice(0, 5); 
        localStorage.setItem('sbl_autosave_face_fusion', JSON.stringify({ prompt, generatedAssets: recentAssets }));
      } catch(e) { 
          console.warn("Auto-save failed", e);
      }
  }, [prompt, generatedAssets]);

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
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            setSelectedImages(prev => [...prev, {
                data: base64Data,
                mimeType: file.type,
                url: reader.result as string
            }]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (type: 'pro' | 'nano' | 'animate') => {
    if ((type === 'pro' || type === 'animate') && !hasApiKey) {
        await handleOpenKeySelect();
        return;
    }

    if (selectedImages.length === 0 || !prompt) return;
    
    setLoading(true);
    setLoadingType(type);
    
    try {
        let resultUrl = '';
        if (type === 'pro') {
            resultUrl = await generateFaceFusion(selectedImages, prompt);
        } else if (type === 'nano') {
            resultUrl = await generateFaceFusionNano(selectedImages, prompt);
        } else if (type === 'animate') {
            resultUrl = await generateVideoFromImages(selectedImages, prompt);
        }

        if (resultUrl) {
            const newAsset: GeneratedAsset = {
                id: crypto.randomUUID(),
                type: type === 'animate' ? 'video' : 'image',
                url: resultUrl,
                prompt: prompt
            };
            setGeneratedAssets(prev => [newAsset, ...prev]);
        }
    } catch (error: any) {
        console.error("Generation failed", error);
        if (error.message && error.message.includes("Requested entity was not found")) {
            setHasApiKey(false);
            await handleOpenKeySelect();
        } else {
            alert("Failed to generate content. Please try again.");
        }
    } finally {
        setLoading(false);
        setLoadingType(null);
    }
  };

  const handleSave = async (asset: GeneratedAsset) => {
    let contentToSave = asset.url;

    // For videos, try to convert to base64 to persist (if size allows)
    // The URLs from Veo are temporary and depend on API key validity
    if (asset.type === 'video') {
        try {
             // Attempt to download the video to store offline/persistently
            const base64 = await blobUrlToBase64(asset.url);
            // LocalStorage limit is small (~5MB), check size roughly
            if (base64.length < 4500000) { 
                contentToSave = base64;
            } else {
                console.warn("Video too large for local storage, saving remote URL reference.");
            }
        } catch (e) {
            console.warn("Failed to download video for storage, saving URL instead.", e);
        }
    }

    const success = saveItem({
      type: asset.type === 'video' ? 'Video' : 'Image',
      content: contentToSave,
      title: `Face Fusion: ${asset.prompt.substring(0, 30)}...`,
    });
    
    if (success) {
        setSaved(asset.id);
        setTimeout(() => setSaved(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-brand-500" />
            Creative Face Fusion
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload photos of you and your friends, and generate new creative images or animations of you all doing cool things together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                        <Upload className="w-4 h-4 mr-2 text-brand-500" />
                        Upload Reference Photos
                    </h3>
                    <span className="text-xs text-gray-400">{selectedImages.length} images selected</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {selectedImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                            <img src={img.url} alt={`Ref ${idx}`} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors"
                    >
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-bold mt-1">Add Photo</span>
                    </div>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Creative Prompt</h3>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Us as superheroes flying over a futuristic city, digital art style..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none text-gray-900 dark:text-white placeholder-gray-500 pr-10"
                />
                <div className="absolute bottom-4 right-4">
                    <VoiceInput onTranscript={(text) => setPrompt(prev => prev ? prev + ' ' + text : text)} className="w-8 h-8 p-1.5" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    onClick={() => handleGenerate('pro')}
                    disabled={loading || selectedImages.length === 0 || !prompt}
                    className={`
                        py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center border-2 border-transparent
                        ${loading || selectedImages.length === 0 || !prompt
                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none text-gray-500' 
                            : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}
                    `}
                >
                    {loading && loadingType === 'pro' ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : (!hasApiKey && <Key className="w-4 h-4 mr-2" />)}
                    {hasApiKey ? 'Pro Fusion (Gemini 3)' : 'Select Key & Pro Fusion'}
                </button>

                <button
                    onClick={() => handleGenerate('nano')}
                    disabled={loading || selectedImages.length === 0 || !prompt}
                    className={`
                        py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center border
                        ${loading || selectedImages.length === 0 || !prompt
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent cursor-not-allowed' 
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'}
                    `}
                >
                    {loading && loadingType === 'nano' ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    Fast Fusion (Nano)
                </button>
            </div>
            
            <button
                onClick={() => handleGenerate('animate')}
                disabled={loading || selectedImages.length === 0 || !prompt}
                className={`
                    w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center
                    ${loading || selectedImages.length === 0 || !prompt
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none text-gray-500' 
                        : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}
                `}
            >
                {loading && loadingType === 'animate' ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Film className="w-4 h-4 mr-2" />}
                {!hasApiKey && <Key className="w-4 h-4 mr-1" />}
                Generate Animation (Veo)
            </button>
            
            <p className="text-center text-xs text-gray-400">
                Pro Fusion & Animation require paid API keys. Nano Fusion is faster and free-tier friendly.
            </p>
        </div>

        {/* Result Section (Gallery) */}
        <div className="bg-gray-900 rounded-xl p-1 lg:min-h-[600px] flex flex-col border border-gray-800 shadow-2xl">
           <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex justify-between items-center border-b border-gray-700">
             <span className="font-bold text-sm text-white flex items-center">
                 <ImageIcon className="w-4 h-4 mr-2 text-brand-500" />
                 Results Gallery
             </span>
             {generatedAssets.length > 0 && (
                <span className="text-xs text-gray-400">{generatedAssets.length} Generated</span>
             )}
           </div>
           
           <div className="flex-1 bg-black/40 rounded-b-lg p-6 relative overflow-y-auto custom-scrollbar">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm rounded-b-lg">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold text-lg">Generating Content...</p>
                    <p className="text-brand-400 text-xs mt-2 font-mono uppercase tracking-wider">
                        {loadingType === 'nano' ? 'Nano Banana Processing' : loadingType === 'animate' ? 'Veo Creating Animation' : 'Gemini 3 Pro Processing'}
                    </p>
                  </div>
                </div>
              )}
              
              {generatedAssets.length > 0 ? (
                <div className="space-y-8">
                    {generatedAssets.map((asset, index) => (
                        <div key={asset.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                             <div className="flex justify-between items-center mb-3">
                                 <span className={`text-xs font-bold px-2 py-1 rounded ${asset.type === 'video' ? 'bg-purple-900/50 text-purple-300' : 'bg-brand-900/50 text-brand-300'}`}>
                                     {asset.type === 'video' ? 'Animation (Veo)' : 'Image Fusion'}
                                 </span>
                                 <div className="flex gap-2">
                                     <button 
                                         onClick={() => handleSave(asset)} 
                                         className="text-gray-300 hover:text-white transition-colors flex items-center text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                                     >
                                         {saved === asset.id ? <Check className="w-3 h-3 mr-1 text-green-400" /> : <Bookmark className="w-3 h-3 mr-1" />}
                                         {saved === asset.id ? 'Saved' : 'Save'}
                                     </button>
                                     <a 
                                         href={asset.url} 
                                         download={asset.type === 'video' ? `fusion-anim-${index}.mp4` : `fusion-img-${index}.png`} 
                                         className="text-gray-300 hover:text-white transition-colors flex items-center text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
                                     >
                                         <Download className="w-3 h-3 mr-1" /> Download
                                     </a>
                                 </div>
                             </div>
                             
                             {asset.type === 'video' ? (
                                <video 
                                    src={asset.url} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="w-full rounded-lg shadow-xl"
                                />
                             ) : (
                                <img 
                                    src={asset.url} 
                                    alt={`Generated ${index}`} 
                                    className="w-full rounded-lg shadow-xl object-contain max-h-[500px]" 
                                />
                             )}
                             <p className="text-xs text-gray-500 mt-2 truncate">{asset.prompt}</p>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 max-w-sm mx-auto">
                  <div className="bg-gray-800 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-gray-300 font-bold text-lg mb-2">Ready to Fuse</h3>
                  <p className="text-sm text-gray-500">
                      Upload your photos and describe a scene. Use Nano for fast drafts, or Animate to bring them to life.
                  </p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default FaceFusion;
