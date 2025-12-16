
import React, { useState, useEffect } from 'react';
import { Check, Star, Heart, Zap, Shield, TrendingUp } from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';
import { trackEvent } from '../services/analyticsService';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [email, setEmail] = useState('');

  // Check for remembered email on mount
  useEffect(() => {
      const storedEmail = localStorage.getItem('sbl_user_email');
      if (storedEmail) {
          setEmail(storedEmail);
      }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
      e.preventDefault();
      if (email.trim()) {
          // Save email to remember login
          localStorage.setItem('sbl_user_email', email);
          trackEvent('lead_captured');
          onEnterApp();
      }
  };

  const features = [
      { icon: Zap, title: "Instant Viral Content", desc: "Generate proven viral hooks and scripts in seconds." },
      { icon: Shield, title: "Authority Building", desc: "Create high-status visuals that build instant trust." },
      { icon: TrendingUp, title: "Trend Hunter", desc: "Find what is working now and replicate it." }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.1),_rgba(0,0,0,0))]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div className="max-w-4xl w-full relative z-10 text-center space-y-12">
            
            <div className="flex justify-center mb-6">
                <GreenNovaLogo className="w-24 h-24 text-brand-500 animate-pulse" />
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-purple-600">
                    AI-Powered Sustainable Business Launch System
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    The all-in-one AI operating system for sustainable content creators.
                    <br/>Stop grinding. Start scaling.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {features.map((f, i) => (
                    <div key={i} className="bg-dark-card p-6 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-lg">
                        <f.icon className="w-8 h-8 text-brand-500 mb-4" />
                        <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-400">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div className="max-w-md mx-auto bg-dark-card p-8 rounded-3xl shadow-premium border border-gray-800">
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-dark-input border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder-gray-600"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-brand-900 hover:bg-brand-800 border-2 border-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-900/50 transition-all transform hover:scale-[1.02]"
                    >
                        Enter LaunchPad
                    </button>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        By entering, you agree to our Terms of Service.
                    </p>
                </form>
            </div>
            
            <div className="flex justify-center gap-8 text-gray-500 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-green-500" /> No Credit Card</span>
                <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-green-500" /> Free Trial</span>
                <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-green-500" /> Instant Access</span>
            </div>
        </div>
    </div>
  );
};

export default LandingPage;
