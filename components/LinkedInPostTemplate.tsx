
import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, MessageSquare, Repeat2, Send, Globe, MoreHorizontal } from 'lucide-react';

interface LinkedInPostTemplateProps {
  name?: string;
  headline?: string;
  profileImage?: string;
}

const LinkedInPostTemplate: React.FC<LinkedInPostTemplateProps> = ({
  name = "User Name",
  headline = "Founder @ SBL System | Scaling businesses with AI",
  profileImage
}) => {
  const [copied, setCopied] = useState(false);

  const content = `Unpopular opinion: "Hustle Culture" is destroying your business growth. 🛑

I used to work 16-hour days. 
I thought if I wasn't tired, I wasn't trying.
My revenue? Flatline. 📉

Then I made one shift.

I stopped being the "Operator" and started being the "Architect".

The Operator:
- Does the tasks
- Replies to every email manually
- Posts content manually
- Burns out

The Architect:
- Builds the systems
- Uses AI to draft replies
- Schedules content for the month
- Scales

When I replaced manual grind with automated systems, my output 3x'd and my hours dropped by half.

Stop wearing "busy" as a badge of honor.
Start wearing "efficient" as a badge of profit.

Are you building a job or a business? 👇

#Entrepreneurship #Productivity #AI #BusinessGrowth #SystemsThinking`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
        {/* Control Bar */}
        <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
                <h2 className="font-bold text-gray-900 dark:text-white">LinkedIn Authority Post</h2>
                <p className="text-xs text-gray-500">Personalized for {name}</p>
            </div>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-[#004182] transition-colors shadow-lg"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Text'}
            </button>
        </div>

        {/* LinkedIn Card */}
        <div className="bg-white dark:bg-[#1b1f23] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 flex gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
                    {profileImage ? <img src={profileImage} alt={name} className="w-full h-full object-cover" /> : <span className="font-bold text-gray-500">{name[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:underline cursor-pointer truncate">{name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{headline}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <span>3h • </span>
                                <Globe className="w-3 h-3" />
                            </div>
                        </div>
                        <button className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {content}
            </div>

            {/* Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center z-20 ring-1 ring-white dark:ring-gray-800">
                            <ThumbsUp className="w-2.5 h-2.5 text-blue-600 fill-current" />
                        </div>
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center z-10 ring-1 ring-white dark:ring-gray-800">
                            <span className="text-[8px]">❤️</span>
                        </div>
                    </div>
                    <span className="hover:text-blue-600 hover:underline cursor-pointer">842</span>
                </div>
                <div className="flex gap-2">
                    <span className="hover:text-blue-600 hover:underline cursor-pointer">128 comments</span>
                    <span>•</span>
                    <span className="hover:text-blue-600 hover:underline cursor-pointer">45 reposts</span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-2 py-1 flex items-center justify-between">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 font-bold text-sm">
                    <ThumbsUp className="w-5 h-5" /> Like
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 font-bold text-sm">
                    <MessageSquare className="w-5 h-5" /> Comment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 font-bold text-sm">
                    <Repeat2 className="w-5 h-5" /> Repost
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 font-bold text-sm">
                    <Send className="w-5 h-5" /> Send
                </button>
            </div>
        </div>
    </div>
  );
};

export default LinkedInPostTemplate;
