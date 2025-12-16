
import React, { useState, useEffect, useRef } from 'react';
import { generateImageNanoPro, generateImageNano } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { Loader2, Download, Bookmark, Check, Shield, Key, LayoutTemplate, PenTool, Type, RefreshCw, X, Zap, Upload, ImageIcon, Sparkles } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    promptTemplate: (headline: string, body: string, brand: string) => string;
}

const TEMPLATES: Template[] = [
    {
        id: 'quote-dark',
        name: 'Dark Authority Quote',
        description: 'Dark background, white bold typography, gold accents.',
        promptTemplate: (h, b, brand) => `Create a high-end social media quote card. Background: Matte black luxury texture. Typography: Big bold white sans-serif font for the headline "${h}". Body text: "${b}" in smaller grey font. Branding: "${brand}" logo style at bottom. Mood: Serious, Authoritative, Business.`
    },
    {
        id: 'tech-neon',
        name: 'Neon Tech Insight',
        description: 'Cyberpunk gradient, glowing text, futuristic.',
        promptTemplate: (h, b, brand) => `Create a futuristic tech insight post. Background: Deep blue and purple neon gradients. Typography: Glowing cyan text for "${h}". Body text: "${b}" in crisp white. Branding: "${brand}" in corner. Mood: Innovative, Cutting-edge.`
    },
    {
        id: 'minimal-clean',
        name: 'Minimalist Wisdom',
        description: 'White background, black text, plenty of whitespace.',
        promptTemplate: (h, b, brand) => `Create a minimalist Instagram carousel slide. Background: Pure white or very light grey. Typography: Massive black Helvetica font for "${h}". Body text: "${b}" in readable dark grey. Branding: "${brand}" small and centered at bottom. Mood: Clean, Smart, Essential.`
    }
];

