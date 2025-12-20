
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, Instagram, Sparkles, Zap, Smartphone, DollarSign, Target } from 'lucide-react';

interface Slide {
  headline: string;
  body: string;
}

interface InstagramCarouselTemplateProps {
  slides: Slide[];
}

const InstagramCarouselTemplate: React.FC<InstagramCarouselTemplateProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = slides.map((s, i) => `Slide ${i + 1}:\nHeadline: ${s.headline}\nBody: ${s.body}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const getIcon = (index: number) => {
    switch (index) {
        case 0: return <Sparkles className="w-12 h-12 text-brand-500" />;
        case 2: return <Zap className="w-12 h-12 text-brand-500" />;
        case 3: return <Smartphone className="w-12 h-12 text-brand-500" />;
        case 4: return <DollarSign className="w-12 h-12 text-brand-500" />;
        case 6: return <Target className="w-12 h-12 text-brand-500" />;
        default: return <Sparkles className="w-12 h-12 text-brand-500 opacity-20" />;
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-full flex justify-between items-center mb-2 px-4">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Instagram size={18} className="text-pink-500" /> Insta Benefit Carousel
            </h3>
            <button 
                onClick={handleCopy}
                className="p-2.5 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors border border-gray-700 flex items-center gap-2 text-xs font-bold"
            >
                {copied ? <Check size={14} className="text-brand-500" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy All Slides'}
            </button>
        </div>

        {/* Carousel Visual */}
        <div className="relative w-full max-w-[450px] aspect-square bg-dark-bg border border-gray-800 rounded-3xl shadow-premium overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 to-blue-900/10 pointer-events-none"></div>
            
            {/* Slide Content */}
            <div className="absolute inset-0 p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-brand-500/10 p-4 rounded-3xl mb-4">
                    {getIcon(currentIndex)}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                    {slides[currentIndex]?.headline}
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed font-medium">
                    {slides[currentIndex]?.body}
                </p>
            </div>

            {/* Navigation */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={24} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === i ? 'bg-brand-500 w-4' : 'bg-gray-700'}`}></div>
                ))}
            </div>

            {/* Slide Index */}
            <div className="absolute top-8 right-8 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
                {currentIndex + 1} / {slides.length}
            </div>
        </div>

        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center max-w-sm">
            Optimized for high engagement. Swipe to preview your automated business benefits.
        </p>
    </div>
  );
};

export default InstagramCarouselTemplate;
