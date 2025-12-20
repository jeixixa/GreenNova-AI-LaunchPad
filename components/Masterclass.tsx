
import React from 'react';
/* Fixed: Added missing Search and RefreshCw icons to the lucide-react import list */
import { BookOpen, Zap, Target, TrendingUp, ArrowRight, CheckCircle2, Copy, Sparkles, MessageSquare, ShieldCheck, Search, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MASTERCLASS_CONTENT = `
# Stop Being a Content Slave: The AI Pivot to $10k/Month

**Most creators are playing a losing game.**

They wake up, look at a blank screen, and try to "manifest" virality. They spend 10 hours a day editing, writing, and overthinking, only to get 200 views and zero sales. This isn't a business; it's a high-stress hobby.

In the **AI-Powered Sustainable Business Launch System (SBL)**, we don't manifest. We architect.

## The Problem: The "Operator" Trap
International creators are falling into the same cycle:
1. **The Volume Delusion**: Thinking more posts = more money.
2. **The Manual Grind**: Doing tasks that an AI can do in 3 seconds.
3. **The Engagement Void**: Getting likes, but no leads.

## The Solution: The SBL 4-Phase Protocol
To scale past the "Operator" phase and become the "Architect" of your business, you must implement these four AI-driven shifts:

### Phase 1: Viral Discovery (Reverse-Engineering Success)
Stop guessing what people want. Use the **Viral Search Engine** to scan your niche.
- **Action**: Identify the top 5 performing posts in your niche from the last 30 days.
- **AI Guidance**: Extract the "DNA" of their virality—the specific hook structure and psychological triggers.

### Phase 2: Intelligent Repurposing
One asset should equal 100 results. If you have a YouTube video, it's not a video; it's a content goldmine.
- **Action**: Use the **Video Repurposer** to slice high-retention moments.
- **AI Guidance**: Transform a 10-minute long-form video into 5 high-impact Reels, a 10-tweet thread, and a LinkedIn authority post.

### Phase 3: Authority Anchoring
Trust is the currency of the digital age. You can't just be "loud"; you must be "the expert."
- **Action**: Use the **Authority Studio** to create high-status visual assets.
- **AI Guidance**: Generate minimalist quote cards and technical insight slides that command premium attention.

### Phase 4: The Comment Ladder (Conversion)
Engagement is useless without a path to profit. 
- **Action**: Deploy the **SBL Comment Ladder**.
- **AI Guidance**: Use the AI to generate a sequence of comments that educate, provide proof, and bridge to your offer using your specific CTA keyword.

## Your 7-Day Action Plan
1. **Day 1**: Define your Primary Offer in the **Account Tab**.
2. **Day 2**: Find 3 viral patterns using **Viral Search**.
3. **Day 3**: Repurpose a successful video into a **Viral LaunchPad** suite.
4. **Day 4**: Design your visual empire in **Image Studio**.
5. **Day 5**: Schedule the entire week in the **Scheduler**.
6. **Day 6-7**: Engage with the AI-generated **Comment Ladder**.

**The future belongs to the system-builders. Are you ready to launch?**
`;

const Masterclass: React.FC = () => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(MASTERCLASS_CONTENT);
    alert("Strategy copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      {/* Header Hero */}
      <div className="relative rounded-[3rem] overflow-hidden mb-12 bg-[#0A192F] border border-gray-800 shadow-premium p-12 text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gradient"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-400 rounded-full text-xs font-black uppercase tracking-widest border border-brand-500/20">
            <Sparkles size={14} /> Masterclass Session
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight max-w-3xl mx-auto">
            The Strategic Blueprint for <span className="text-transparent bg-clip-text bg-brand-gradient">Sustainable Scaling</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            How to transform from a burnt-out content creator into a high-leverage business architect using the SBL System.
          </p>
          <div className="flex justify-center gap-4 pt-4">
             <button onClick={copyToClipboard} className="bg-brand-900 hover:bg-brand-800 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 border-2 border-brand-700 shadow-glow">
                <Copy size={18} /> Copy Strategy
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Article */}
        <div className="lg:col-span-8 bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-200 dark:border-gray-800 p-10 md:p-16 shadow-premium">
           <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-brand-400 prose-strong:text-white prose-p:text-gray-500 dark:prose-p:text-gray-300 leading-relaxed">
             <ReactMarkdown>{MASTERCLASS_CONTENT}</ReactMarkdown>
           </article>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
            {/* Quick Tools Widget */}
            <div className="bg-gradient-to-br from-[#0B1425] to-[#020C1B] p-8 rounded-[2rem] border border-brand-500/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <Target className="text-brand-500" /> Tool Integration
                </h3>
                <div className="space-y-4">
                    {[
                        /* Fixed: Icons now correctly reference imported lucide-react components */
                        { title: 'Viral Search', desc: 'Find patterns', icon: Search },
                        { title: 'Video Repurposer', desc: 'Slice content', icon: RefreshCw },
                        { title: 'Authority Studio', desc: 'Build trust', icon: ShieldCheck },
                        { title: 'Comment Ladder', desc: 'Convert leads', icon: MessageSquare },
                    ].map((tool, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all group cursor-pointer">
                            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500 group-hover:scale-110 transition-transform">
                                <tool.icon size={20} />
                            </div>
                            <div>
                                <p className="text-white text-sm font-bold">{tool.title}</p>
                                <p className="text-gray-500 text-xs">{tool.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Checklist Widget */}
            <div className="bg-dark-card border border-gray-800 p-8 rounded-[2rem]">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" /> Core Principles
                </h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                        <span>Systems outperform effort 100% of the time.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                        <span>Authority is designed, not granted.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                        <span>Every comment is a potential customer journey.</span>
                    </li>
                </ul>
            </div>

            {/* CTA Widget */}
            <div className="bg-brand-900/20 border-2 border-brand-500/30 p-8 rounded-[2rem] text-center space-y-4">
                <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto shadow-glow">
                    <Zap className="text-white fill-current" />
                </div>
                <h3 className="text-white font-bold text-xl">Ready to implement?</h3>
                <p className="text-gray-400 text-sm">Join 400+ creators building sustainable systems today.</p>
                <button className="w-full bg-brand-500 hover:bg-brand-400 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs">
                    Start Your Launch
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Masterclass;
