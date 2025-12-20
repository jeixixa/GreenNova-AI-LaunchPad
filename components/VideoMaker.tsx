
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo, VideoGenerationParams, generateVideoMeta } from '../services/geminiService';
import { saveItem, blobUrlToBase64 } from '../services/storageService';
import { trackEvent } from '../services/analyticsService';
import { Loader2, Upload, Video, X, Play, Film, AlertCircle, Key, Bookmark, Check, Layers, Zap, PenTool, Layout, Smartphone, Share2, GripVertical, Undo, Redo, RefreshCw, RotateCcw } from 'lucide-react';

interface TimelineClip {
    id: number;
    name: string;
    start: number;
    end: number;
    url: string;
}

const VideoMaker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'editor'>('generator');

  // Generator State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Editor State
  const [editorVideo, setEditorVideo] = useState<string | null>(null);
  const [editorVideoName, setEditorVideoName] = useState<string>('Untitled Project');
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [aiToolOutput, setAiToolOutput] = useState('');
  const [aiToolLoading, setAiToolLoading] = useState(false);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);

  // Undo/Redo State
  const [history, setHistory] = useState<TimelineClip[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [hasApiKey, setHasApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkApiKey();
    // Auto Load
    const savedData = localStorage.getItem('sbl_autosave_video_maker');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (typeof parsed === 'string') setPrompt(parsed);
            else {
                if (parsed.prompt) setPrompt(parsed.prompt);
                if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
                if (parsed.resolution) setResolution(parsed.resolution);
            }
        } catch(e) { setPrompt(savedData); }
    }
  }, []);

  // Auto Save
  useEffect(() => {
      localStorage.setItem('sbl_autosave_video_maker', JSON.stringify({ prompt, aspectRatio, resolution }));
  }, [prompt, aspectRatio, resolution]);

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
      
      // TRACK EVENT
      trackEvent('video_generated');

      clearInterval(statusInterval);
      setGeneratedVideo(videoUrl);
      setStatusMessage('');
    } catch (error) {
        console.error("Video generation failed", error);
        setStatusMessage('Generation failed. Please try again.');
        setLoading(false);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedVideo) return;
    
    let content = generatedVideo;
    try {
        const base64 = await blobUrlToBase64(generatedVideo);
        if (base64.length < 4500000) content = base64;
    } catch (e) {
        console.warn("Could not convert video to base64 for storage", e);
    }

    const success = saveItem({
        type: 'Video',
        content: content,
        title: `Video: ${prompt.substring(0, 30)}...`
    });
    
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  // --- History Management ---
  const updateClipsWithHistory = (newClips: TimelineClip[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newClips);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setClips(newClips);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setClips(history[newIndex]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setClips(history[newIndex]);
      }
  };

  const handleRegenerateTimeline = () => {
      if (!editorVideo) return;
      
      // Simulate AI Scene Detection / Auto-Split
      // In a real app, this would analyze keyframes
      const clipCount = 4;
      const newClips: TimelineClip[] = [];
      const durationPerClip = 3; // 3 seconds each
      
      for (let i = 0; i < clipCount; i++) {
          newClips.push({
              id: Date.now() + i,
              name: `Auto Scene ${i + 1}`,
              start: i * durationPerClip,
              end: (i * durationPerClip) + durationPerClip,
              url: editorVideo
          });
      }
      
      updateClipsWithHistory(newClips);
  };

  const handleResetTimeline = () => {
      if (!editorVideo) return;
      const newClips = [{ id: Date.now(), name: editorVideoName, start: 0, end: 10, url: editorVideo }];
      updateClipsWithHistory(newClips);
  };

  const sendToEditor = async () => {
      if (generatedVideo) {
          setEditorVideo(generatedVideo);
          setEditorVideoName(`Generated: ${prompt.substring(0, 15)}...`);
          
          const newClips = [{ id: Date.now(), name: 'Generated Clip', start: 0, end: 5, url: generatedVideo }];
          setClips(newClips);
          
          // Reset History
          setHistory([newClips]);
          setHistoryIndex(0);
          
          // Try to convert the blob URL to a File object for AI analysis
          try {
            const response = await fetch(generatedVideo);
            const blob = await response.blob();
            const file = new File([blob], "generated_video.mp4", { type: blob.type });
            setEditorFile(file);
          } catch (e) {
            console.warn("Could not retrieve blob for analysis", e);
            setEditorFile(null);
          }

          setActiveTab('editor');
      }
  };

  // Editor Functions
  const handleEditorFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setEditorVideo(url);
    setEditorVideoName(file.name);
    setEditorFile(file);
    
    const newClips = [{ id: Date.now(), name: file.name, start: 0, end: 10, url }];
    setClips(newClips);
    
    // Reset History
    setHistory([newClips]);
    setHistoryIndex(0);
  };

  const updateClipTimes = (id: number, start: number, end: number) => {
    const newClips = clips.map(c => (c.id === id ? { ...c, start, end } : c));
    updateClipsWithHistory(newClips);
  };

  const handleClipDragStart = (e: React.DragEvent, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set a drag image if needed, default is usually fine
  };

  const handleClipDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleClipDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedClipIndex === null || draggedClipIndex === targetIndex) return;

    const updatedClips = [...clips];
    const [movedClip] = updatedClips.splice(draggedClipIndex, 1);
    updatedClips.splice(targetIndex, 0, movedClip);

    updateClipsWithHistory(updatedClips);
    setDraggedClipIndex(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const runAITool = async (task: 'hooks' | 'captions' | 'script') => {
      setAiToolLoading(true);
      setAiToolOutput('');
      try {
          const context = editorVideoName + (prompt ? ` - ${prompt}` : '');
          let videoData = undefined;

          // If we have a file, send it for analysis
          if (editorFile) {
              const base64 = await fileToBase64(editorFile);
              videoData = {
                  data: base64,
                  mimeType: editorFile.type
              };
          }

          const result = await generateVideoMeta(task, context, videoData);
          setAiToolOutput(result);
      } catch (e) {
          console.error(e);
          setAiToolOutput('Failed to generate. Please try again.');
      } finally {
          setAiToolLoading(false);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="mb-6">
         <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
            <Film className="w-8 h-8 mr-3 text-brand-500" />
            Viral Video Studio
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-1">Create, edit, and optimize videos for maximum viral reach.</p>
      </div>

      <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-fit mb-6">
          <button
              onClick={() => setActiveTab('generator')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'generator' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
              <Zap className="w-4 h-4 mr-2" /> Veo Generator
          </button>
          <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'editor' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
              <Layers className="w-4 h-4 mr-2" /> Studio Editor
          </button>
      </div>

      {activeTab === 'generator' ? (
        <>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="space-y-6">
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Prompt</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the video you want to create (e.g. A cyberpunk city at night with neon rain)..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white h-32 resize-none"
                    />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aspect Ratio</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setAspectRatio('16:9')}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-bold ${aspectRatio === '16:9' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    16:9 (Landscape)
                                </button>
                                <button 
                                    onClick={() => setAspectRatio('9:16')}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-bold ${aspectRatio === '9:16' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    9:16 (Shorts)
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Starting Image (Optional)</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-[42px] flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                {selectedImage ? (
                                    <span className="text-xs text-green-500 font-bold flex items-center"><Check className="w-3 h-3 mr-1" /> Image Loaded</span>
                                ) : (
                                    <span className="text-xs text-gray-400 flex items-center"><Upload className="w-3 h-3 mr-1" /> Upload</span>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center border-2 border-transparent
                            ${loading || !prompt ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-900 hover:bg-brand-800 border-brand-700 shadow-brand-900/20'}`}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Video className="w-5 h-5 mr-2" />}
                        {loading ? 'Generating Video (This takes a moment)...' : (hasApiKey ? 'Generate Video' : 'Select Key & Generate')}
                    </button>
                    
                    {!hasApiKey && <p className="text-xs text-center text-red-400">Paid API Key required for Veo.</p>}
                </div>
            </div>

            {/* Output Section */}
            {(loading || generatedVideo) && (
                <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl text-center">
                    {loading ? (
                        <div className="py-12">
                            <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">Creating Your Video</h3>
                            <p className="text-gray-400 animate-pulse">{statusMessage}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-500 mr-2" /> Video Ready!
                            </h3>
                            <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                                <video 
                                    src={generatedVideo!} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center"
                                >
                                    {saved ? <Check className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                                    {saved ? 'Saved' : 'Save to Library'}
                                </button>
                                <button 
                                    onClick={sendToEditor}
                                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors flex items-center shadow-lg"
                                >
                                    <PenTool className="w-4 h-4 mr-2" /> Open in Editor
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
            {/* Editor Main */}
            <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-4 flex flex-col">
                <div className="flex-1 bg-black/50 rounded-xl relative flex items-center justify-center overflow-hidden mb-4">
                    {editorVideo ? (
                        <div className="relative h-full w-full flex items-center justify-center">
                             {/* Platform Overlay Simulation */}
                             {previewPlatform !== 'youtube' && (
                                 <div className="absolute inset-0 pointer-events-none z-10 opacity-60">
                                     <div className="absolute bottom-8 right-4 flex flex-col gap-4">
                                         <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                         <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                         <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                     </div>
                                     <div className="absolute bottom-8 left-4 w-1/2">
                                         <div className="h-3 w-20 bg-white/20 rounded mb-2"></div>
                                         <div className="h-3 w-40 bg-white/20 rounded"></div>
                                     </div>
                                 </div>
                             )}
                             
                             <video 
                                ref={videoRef}
                                src={editorVideo} 
                                controls 
                                className={`max-h-full shadow-2xl ${previewPlatform !== 'youtube' ? 'aspect-[9/16]' : 'aspect-video'}`}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                             <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                             <p>No video loaded</p>
                             <button onClick={() => editorInputRef.current?.click()} className="mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm">Upload Video</button>
                        </div>
                    )}
                    <input type="file" ref={editorInputRef} onChange={handleEditorFileUpload} className="hidden" accept="video/*" />
                </div>

                {/* Timeline */}
                <div className="h-32 bg-gray-800 rounded-xl p-3 border border-gray-700 overflow-x-auto">
                     <div className="flex justify-between items-center mb-2">
                         <div className="flex items-center gap-3">
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline</span>
                             <div className="flex gap-1 bg-gray-900 rounded-lg p-0.5 border border-gray-700">
                                 <button 
                                    onClick={undo} 
                                    disabled={historyIndex <= 0} 
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    title="Undo"
                                 >
                                     <Undo className="w-3 h-3" />
                                 </button>
                                 <button 
                                    onClick={redo} 
                                    disabled={historyIndex >= history.length - 1} 
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    title="Redo"
                                 >
                                     <Redo className="w-3 h-3" />
                                 </button>
                                 <div className="w-px bg-gray-700 mx-0.5"></div>
                                 <button 
                                    onClick={handleRegenerateTimeline}
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-brand-400 disabled:opacity-30 transition-colors"
                                    title="Auto-Split Scenes (Regenerate)"
                                 >
                                     <RefreshCw className="w-3 h-3" />
                                 </button>
                                 <button 
                                    onClick={handleResetTimeline}
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400 disabled:opacity-30 transition-colors"
                                    title="Reset Timeline"
                                 >
                                     <RotateCcw className="w-3 h-3" />
                                 </button>
                             </div>
                         </div>
                         <span className="text-xs text-gray-500">{clips.length} Clips</span>
                     </div>
                     <div className="flex gap-2 min-w-full">
                         {clips.map((c, index) => (
                             <div 
                                key={c.id} 
                                draggable
                                onDragStart={(e) => handleClipDragStart(e, index)}
                                onDragOver={handleClipDragOver}
                                onDrop={(e) => handleClipDrop(e, index)}
                                className={`h-16 bg-brand-900/40 border border-brand-500/30 rounded-lg min-w-[120px] p-2 flex flex-col justify-between relative group hover:bg-brand-900/60 transition-colors cursor-move ${draggedClipIndex === index ? 'opacity-50' : ''}`}
                             >
                                 <div className="absolute top-1 right-1 cursor-move text-brand-400 opacity-50 hover:opacity-100 z-20">
                                     <GripVertical size={12} />
                                 </div>
                                 <span className="text-xs font-bold text-brand-200 truncate pr-4">{c.name}</span>
                                 <div className="flex justify-between text-[10px] text-brand-400">
                                     <span>{c.start}s</span>
                                     <span>{c.end}s</span>
                                 </div>
                                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 flex items-center justify-center gap-1 transition-opacity z-10">
                                     <button onClick={() => updateClipTimes(c.id, Math.max(0, c.start - 1), c.end)} className="p-1 bg-black/50 rounded hover:bg-brand-600 text-white text-[10px] pointer-events-auto">-1s</button>
                                     <button onClick={() => updateClipTimes(c.id, c.start, c.end + 1)} className="p-1 bg-black/50 rounded hover:bg-brand-600 text-white text-[10px] pointer-events-auto">+1s</button>
                                 </div>
                             </div>
                         ))}
                         {clips.length === 0 && (
                             <div className="flex-1 flex items-center justify-center text-gray-600 text-xs border-2 border-dashed border-gray-700 rounded-lg">
                                 Drag or upload clips here
                             </div>
                         )}
                     </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4">
                {/* Platform Preview Controls */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                     <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center text-sm">
                         <Smartphone className="w-4 h-4 mr-2" /> Platform Preview
                     </h3>
                     <div className="grid grid-cols-3 gap-2">
                         <button 
                            onClick={() => setPreviewPlatform('instagram')}
                            className={`p-2 text-xs font-bold rounded-lg border transition-all ${previewPlatform === 'instagram' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                         >
                             Reels
                         </button>
                         <button 
                            onClick={() => setPreviewPlatform('tiktok')}
                            className={`p-2 text-xs font-bold rounded-lg border transition-all ${previewPlatform === 'tiktok' ? 'bg-gray-900 dark:bg-black text-white border-black' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                         >
                             TikTok
                         </button>
                         <button 
                            onClick={() => setPreviewPlatform('youtube')}
                            className={`p-2 text-xs font-bold rounded-lg border transition-all ${previewPlatform === 'youtube' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                         >
                             Shorts
                         </button>
                     </div>
                </div>

                {/* AI Tools */}
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50 flex-1 flex flex-col">
                     <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center text-sm">
                         <Zap className="w-4 h-4 mr-2" /> AI Magic Tools
                     </h3>
                     
                     <div className="grid grid-cols-1 gap-2 mb-4">
                         <button onClick={() => runAITool('hooks')} disabled={aiToolLoading} className="px-3 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-left">
                             ✨ Generate Viral Hooks
                         </button>
                         <button onClick={() => runAITool('captions')} disabled={aiToolLoading} className="px-3 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-left">
                             📝 Generate Caption
                         </button>
                         <button onClick={() => runAITool('script')} disabled={aiToolLoading} className="px-3 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-left">
                             🎬 Generate Script
                         </button>
                     </div>

                     <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-xs overflow-y-auto font-mono text-gray-600 dark:text-gray-300">
                         {aiToolLoading ? (
                             <div className="flex items-center justify-center h-full text-purple-500">
                                 <Loader2 className="w-5 h-5 animate-spin" />
                             </div>
                         ) : aiToolOutput ? (
                             aiToolOutput
                         ) : (
                             <span className="text-gray-400 italic">Select an AI tool above to generate metadata for your video...</span>
                         )}
                     </div>
                </div>

                <div className="flex gap-2">
                     <button className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-sm shadow-md">Export Video</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoMaker;
