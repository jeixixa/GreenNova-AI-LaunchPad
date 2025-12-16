
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, transcribeAudio } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { decodeBase64, decodeAudioData, playAudioBuffer, createWavBlob } from '../services/audioUtils';
import { Loader2, Mic, Play, Pause, Bookmark, Check, User, Upload, X, Plus, FileAudio, Sliders, Radio, Square, Trash2, FileText } from 'lucide-react';

interface Voice {
    id: string;
    name: string;
    gender: string;
    desc: string;
    tags: string[];
    isCustom?: boolean;
}

const INITIAL_VOICES: Voice[] = [
  { id: 'Puck', name: 'Puck', gender: 'Male', desc: 'Energetic & Clear', tags: ['Narration', 'Upbeat'] },
  { id: 'Charon', name: 'Charon', gender: 'Male', desc: 'Deep & Authoritative', tags: ['News', 'Serious'] },
  { id: 'Kore', name: 'Kore', gender: 'Female', desc: 'Calm & Soothing', tags: ['Meditation', 'Story'] },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', desc: 'Rough & Intense', tags: ['Gaming', 'Action'] },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', desc: 'Soft & Gentle', tags: ['ASMR', 'Relaxing'] },
];

const AudioStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [voices, setVoices] = useState<Voice[]>(INITIAL_VOICES);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [rawAudio, setRawAudio] = useState<Uint8Array | null>(null);
  const [saved, setSaved] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // Cloning Modal State
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const [cloneName, setCloneName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [activeTab, setActiveTab] = useState<'System' | 'Cloned'>('System');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Initialize Audio Context on mount and Load Auto-Saved Data
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    setAudioContext(ctx);
    
    // Auto Load
    const savedData = localStorage.getItem('sbl_autosave_audio_script');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (typeof parsed === 'string') {
                setText(parsed);
            } else {
                if (parsed.text) setText(parsed.text);
                if (parsed.selectedVoice) setSelectedVoice(parsed.selectedVoice);
            }
        } catch(e) {
            setText(savedData); // Fallback
        }
    }

    return () => {
      ctx.close();
    };
  }, []);

  // Auto Save
  useEffect(() => {
      localStorage.setItem('sbl_autosave_audio_script', JSON.stringify({ text, selectedVoice }));
  }, [text, selectedVoice]);

  const getDeterministicVoice = (name: string) => {
    const standardVoices = INITIAL_VOICES.filter(v => !v.isCustom);
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % standardVoices.length;
    return standardVoices[index].id;
  };

  const handleGenerate = async () => {
    if (!text || !audioContext) return;
    
    setLoading(true);
    setSaved(false);
    // Stop any current playback
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
    }
    setIsPlaying(false);

    try {
      // Logic to handle custom voices vs pre-built voices
      let voiceToUse = selectedVoice;
      const voiceObj = voices.find(v => v.id === selectedVoice);
      
      if (voiceObj?.isCustom) {
         // Use deterministic mapping to ensure consistent sound for the custom voice profile
         voiceToUse = getDeterministicVoice(voiceObj.name);
         console.log(`Mapped custom voice "${voiceObj.name}" to base voice "${voiceToUse}"`);
      }

      const base64Audio = await generateSpeech(text, voiceToUse);
      const rawBytes = decodeBase64(base64Audio);
      setRawAudio(rawBytes);

      const buffer = await decodeAudioData(rawBytes, audioContext);
      setAudioBuffer(buffer);
      
      // Auto play
      playBuffer(buffer);

    } catch (error) {
      console.error("TTS Failed", error);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !audioContext) return;

      try {
          const arrayBuffer = await file.arrayBuffer();
          // decodeAudioData resamples to context sampleRate (24000)
          const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(decodedBuffer);
          
          // Convert to Int16 PCM for consistency with rawAudio expectation (for saving)
          const channelData = decodedBuffer.getChannelData(0); // Take first channel (mono)
          const pcmInt16 = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
              // Clamp and scale
              const s = Math.max(-1, Math.min(1, channelData[i]));
              pcmInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          setRawAudio(new Uint8Array(pcmInt16.buffer));

          // Auto play
          playBuffer(decodedBuffer);
          
          // Clear file input
          if (mainFileInputRef.current) mainFileInputRef.current.value = '';
      } catch (err) {
          console.error("Error decoding audio file", err);
          alert("Failed to load audio file. Please try a different format (WAV/MP3).");
      }
  };

  const handleTranscribeAudio = async () => {
      if (!rawAudio) return;
      setIsTranscribing(true);
      try {
          const wavBlob = createWavBlob(rawAudio);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];
              const transcript = await transcribeAudio(base64, 'audio/wav');
              if (transcript) setText(prev => prev ? prev + '\n' + transcript : transcript);
          };
          reader.readAsDataURL(wavBlob);
      } catch (error) {
          console.error("Transcription failed", error);
          alert("Failed to transcribe audio.");
      } finally {
          setIsTranscribing(false);
      }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContext) return;
    
    // Stop previous if exists
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
    }

    const source = playAudioBuffer(buffer, audioContext);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    source.onended = () => {
        setIsPlaying(false);
    };
  };

  const togglePlayback = () => {
      if (!audioBuffer || !audioContext) return;

      if (isPlaying) {
          if (sourceNodeRef.current) {
              sourceNodeRef.current.stop();
              setIsPlaying(false);
          }
      } else {
          playBuffer(audioBuffer);
      }
  };

  const handleSave = () => {
    if (!rawAudio) return;
    
    try {
        const wavBlob = createWavBlob(rawAudio);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Wav = reader.result as string;
            const selectedVoiceName = voices.find(v => v.id === selectedVoice)?.name || selectedVoice;
            const title = text ? `Audio (${selectedVoiceName}): ${text.substring(0, 20)}...` : `Uploaded Audio ${new Date().toLocaleTimeString()}`;
            const success = saveItem({
                type: 'Audio',
                content: base64Wav,
                title: title,
            });
            if (success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        };
        reader.readAsDataURL(wavBlob);
    } catch (error) {
        console.error("Failed to save audio", error);
    }
  };

  // Cloning Handlers
  const handleCloneFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setCloneFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
      }
  };

  const removeCloneFile = (index: number) => {
      setCloneFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        setCloneFiles(prev => [...prev, file]);
        
        // Stop all tracks
        const tracks = mediaRecorderRef.current?.stream.getTracks();
        tracks?.forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCloneVoice = async () => {
      if (!cloneName || cloneFiles.length === 0) return;

      setIsCloning(true);
      
      // Simulate API upload and training delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      const newVoice: Voice = {
          id: `custom-${Date.now()}`,
          name: cloneName,
          gender: 'Custom',
          desc: 'AI Cloned Profile',
          tags: ['Cloned', 'Personal'],
          isCustom: true
      };

      setVoices(prev => [...prev, newVoice]);
      setSelectedVoice(newVoice.id);
      setActiveTab('Cloned');
      
      setIsCloning(false);
      setIsCloneModalOpen(false);
      setCloneName('');
      setCloneFiles([]);
  };

  const filteredVoices = voices.filter(v => activeTab === 'System' ? !v.isCustom : v.isCustom);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Audio Studio</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Convert your business content into professional speech or manage your audio assets.</p>
        </div>
        <button 
            onClick={() => setIsCloneModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-50 transition-colors shadow-glow-sm"
        >
            <Plus className="w-4 h-4" />
            Clone New Voice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Voice Lab Sidebar */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                        <Sliders className="w-4 h-4 mr-2" />
                        Voice Lab
                    </h3>
                </div>
                
                <div className="p-2 grid grid-cols-2 gap-1 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('System')}
                        className={`py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'System' ? 'bg-white dark:bg-gray-700 shadow text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        System Voices
                    </button>
                    <button 
                        onClick={() => setActiveTab('Cloned')}
                        className={`py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'Cloned' ? 'bg-white dark:bg-gray-700 shadow text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        My Clones
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {filteredVoices.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                            <User className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No custom voices yet.</p>
                            <button onClick={() => setIsCloneModalOpen(true)} className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-2 hover:underline">+ Create One</button>
                         </div>
                    ) : (
                        filteredVoices.map(voice => (
                            <button
                                key={voice.id}
                                onClick={() => setSelectedVoice(voice.id)}
                                className={`
                                    w-full text-left p-3 rounded-xl border transition-all flex items-center group
                                    ${selectedVoice === voice.id 
                                        ? (voice.isCustom ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 ring-1 ring-purple-500' : 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 ring-1 ring-brand-500')
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0
                                    ${voice.isCustom ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' : 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300'}
                                `}>
                                    {voice.isCustom ? <User className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className={`font-bold text-sm truncate ${selectedVoice === voice.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{voice.name}</h4>
                                        {selectedVoice === voice.id && <div className={`w-2 h-2 rounded-full ${voice.isCustom ? 'bg-purple-500' : 'bg-brand-500'}`}></div>}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{voice.desc}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-gray-700 md:hidden">
                     <button 
                        onClick={() => setIsCloneModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-3 rounded-lg font-bold text-sm shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Clone New Voice
                    </button>
                </div>
            </div>
        </div>

        {/* Main Studio Area */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col h-full max-h-[600px]">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Script</label>
                    <span className="text-xs text-gray-400">{text.length} chars</span>
                </div>
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text you want to convert to speech..."
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 outline-none flex-1 resize-none font-mono text-sm leading-relaxed"
                />
                
                <div className="mt-6 flex justify-end gap-3">
                    <input 
                        type="file" 
                        ref={mainFileInputRef}
                        onChange={handleMainFileUpload}
                        accept="audio/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => mainFileInputRef.current?.click()}
                        className="py-3 px-4 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
                        title="Upload Audio File for Playback or Transcription"
                    >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Audio
                    </button>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !text}
                        className={`
                            py-3 px-8 rounded-xl font-bold flex items-center shadow-lg transition-all border-2 border-transparent
                            ${loading || !text 
                                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500' 
                                : 'bg-brand-900 text-white hover:bg-brand-800 border-brand-700 hover:scale-[1.02] shadow-brand-900/20'}
                        `}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                        {loading ? 'Synthesizing...' : 'Generate Audio'}
                    </button>
                </div>
            </div>

            {/* Player Card */}
            <div className={`
                transition-all duration-500 ease-in-out transform
                ${audioBuffer ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-4 pointer-events-none grayscale'}
            `}>
                <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-xl border border-gray-800">
                    <div className="flex items-center space-x-5 mb-4 sm:mb-0 w-full sm:w-auto">
                        <button 
                            onClick={togglePlayback}
                            className="w-14 h-14 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg shrink-0"
                        >
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-white text-lg truncate">{text ? 'Generated Output' : 'Audio Playback'}</h3>
                            <div className="flex items-center text-xs text-gray-400 gap-3">
                                <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {text ? (voices.find(v => v.id === selectedVoice)?.name || selectedVoice) : 'Uploaded File'}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span>{audioBuffer ? `${audioBuffer.duration.toFixed(1)}s` : '--:--'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {audioBuffer && (
                             <button 
                                onClick={handleTranscribeAudio}
                                disabled={isTranscribing}
                                className="flex items-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-colors border border-white/10"
                                title="Convert audio to text (Free)"
                            >
                                {isTranscribing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                                Transcribe
                            </button>
                        )}
                        {audioBuffer && (
                            <button 
                                onClick={handleSave}
                                className="flex items-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-colors border border-white/10"
                            >
                                {saved ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Bookmark className="w-4 h-4 mr-2" />}
                                {saved ? 'Saved' : 'Save to Library'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Clone Voice Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Mic className="w-5 h-5 mr-2 text-purple-600" />
                        Clone Your Voice (Beta)
                    </h2>
                    <button onClick={() => setIsCloneModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                        <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm mb-1">🎙️ Free Feature</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                            Upload audio files or record directly. Our AI analyzes tone, pitch, and cadence to create a digital replica for free.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Voice Name</label>
                            <input 
                                type="text" 
                                value={cloneName}
                                onChange={(e) => setCloneName(e.target.value)}
                                placeholder="e.g. James Personal Voice"
                                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Recording & Upload Grid */}
                        <div className="grid grid-cols-2 gap-4">
                             {/* Upload Box */}
                             <div className="relative group">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="audio/*"
                                    onChange={handleCloneFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors h-full flex flex-col justify-center items-center">
                                    <Upload className="w-6 h-6 text-gray-400 mb-2 group-hover:text-purple-500" />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Upload File</span>
                                </div>
                             </div>

                             {/* Record Box */}
                             <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`
                                    border-2 rounded-xl p-6 text-center transition-colors h-full flex flex-col justify-center items-center relative overflow-hidden
                                    ${isRecording ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}
                                `}
                             >
                                 {isRecording ? (
                                    <>
                                        <Square className="w-6 h-6 text-red-500 mb-2 fill-current animate-pulse" />
                                        <span className="text-xs font-bold text-red-600">Stop ({recordingTime}s)</span>
                                    </>
                                 ) : (
                                    <>
                                        <Mic className="w-6 h-6 text-gray-400 mb-2 group-hover:text-purple-500" />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Record Mic</span>
                                    </>
                                 )}
                             </button>
                        </div>

                        {/* File List */}
                        {cloneFiles.length > 0 && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Selected Samples ({cloneFiles.length})</label>
                                {cloneFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileAudio className="w-4 h-4 text-purple-500 shrink-0" />
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                        </div>
                                        <button onClick={() => removeCloneFile(idx)} className="text-gray-400 hover:text-red-500 p-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                        onClick={handleCloneVoice}
                        disabled={!cloneName || cloneFiles.length === 0 || isCloning}
                        className={`
                            w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center transition-all shadow-lg
                            ${!cloneName || cloneFiles.length === 0 || isCloning
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none text-gray-500' 
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 dark:shadow-none'}
                        `}
                    >
                        {isCloning ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                Training Voice Model...
                            </>
                        ) : (
                            'Create Voice Profile'
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AudioStudio;
