import React, { useState } from "react";
import { Copy, Check, Layers } from "lucide-react";

// Facebook-thread style component (Jonathan Montoya format)
// TailwindCSS expected in project

const PROMPT_TEMPLATE = `Create a Facebook thread in the following format and style:

FORMAT REQUIREMENTS:
1. MAIN POST (1–2 lines only)
  • Bold colored-background style
  • Strong hook
  • Add 1–2 emojis in the main post ONLY
  • Short, punchy, scroll-stopping

2. COMMENTS SECTION (Numbered 1–9)
  • Each comment labeled: "1 - ", "2 - " ...
  • Single structured paragraph per comment
  • Start with an action phrase (e.g., "Get Paid for Posting Content")
  • Explain the method in simple conversational language
  • Include one subtle promo sentence about the offer/system
  • Include ONE CTA: Say "KEYWORD" to get this setup
  • 1–2 emojis MAX per comment (optional)

3. Tone & Style: clear, practical, direct, helpful with a promotional angle
4. Topic: {{ INSERT YOUR TOPIC HERE }}

Output:
• Main post (one short line with 1–2 emojis)
• 9 numbered comments following the rules above
`;

interface FacebookThreadTemplateProps {
  topic?: string;
  mainHook?: string;
  screenshotUrl?: string;
  comments?: string[];
  showReference?: boolean;
}

const FacebookThreadTemplate: React.FC<FacebookThreadTemplateProps> = ({
  topic = "Facebook Growth & Monetization using AI",
  mainHook = "I used AI to turn my Facebook page from quiet to cash-flowing",
  screenshotUrl = "https://placehold.co/600x400/22c55e/white?text=Viral+Result+Screenshot",
  comments,
  showReference = true,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedAllComments, setCopiedAllComments] = useState(false);

  const exampleComments = [
    `1 - Treat Facebook like a business, not a hobby. AI taught me how to turn engagement into income. Say "AI Freedom" to learn the system.`,
    `2 - The AI Content Engine: use ChatGPT + Notion to write a week of posts in one sitting. Manual works, but a system scales faster. Say "Content" for the template.`,
    `3 - Messenger Profit Funnel: connect Manychat + ChatGPT to auto-reply and qualify leads. Manual replies are okay, automation closes deals while you sleep. Say "Messenger" for the flow.`,
    `4 - Proof Post Routine: share small wins weekly. AI formats and schedules them at peak times. Say "Proof" to get the layout.`,
    `5 - Offer Builder: use ChatGPT + Canva to design a low-ticket offer that converts. Manual copywriting helps, but systemized funnels sell. Say "Offer" for the script.`,
    `6 - Audience Tracker: a Google Sheet + ChatGPT records which posts bring money. Guessing costs time; tracking creates growth. Say "Tracker" for the sheet.`,
    `7 - Automation Loop: link ChatGPT, Meta Planner and Zapier to post, reply and report. You can run manually, but the system acts like a 24/7 employee. Say "System" to copy it.`,
    `8 - Final lesson: AI rewards those who learn fast. Build systems, not just content. Say "AI Freedom" if you want the whole blueprint.`,
    `9 - Bonus tip: Reuse top performers with Repurpose.io + CapCut to create 5x content from one idea. Say "Remix" for the workflow.`,
  ];

  const displayComments = comments || exampleComments;

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT_TEMPLATE).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1600);
    });
  }

  function copyAllComments() {
    const allText = displayComments.join('\n\n');
    navigator.clipboard.writeText(allText).then(() => {
        setCopiedAllComments(true);
        setTimeout(() => setCopiedAllComments(false), 2000);
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded-md overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
          <h2 className="text-lg font-bold text-center">{mainHook} <span className="ml-2">🚀💰</span></h2>
        </div>
        <div className="bg-gray-900 text-gray-100 p-6">
          {showReference && (
            <div className="mb-4">
              <img src={screenshotUrl} alt="design reference" className="w-full rounded-md border" />
              <p className="text-sm text-gray-400 mt-2">Reference screenshot: {screenshotUrl}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">Main Post</h3>
            <div className="bg-gray-800 p-4 rounded text-gray-200">
                {mainHook} <span>👇👇</span>
                <button
                    onClick={() => navigator.clipboard.writeText(mainHook || "")}
                    className="ml-2 px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-xs inline-block"
                >Copy</button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-semibold">Comments ({displayComments.length})</h3>
                <button 
                    onClick={copyAllComments}
                    className="text-xs font-bold flex items-center px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
                >
                    {copiedAllComments ? <Check className="w-3 h-3 mr-1" /> : <Layers className="w-3 h-3 mr-1" />}
                    {copiedAllComments ? 'All Copied' : 'Copy All Comments'}
                </button>
            </div>
            <div className="space-y-3">
              {displayComments.map((c, i) => (
                <div key={i} className="bg-gray-800 p-3 rounded text-gray-200">
                  <div className="flex justify-between items-start gap-3">
                    <pre className="whitespace-pre-wrap flex-1 font-sans">{c}</pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(c)}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-xs shrink-0"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showReference && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={copyPrompt}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
              >
                {copiedPrompt ? "Prompt copied" : "Copy prompt to clipboard"}
              </button>

              <a
                href={screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-gray-700 text-gray-200 rounded"
              >
                Open reference image
              </a>
            </div>
          )}

        </div>
      </div>

      {showReference && (
        <div className="text-sm text-gray-500 mt-4">This React component expects TailwindCSS in your project. Replace <code>exampleComments</code> with your generated content and pass <code>topic</code> or <code>mainHook</code> as props to customize.</div>
      )}
    </div>
  );
}

export default FacebookThreadTemplate;