
import React, { useState, useEffect } from 'react';
import { Check, Star, Heart, Zap, Shield, TrendingUp, Github, Facebook, Mail, Apple } from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';
import { trackEvent } from '../services/analyticsService';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [email, setEmail] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

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
          completeLogin(email);
      }
  };

  const handleSocialLogin = (provider: string) => {
      setLoadingProvider(provider);
      // Simulate network delay
      setTimeout(() => {
          const mockEmail = `user@${provider.toLowerCase()}.com`;
          completeLogin(mockEmail);
      }, 1500);
  };

  const completeLogin = (userEmail: string) => {
      localStorage.setItem('sbl_user_email', userEmail);
      trackEvent('lead_captured');
      onEnterApp();
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
                    <div key={i} className="bg-dark-card p-6 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-lg hover:border-brand-500/30 transition-colors">
                        <f.icon className="w-8 h-8 text-brand-500 mb-4" />
                        <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-400">{f.desc}</p>
                    </div>
                ))}
            </div>

            <div className="max-w-md mx-auto bg-dark-card p-8 rounded-3xl shadow-premium border border-gray-800">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Get Started for Free</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleSocialLogin('Google')}
                            className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            {loadingProvider === 'Google' ? (
                                <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            Google
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('Apple')}
                            className="flex items-center justify-center gap-2 bg-black text-white font-bold py-2.5 px-4 rounded-xl hover:bg-gray-900 transition-colors border border-gray-800"
                        >
                            {loadingProvider === 'Apple' ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.93-.85 1.6.18 2.82.93 3.52 2.37-3.21 1.76-2.5 6.44.65 7.9-.53 1.35-1.29 2.76-2.19 3.73-.55.61-1.12.98-1.74 1.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                </svg>
                            )}
                            Apple
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('GitHub')}
                            className="flex items-center justify-center gap-2 bg-[#24292e] text-white font-bold py-2.5 px-4 rounded-xl hover:bg-[#2f363d] transition-colors border border-gray-700"
                        >
                            {loadingProvider === 'GitHub' ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <Github className="w-5 h-5" />
                            )}
                            GitHub
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('Facebook')}
                            className="flex items-center justify-center gap-2 bg-[#1877F2] text-white font-bold py-2.5 px-4 rounded-xl hover:bg-[#166fe5] transition-colors border border-[#1877F2]"
                        >
                            {loadingProvider === 'Facebook' ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <Facebook className="w-5 h-5 fill-current" />
                            )}
                            Facebook
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase">Or continue with email</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
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
                            className="w-full bg-brand-900 hover:bg-brand-800 border-2 border-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-900/50 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Continue with Email
                        </button>
                    </form>
                </div>
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
