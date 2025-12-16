
import React, { useState } from 'react';
import { Copy, Check, Star, Zap, TrendingUp, MessageCircle } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    title: "The 'Anti-Hustle' Shift",
    hook: "Stop grinding 16 hours a day. It's keeping you broke.",
    content: `Stop grinding 16 hours a day. It's keeping you broke. 🛑💸

1 - The "Hustle Trap": Society tells you more work = more money. False. Leveraging systems = more money.

2 - AI is the new leverage: I replaced my copywriter, scheduler, and strategist with one AI workflow.

3 - The Result: I work 4 hours a day and make 3x more. 

4 - The Shift: Move from "Worker" to "Architect". Build the machine, don't be the machine.

Say "ARCHITECT" and I'll send you the blueprint. 👇`,
    stats: "2.4K Likes • 450 Comments",
    category: "Mindset Shift"
  },
  {
    id: 2,
    title: "The Simple Math to $10k",
    hook: "You don't need a million followers to make $10k/month.",
    content: `You don't need a million followers to make $10k/month. 📉➡️💰

Here is the simple math:

1 - Sell a High Ticket Offer ($2,000).
2 - You only need 5 sales a month.
3 - That is 1.25 sales a week.

How to get them?
- Post daily value (AI helps here).
- Start conversations in DMs.
- Solve real problems.

Don't overcomplicate it. 

Say "MATH" for my offer breakdown worksheet.`,
    stats: "1.8K Likes • 320 Comments",
    category: "Strategy"
  },
  {
    id: 3,
    title: "AI Tools I Actually Use",
    hook: "I tested 50 AI tools so you don't have to.",
    content: `I tested 50 AI tools so you don't have to. 🤖✅

Here are the top 3 that actually make money:

1 - ChatGPT (The Brain): Use it for strategy and frameworks, not just generic text.
2 - Gemini (The Creative): Great for analyzing images and video scripts.
3 - SBL Threads (The System): All-in-one content to cash machine.

Stop collecting tools. Start building systems.

Say "TOOLS" for my complete tech stack list.`,
    stats: "3.1K Likes • 600 Comments",
    category: "Tools"
  }
];

const StudioJames: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-4xl font-serif font-bold mb-2">Studio SBL Viral Posts</h1>
            <p className="text-yellow-100 font-medium text-lg max-w-2xl">
                Access the exact templates and high-performing scripts used to generate millions of views. Copy, paste, and tweak for your niche.
            </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Star className="w-64 h-64 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POSTS.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                            {post.category}
                        </span>
                        <div className="flex items-center text-gray-400 text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Viral
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{post.title}</h3>
                </div>
                
                <div className="p-5 flex-1 bg-gray-50 dark:bg-gray-900/50 font-mono text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {post.content}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-b-xl">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                        {post.stats}
                    </div>
                    <button 
                        onClick={() => handleCopy(post.content, post.id)}
                        className={`
                            flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                            ${copiedId === post.id 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-900 text-white hover:bg-gray-700'}
                        `}
                    >
                        {copiedId === post.id ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedId === post.id ? 'Copied' : 'Copy Post'}
                    </button>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 text-center">
        <MessageCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">Need a Custom Strategy?</h3>
        <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4 max-w-md mx-auto">
            These templates are great, but a custom strategy works best. Use the "SBL Viral Posts" generator to create unique content for your specific offer.
        </p>
      </div>
    </div>
  );
};

export default StudioJames;