const AuthorityGenerator: React.FC = () => {
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [generatingNano, setGeneratingNano] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
    // Load Auto-Saved Data
    const savedData = localStorage.getItem('sbl_autosave_authority');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.headline) setHeadline(parsed.headline);
            if (parsed.body) setBody(parsed.body);
            if (parsed.brand) setBrand(parsed.brand);
            if (parsed.generatedImage) setGeneratedImage(parsed.generatedImage);
        } catch (e) {
            console.error("Failed to load authority data", e);
        }
    }
  }, []);

  // Save Auto-Saved Data
  useEffect(() => {
      const data = { headline, body, brand, generatedImage };
      try {
        localStorage.setItem('sbl_autosave_authority', JSON.stringify(data));
      } catch (e) {
        console.warn("Auto-save failed (likely storage quota)", e);
      }
  }, [headline, body, brand, generatedImage]);

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
          const base64 = (event.target.result as string).split(',')[1];
          setSelectedImage({ data: base64, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
        await handleOpenKeySelect();
        return;
    }

    if (!headline || !selectedTemplate) return;

    setLoading(true);
    setGeneratedImage(null);
    setSaved(false);

    try {
        let prompt = selectedTemplate.promptTemplate(headline, body, brand);
        let imageContext = undefined;

        if (selectedImage) {
            prompt += " \n\n**CRITICAL INSTRUCTION**: The attached image is the User's Brand Logo / Avatar. You MUST incorporate this specific image visually into the composition (e.g., as a profile picture, watermark, or logo overlay) as specified by the template description. Ensure the branding is clear.";
            imageContext = {
                data: selectedImage.data,
                mimeType: selectedImage.mimeType
            };
        }

        // Using Nano Pro (Gemini 3 Pro) for best text rendering capabilities
        const result = await generateImageNanoPro(prompt, '4:5', imageContext);
        setGeneratedImage(result);
        
        // TRACK EVENT
        trackEvent('image_generated');

    } catch (error) {
        console.error("Failed to generate authority image", error);
        alert("Generation failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateNano = async () => {
    if (!headline || !selectedTemplate) return;

    setGeneratingNano(true);
    setGeneratedImage(null);
    setSaved(false);

    try {
        let prompt = selectedTemplate.promptTemplate(headline, body, brand);
        let imageContext = undefined;

        if (selectedImage) {
            prompt += " \n\n**CRITICAL INSTRUCTION**: The attached image is the User's Brand Logo / Avatar. You MUST incorporate this specific image visually into the composition (e.g., as a profile picture, watermark, or logo overlay) as specified by the template description. Ensure the branding is clear.";
            imageContext = {
                data: selectedImage.data,
                mimeType: selectedImage.mimeType
            };
        }

        const result = await generateImageNano(prompt, imageContext);
        setGeneratedImage(result);
        
        // TRACK EVENT
        trackEvent('image_generated');

    } catch (error) {
        console.error("Failed to generate nano image", error);
        alert("Generation failed. Please try again.");
    } finally {
        setGeneratingNano(false);
    }
  };

  const handleSave = () => {
    if (!generatedImage) return;
    const success = saveItem({
        type: 'Image',
        content: generatedImage,
        title: `Authority Post: ${headline.substring(0, 20)}...`
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
            <Shield className="w-8 h-8 mr-3 text-brand-500" />
            Authority Generator
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-1">Create text-heavy, high-status viral images for Instagram & LinkedIn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Configuration */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-4">
                    <PenTool className="w-4 h-4 mr-2 text-brand-500" /> Content Details
                </h3>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Headline (The Hook)</label>
                    <input 
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. STOP TRADING TIME FOR MONEY"
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white font-bold"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Body Text (The Insight)</label>
                    <textarea 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Keep it short. E.g., 'Wealth is created by systems, not hours. Build assets that pay you while you sleep.'"
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-24 resize-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Name / Handle</label>
                    <input 
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="@username"
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo / Avatar (Optional)</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors relative h-32"
                    >
                        {selectedImage ? (
                            <>
                                <img 
                                    src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                                    alt="Selected Logo" 
                                    className="h-full w-full object-contain rounded-md"
                                />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <span className="text-xs text-gray-400 font-bold">Click to Upload Logo</span>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-4">
                    <LayoutTemplate className="w-4 h-4 mr-2 text-brand-500" /> Style Template
                </h3>
                <div className="space-y-3">
                    {TEMPLATES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTemplate(t)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTemplate.id === t.id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' : 'bg-gray-50 border-gray-200 hover:border-brand-300'}`}
                        >
                            <p className="font-bold text-sm text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleGenerate}
                    disabled={loading || generatingNano || !headline}
                    className={`col-span-2 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 border-2 border-brand-700 shadow-brand-900/20'}`}
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : (!hasApiKey && <Key className="w-4 h-4 mr-2" />)}
                    {loading ? 'Designing...' : (hasApiKey ? 'Generate High-Res (Pro)' : 'Unlock Pro Generation')}
                </button>
                <button
                    onClick={handleGenerateNano}
                    disabled={loading || generatingNano || !headline}
                    className="col-span-2 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                    {generatingNano ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    Fast Draft (Nano)
                </button>
            </div>
         </div>

         {/* Preview */}
         <div className="lg:col-span-8">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl h-[700px] flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {generatedImage && (
                        <>
                            <button onClick={handleSave} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                                {saved ? <Check className="w-5 h-5 text-green-400" /> : <Bookmark className="w-5 h-5" />}
                            </button>
                            <a href={generatedImage} download="authority-post.png" className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                                <Download className="w-5 h-5" />
                            </a>
                        </>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                    {(loading || generatingNano) ? (
                         <div className="text-center">
                            <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">Generating Authority...</h3>
                            <p className="text-gray-400">Rendering perfect typography and layout.</p>
                        </div>
                    ) : generatedImage ? (
                        <img src={generatedImage} alt="Authority Post" className="max-h-full max-w-full rounded-lg shadow-2xl" />
                    ) : (
                        <div className="text-center text-gray-600 max-w-sm">
                            <Sparkles className="w-20 h-20 mx-auto mb-6 opacity-20" />
                            <h3 className="text-xl font-bold text-gray-500 mb-2">Your Empire Starts Here</h3>
                            <p className="text-sm">Design authority-building visuals that stop the scroll and build trust instantly.</p>
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuthorityGenerator;
