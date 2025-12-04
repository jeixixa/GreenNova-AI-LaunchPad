import React, { useState } from 'react';
import { 
  Check, 
  Star, 
  PlayCircle, 
  ArrowRight, 
  TrendingUp, 
  Image as ImageIcon, 
  Menu, 
  X,
  ChevronDown,
  ChevronUp,
  Mic,
  MessageCircle,
  Mail,
  CreditCard,
  Link as LinkIcon,
  Search,
  Youtube
} from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const features = [
    { icon: LinkIcon, title: "Viral Content Reader", desc: "Paste any YouTube or Facebook URL. We extract the 'viral gold' and bridge it to your offer instantly." },
    { icon: ImageIcon, title: "Viral Image Generator", desc: "Create bold, high-contrast viral images with text overlays that stop the scroll." },
    { icon: MessageCircle, title: "9-Comment Generator", desc: "Produces exactly 9 numbered, engagement-boosting comments with CTAs." },
    { icon: Search, title: "Viral Content Search", desc: "Find trending topics in your niche automatically to never run out of ideas." },
    { icon: Mic, title: "AI Audio Studio", desc: "Clone your voice and generate speech for your video content with emotional depth." },
    { icon: TrendingUp, title: "Viral Blog Writer", desc: "One-click generation of high-impact mini-blogs that drive traffic to your offer." },
  ];

  const faqs = [
    { q: "Do I need a credit card for the 15-day trial?", a: "Yes — but you can cancel anytime before billing." },
    { q: "Can I cancel anytime?", a: "Yes, one-click cancellation inside your account." },
    { q: "Will this work for my niche?", a: "Absolutely — GreenNova AI LaunchPad works for ANY niche." },
    { q: "How is this different from ChatGPT?", a: "GreenNova is specifically trained on viral frameworks and includes direct bridging to your offers." },
    { q: "Do I get updates?", a: "Yes — all updates are included." },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
               <div className="flex items-center justify-center text-brand-500">
                 <GreenNovaLogo className="w-10 h-10" />
               </div>
               <div className="flex flex-col justify-center">
                 <span className="text-xl font-bold text-transparent bg-clip-text bg-brand-gradient leading-none tracking-tight">GREENNOVA AI</span>
                 <span className="text-sm font-medium text-brand-500 leading-none mt-1">LaunchPad</span>
               </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => setIsLoginModalOpen(true)} className="font-semibold text-gray-300 hover:text-brand-500 transition-colors">Login</button>
              
              <a 
                href="https://youtube.com/channel/UCN5cxymUeykhheJHWFiuSeg?sub_confirmation=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-red-500/20"
              >
                <Youtube className="w-4 h-4 mr-2 fill-current" />
                Subscribe on YouTube
              </a>

              <button onClick={onEnterApp} className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 py-2.5 rounded-full font-bold hover:from-brand-500 hover:to-brand-400 transition-all shadow-lg shadow-brand-500/20 flex items-center border border-brand-500/20">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400 hover:text-white">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-dark-card border-b border-gray-800 p-4 space-y-4">
             <button onClick={() => setIsLoginModalOpen(true)} className="block w-full text-left font-semibold text-gray-300 py-2">Login</button>
             <a 
                href="https://youtube.com/channel/UCN5cxymUeykhheJHWFiuSeg?sub_confirmation=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center w-full text-left font-bold text-red-500 py-2"
              >
                <Youtube className="w-4 h-4 mr-2" />
                Subscribe on YouTube
              </a>
             <button onClick={onEnterApp} className="block w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 py-3 rounded-xl font-bold text-center border border-brand-500/30">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-900/20 via-dark-bg to-dark-bg -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
             <Star className="w-4 h-4 text-brand-500 mr-2 fill-current" />
             <span className="text-sm font-bold text-brand-400 tracking-wide uppercase">GreenNova AI LaunchPad</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight tracking-tight max-w-6xl mx-auto">
            <span className="text-transparent bg-clip-text bg-brand-gradient">GreenNova AI LaunchPad</span>
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-brand-gradient">That Drive Viral Traffic & Sales In Less Time.</span>
          </h1>
          
          <h2 className="text-xl text-gray-400 font-medium mb-10 max-w-3xl mx-auto leading-relaxed">
            Create viral blogs, articles, images, and repurpose content. <br className="hidden md:block" /> Search viral content fast and easy.
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button onClick={onEnterApp} className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-brand-500 text-white text-lg px-8 py-4 rounded-xl font-bold hover:from-brand-500 hover:to-brand-400 transition-all shadow-xl shadow-brand-500/30 hover:scale-105 border-t border-brand-400/20">
              Start Your 15-Day Free Trial
            </button>
            <button className="w-full sm:w-auto bg-dark-card text-gray-300 border border-gray-700 text-lg px-8 py-4 rounded-xl font-bold hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center shadow-sm">
              <PlayCircle className="w-5 h-5 mr-2" /> Watch Demo
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
            <span className="flex items-center"><Check className="w-4 h-4 text-brand-500 mr-2" /> 15-Day Free Trial</span>
            <span className="flex items-center"><Check className="w-4 h-4 text-brand-500 mr-2" /> Cancel Anytime</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-dark-card border-y border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-serif font-bold text-white">Everything You Need To Go Viral</h2>
                <p className="text-gray-400 mt-4">The complete system for creating engaging content that converts.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <div key={idx} className="bg-dark-bg p-8 rounded-2xl shadow-sm border border-gray-800 hover:border-brand-500/50 hover:shadow-glow-sm transition-all group">
                            <div className="bg-brand-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-colors">
                                <Icon className="w-7 h-7 text-brand-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    );
                })}
            </div>
         </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
                 <h2 className="text-4xl font-serif font-bold text-white">Simple, Transparent Pricing</h2>
                 <p className="text-gray-400 mt-4">Secured Payment Gateway via PayPal. Start free for 15 days.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                 {/* Monthly */}
                 <div className="bg-dark-card p-8 rounded-3xl border border-gray-800 shadow-sm hover:border-brand-500/30 transition-all">
                     <div className="mb-4">
                         <span className="text-lg font-bold text-gray-400">Monthly</span>
                     </div>
                     <div className="flex items-baseline mb-6">
                         <span className="text-5xl font-black text-white">$29</span>
                         <span className="text-gray-500 ml-2">/ month</span>
                     </div>
                     <p className="text-gray-500 text-sm mb-8">After 15-day free trial.</p>
                     
                     <button onClick={onEnterApp} className="w-full py-4 rounded-xl font-bold text-brand-500 bg-brand-900/20 hover:bg-brand-900/40 transition-colors mb-8 border border-brand-900/50">
                         Start 15-Day Free Trial
                     </button>

                     <ul className="space-y-4 text-sm text-gray-400">
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-500 mr-3" /> Viral Content Reader</li>
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-500 mr-3" /> Image Post Generator</li>
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-500 mr-3" /> Comment Automation</li>
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-500 mr-3" /> Cancel anytime</li>
                     </ul>
                 </div>

                 {/* Annual */}
                 <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl border border-brand-500/50 shadow-xl relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
                     <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                         BEST VALUE
                     </div>
                     <div className="mb-4">
                         <span className="text-lg font-bold text-gray-400">Annual</span>
                     </div>
                     <div className="flex items-baseline mb-6">
                         <span className="text-5xl font-black text-white">$99</span>
                         <span className="text-gray-400 ml-2">/ year</span>
                     </div>
                     <p className="text-brand-400 text-sm mb-8 font-bold">Save big with annual billing</p>
                     
                     <button onClick={onEnterApp} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 transition-colors mb-8 shadow-lg shadow-brand-900/50 border border-brand-500/30">
                         Get Started Now
                     </button>

                     <ul className="space-y-4 text-sm text-gray-300">
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-400 mr-3" /> Everything in Monthly</li>
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-400 mr-3" /> Unlimited Generation</li>
                         <li className="flex items-center"><Check className="w-4 h-4 text-brand-400 mr-3" /> Priority support</li>
                     </ul>
                 </div>
             </div>
             
             <div className="mt-8 flex justify-center gap-4 opacity-50">
                  <CreditCard className="w-8 h-8 text-gray-500" />
                  <div className="w-12 h-8 bg-gray-800 rounded text-xs flex items-center justify-center font-bold text-gray-500">VISA</div>
                  <div className="w-12 h-8 bg-gray-800 rounded text-xs flex items-center justify-center font-bold text-gray-500">AMEX</div>
             </div>
          </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-dark-card border-y border-gray-800">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-dark-bg rounded-xl border border-gray-800 overflow-hidden">
                        <button 
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-200 hover:bg-gray-800 transition-colors"
                        >
                            {faq.q}
                            {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>
                        {openFaqIndex === idx && (
                            <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-gray-800">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* YouTube Subscribe Card */}
      <section className="py-12 bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 flex justify-center">
             <div className="bg-gradient-to-br from-gray-900 to-black text-white p-5 rounded-2xl shadow-2xl border border-gray-800 flex flex-col sm:flex-row items-center gap-5 max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
                 <div className="absolute -right-6 -top-6 opacity-20 rotate-12 group-hover:opacity-30 transition-opacity pointer-events-none">
                    <Youtube className="w-32 h-32 text-red-600" />
                 </div>
                 
                 <div className="text-4xl shrink-0">🎥</div>
                 
                 <div className="text-center sm:text-left relative z-10">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">8 Figure Business Advice</p>
                     <p className="font-bold text-sm text-white leading-tight mb-3">Want FREE Advice & Courses From an 8 Figure Business Owner?</p>
                     <a
                        href="https://youtube.com/channel/UCN5cxymUeykhheJHWFiuSeg?sub_confirmation=1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-red-900/40"
                     >
                        <Youtube className="w-4 h-4 mr-2 fill-current" />
                        Subscribe on YouTube
                     </a>
                 </div>
             </div>
          </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-gray-900 text-white text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-900/40 to-dark-bg -z-10"></div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready To Go Viral?</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Join thousands of creators using GreenNova AI LaunchPad to grow their audience today.</p>
          <button onClick={onEnterApp} className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-10 py-5 rounded-xl font-black text-lg hover:from-brand-500 hover:to-brand-400 transition-all shadow-2xl hover:scale-105 border border-brand-500/20">
              Start Your 15-Day Free Trial
          </button>
          <p className="text-gray-500 text-sm mt-6 font-medium">No credit card required · Cancel anytime · 30-day guarantee</p>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-12 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                  <span className="font-bold text-white text-lg">GreenNova AI LaunchPad</span>
                  <p className="text-xs mt-1">AI-powered viral content generation.</p>
              </div>
              <div className="flex space-x-6 text-sm">
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="mailto:support@greennovasystems.com" className="hover:text-white transition-colors">Support</a>
              </div>
              <div className="mt-4 md:mt-0 text-xs">
                  © 2025 GreenNova Systems. All rights reserved.
              </div>
          </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-800">
                <button 
                    onClick={() => setIsLoginModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className="p-8 text-center">
                    <div className="flex items-center justify-center mx-auto mb-6">
                         <div className="text-brand-500">
                             <GreenNovaLogo className="w-16 h-16" />
                         </div>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400 mb-8">Login to GreenNova AI LaunchPad</p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={onEnterApp}
                            className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                        >
                            <Mail className="w-5 h-5 mr-3" />
                            Login with Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;