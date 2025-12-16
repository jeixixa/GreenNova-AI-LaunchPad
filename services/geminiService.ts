
import { GoogleGenAI, Modality, VideoGenerationReferenceType } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please provided API_KEY in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Text Generation ---
export interface ViralPostParams {
  style: 'CTA-Driven' | 'Authority-Building' | 'Viral-Redo' | 'YouTube-Viral' | 'Script-Generator';
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'X (Twitter)' | 'TikTok' | 'YouTube';
  isThread?: boolean;
  offerName: string;
  offerLink: string;
  offerDescription: string;
  targetAudience: string;
  topics: string[];
  hookType: string;
  customHook?: string;
  handle: string;
  language: string;
  contentUrl?: string; // Supports FB, YouTube, Blogs
  imageContext?: {
    data: string; // base64
    mimeType: string;
  };
}

export const generateViralPost = async (params: ViralPostParams): Promise<string> => {
  const ai = getAIClient();
    
  let promptContext = "";
  let tools: any[] = [];

  // --- PLATFORM TEMPLATES ---
  const platformTemplates: Record<string, string> = {
      'Facebook': `
      **PLATFORM: FACEBOOK (Viral Thread Style)**
      - **Main Post Rules (Colored Background Style)**:
        1. **120–130 characters MAX** (not including the 👇👇).
        2. **Must end with 👇👇**.
        3. Creates curiosity and makes people open comments.
        4. Short, bold, scroll-stopping.
        5. Example: "Everyone’s using AI wrong and missing millions in potential income 👇👇"
      `,
      'Instagram': `
      **PLATFORM: INSTAGRAM**
      - Format: Engaging Caption for an Image/Reel.
      - Structure: Hook (first line visible) -> Value Body -> CTA.
      - Extras: Include 3 Hashtag Banks at the bottom (Low, Medium, High competition).
      `,
      'LinkedIn': `
      **PLATFORM: LINKEDIN**
      - Format: Professional, structured text.
      - Style: Thought leadership, plain English.
      - Structure: Professional Hook -> Insight -> Takeaway -> CTA.
      `,
      'X (Twitter)': `
      **PLATFORM: X (TWITTER)**
      - Format: ${params.isThread ? 'Thread (Chain of tweets)' : 'Long-form Post'}.
      - Style: Punchy, short sentences, high value density.
      - Extras: Include 9 reply-chain comments to boost engagement.
      `,
      'TikTok': `
      **PLATFORM: TIKTOK**
      - Format: Video Script Description / Caption.
      - Style: Hook -> Body -> CTA.
      - Focus: fast-paced, visual descriptions.
      `,
      'YouTube': `
      **PLATFORM: YOUTUBE**
      - Format: Video Title, Short Description, and Long Description.
      - Extras: SEO keywords and timestamps placeholder.
      `
  };

  const selectedPlatformTemplate = platformTemplates[params.platform] || platformTemplates['Facebook'];

  // --- SECTION PROMPTS ---

  const commentSectionPrompt = `
  **SECTION 4: 8 VIRAL COMMENTS (LADDER SYSTEM)**
  
  You must follow the **Viral Ladder Framework** exactly.
  
  **STRICT FORMATTING RULES:**
  - **DO NOT** use headers like "Comment 1:", "Comment 2:" in the output text.
  - **DO NOT** number the comments manually (e.g. "1. Strategy...").
  - **COMMENTS 2-7 MUST BE SINGLE PARAGRAPHS** (No line breaks inside the comment).
  - **COMMENT 8** is the only one allowing bullet points.

  **STRUCTURE:**

  **COMMENT 1 (Context & Problem):**
  - Write ONE natural paragraph explaining why most people fail or describing the "old way".
  - Create contrast.
  - No CTA in this comment.
  - End with a checkmark benefit (e.g. "✅ Strategy beats chaos").

  **COMMENTS 2-7 (The Strategy Ladder):**
  - Generate 6 distinct strategies.
  - **Format for each:** "Strategy #X: [Strategy Name] [Full details with numbers/metrics] [Natural bridge sentence leading to ${params.offerName}]. 👇 Say '${params.offerName.toUpperCase()}' to [action]. ✅ [Short Benefit]"
  - **CRITICAL**: The Strategy, Details, Bridge, CTA, and Benefit MUST be in the **SAME** paragraph. Do not split them.

  **COMMENT 8 (The Close):**
  - Start with: "🎯 Here’s what happens when..." (Summary of results)
  - Then list exactly 4 bullet points:
    → [Benefit 1]
    → [Benefit 2]
    → [Benefit 3]
    → [Benefit 4]
  - CTA Line: "👇 Say '${params.offerName.toUpperCase()}' for the complete system"
  - Link: ${params.offerLink || '[Link in Bio]'}
  - End with a contrast sentence: "Because [old way]. But [new way]? That’s the shortcut."
  `;

  const imagePromptSection = `
  **SECTION 2: VIRAL IMAGE PROMPT**
  "Generate a high-quality, brand-consistent image that represents ${params.topics.join(', ')}. Use specific colors, styles, or elements to align with our brand identity."
  
  **CRITICAL ADAPTATION INSTRUCTION**:
  Analyze the Topic: "${params.topics.join(', ')}". 
  - If the topic is Business/Tech/Money -> Use "Digital Empire" / "Future Tech" theme. Dark, moody, neon.
  - If the topic is Health/Wellness/Nature/Gardening -> Use "Organic Zen" theme. Bright, clean, nature elements, soft lighting.
  - If the topic is Construction/Trades/Carpentry/Mechanic -> Use "Industrial Strength" theme. Concrete, steel, wood, blueprints, warm tungsten lighting.
  - If the topic is Home/Lifestyle/Parenting/Housekeeping -> Use "Modern Warmth" theme. Cozy, interior design style, soft daylight.
  - If the topic is Medical/Science -> Use "Clinical Clean" theme. White, blue, glass, laboratory precision.
  - If the topic is Food/Cooking -> Use "Culinary Art" theme. Warm, appetizing, detailed textures.
  - If the topic is Fashion/Beauty/Tailoring -> Use "Editorial Chic" theme. High fashion lighting, clean backgrounds, elegant.
  - If the topic is Travel/Adventure -> Use "Wanderlust" theme. Epic landscapes, golden hour, dynamic angles.
  - If the topic is Pet Care -> Use "Joyful Companions" theme. Bright colors, energetic, warm.
  
  **Standard Style Rules (Apply to all themes):**
  • **Style**: High-end digital art or cinematic photography.
  • **Mood**: Motivational, inspiring, intense, and triumphant (adapted to the niche).
  • **Subject**: A single confident, powerful figure representing the niche (e.g., Doctor, Builder, Chef, Entrepreneur).
  • **Composition**: CRITICAL - Subject in the upper 60%. Bottom 40% must be clean negative space for a quote overlay.
  `;

  const blogSectionPrompt = `
  **SECTION 3: VIRAL MINI-BLOG**
  Write a high-impact short blog post (300-400 words) repurposing this topic.
  Structure: Hook -> Problem -> Insight -> Solution -> Steps -> Payoff.
  - Bridge to the offer "${params.offerName}" at the end.
  - Practical, no fluff.
  - **NO STARS OR DASHES** in the body text. Keep it clean.
  `;

  const mainPostSection = `
  **SECTION 5: MAIN POST BODY (CAPTION)**
  "Create an engaging and relevant caption for the following image/topic: ${params.topics.join(', ')}.
  
  **CRITICAL LINKING RULES:**
  1. **ONLY** refer to the User's Offer: "${params.offerName}" (Link: ${params.offerLink || 'Link in Bio'}).
  2. **ONLY** refer to "GreenNova AI LaunchPad" as the system/tool used (if relevant).
  3. **DO NOT** refer to random YouTube links or external articles unless they are the specific Offer Link provided above.
  4. The Call to Action (CTA) must focus exclusively on getting the user to check out "${params.offerName}".
  
  The tone should be ${params.style}, and include specific keywords or hashtags."
  
  **Platform Specific Adjustments**:
  - If Platform is **Facebook**: You MUST still follow the strict Viral Thread rule: 120-130 characters MAX, ending with 👇👇. You can provide the longer caption as an "Extended Caption" below the main hook.
  - If Platform is **Instagram/LinkedIn/TikTok**: Use the full caption generated above.
  `;

  const instaThreadPrompt = `
  **SECTION 6: INSTAGRAM THREAD / CAROUSEL**
  
  **ROLE**: World-class Instagram carousel designer and conversion-focused content strategist.
  **GOAL**: Generate a scroll-stopping, high-retention 7-10 slide carousel designed for maximum reach, saves, and shares.
  
  **CONTEXT**:
  - Topic: ${params.topics.join(', ')}
  - Target Audience: ${params.targetAudience || 'Entrepreneurs, creators, sustainability startups'}
  - Tone: ${params.style === 'Authority-Building' ? 'AUTHORITATIVE & EDUCATIONAL' : 'BOLD & MOTIVATIONAL'}
  - Instagram Handle: ${params.handle}
  - Brand Colors: Blue, Red, White.
  
  **DESIGN RULES (STRICT):**
  1. **Slides**: 7–10 total.
  2. **Font System**: Headlines (Anton/Bebas/League Spartan), Body (Inter/Poppins).
  3. **Visuals**: Huge headlines (readable at arm's length).
  4. **Color Syntax (Use these markers for emphasis in the text):**
     - **Text** -> BLUE (Highlight/Strategy)
     - ((Text)) -> RED (Urgent/Pain/Stop)
     - {{Text}} -> WHITE (Bold/Emphasis)
     - [[Text]] -> LIGHT BLUE (Trust/Calm)
  5. **Minimal Text**: Max 8 words per headline. Max 2 short lines of body text.
  
  **CAROUSEL STRUCTURE:**
  - **Slide 1 (HOOK)**: Pattern interrupt. Bold, controversial or curiosity-driven. No explanations. Example: "((Stop)) Doing This..."
  - **Slides 2-6 (VALUE)**: One idea per slide. Clear, blunt statements. Avoid fluff. Use color syntax to highlight keywords.
  - **Slide 7 (INSIGHT/SHIFT)**: Reframe belief or deliver a "mic-drop" truth.
  - **Slide 8-9 (CTA)**: Direct CTA (e.g. "**Save This**", "Comment '{{${params.offerName}}}'", "Follow [[${params.handle}]]").
  
  **OUTPUT FORMAT**:
  Slide 1: [Content with color syntax]
  Slide 2: [Content with color syntax]
  ...
  Slide 9: [Content with color syntax]
  `;

  const tweetSectionPrompt = `
  **SECTION 7: 5 VIRAL TWEETS**
  Generate 5 distinct viral tweet variations based on the topic.
  Format:
  Tweet 1: [Content]
  Tweet 2: [Content]
  ...
  Rules:
  - Under 280 chars.
  - Use 1-2 powerful hashtags.
  - Engaging, punchy, controversial or insight-driven.
  - Author Handle: ${params.handle} (Use this for context if needed).
  `;

  const strategySection = `
  **SECTION 8: STRATEGY & ANALYTICS**
  
  **Content Scheduling:**
  "Schedule this post to be published on [Recommend Date/Time] across ${params.platform}. Optimize posting times based on audience activity for maximum engagement."
  
  **Performance Analytics:**
  "Track and report the performance of this post, including engagement, reach, click-through rate, and other key metrics. Provide actionable insights for improving future content."
  
  **Content Curation:**
  "Suggest trending topics and relevant content ideas for ${params.topics.join(', ')}. Provide a list of 3 potential themes and ideas for upcoming posts to keep content fresh and engaging."
  `;

  // Incorporate Topics and Hooks
  const specificInstructions = `
  **Specific Style Instructions:**
  - Topics to Cover: ${params.topics.length > 0 ? params.topics.join(', ') : 'Viral Business Growth'}.
  - Hook Style: ${params.hookType || 'High Impact'}.
  - Target Audience: ${params.targetAudience}.
  - **Offer Bridge**: "${params.offerName}" - ${params.offerDescription}.
  - **Author Handle**: "${params.handle}".
  `;

  // --- MODE LOGIC ---

  if (params.style === 'Script-Generator') {
      promptContext = `
      **TASK: CREATE YOUTUBE VIDEO SCRIPT**
      
      **GOAL:** Create a full viral video script about: ${params.topics.join(', ') || params.contentUrl || 'Business Growth'}.
      
      **OFFER CONTEXT:**
      - Name: ${params.offerName}
      - Link: ${params.offerLink}
      
      **REQUIRED OUTPUT STRUCTURE:**
      
      **SECTION 1: VIDEO METADATA (5 TITLES)**
      - Generate 5 distinct, high-CTR titles.
      - Thumbnail Idea (High Contrast, Clickbait style matching the niche)
      
      **SECTION 5: FULL SCRIPT**
      - **Hook (0-60s)**: Grab attention, state the problem, promise the solution.
      - **Intro**: Brief credibility + "In this video...".
      - **Body**: 3-5 Main Steps/Secrets.
      - **Bridge**: Natural transition to the offer "${params.offerName}".
      - **Outro**: CTA to click the link below.
      
      ${commentSectionPrompt}
      ${instaThreadPrompt}
      ${tweetSectionPrompt}
      ${strategySection}
      `;
      
      if (params.contentUrl) {
           tools = [{ googleSearch: {} }]; // Read the URL if provided for the script source
           promptContext += `\n\n**SOURCE MATERIAL**: Analyze this URL: ${params.contentUrl}`;
      }

  } else if (params.style === 'YouTube-Viral') {
      // Specific logic for "On YouTube ... scan Offer ... create viral Facebook Posts ... bridge to Offer"
      promptContext = `
      **TASK: YOUTUBE VIDEO TO VIRAL FACEBOOK POST BRIDGE**
      
      **INPUTS TO SCAN:**
      1. **YouTube Video**: ${params.contentUrl} (Watch and analyze this video content for viral insights).
      2. **User Offer**: "${params.offerName}" - ${params.offerDescription} (Scan this offer details).
      
      **GOAL:** 
      Create a high-converting Viral Facebook Post that extracts value from the video and NATURALLY bridges to the User's Offer.
      
      ${specificInstructions}
      ${selectedPlatformTemplate}
      
      **REQUIRED OUTPUT STRUCTURE (Strictly follow these headers):**
      
      **SECTION 1: 7 VIRAL HOOKS**
      - Generate 7 distinct viral hooks (1-2 lines max each).
      - Format: Hook 1: [Text] ... Hook 7: [Text]
      - Style: ${params.hookType}.
      - Must be scroll-stopping.
      
      ${imagePromptSection}
      
      ${blogSectionPrompt}
      
      ${commentSectionPrompt}
      
      ${mainPostSection}

      ${instaThreadPrompt}
      ${tweetSectionPrompt}
      ${strategySection}
      `;
      
      tools = [{ googleSearch: {} }];

  } else if (params.style === 'Viral-Redo' || params.contentUrl) {
      // VIRAL LAUNCHPAD MODE (Repurpose Generic)
      promptContext = `
      **TASK: VIRAL CONTENT REPURPOSING (LAUNCHPAD MODE)**
      
      The user has provided a URL: ${params.contentUrl || 'Analyze the attached image/context'}
      
      **GOAL:** Extract the "Viral Gold" from this content and transform it into distinct assets that bridge to the user's offer.
      
      ${specificInstructions}
      ${selectedPlatformTemplate}
      
      **REQUIRED OUTPUT STRUCTURE (Strictly follow these headers):**
      
      **SECTION 1: 7 VIRAL HOOKS**
      - Generate 7 distinct viral hooks (1-2 lines max each).
      - Format: Hook 1: [Text] ... Hook 7: [Text]
      - Style: ${params.hookType}.
      
      ${imagePromptSection}
      
      ${blogSectionPrompt}
      
      ${commentSectionPrompt}
      
      ${mainPostSection}

      ${instaThreadPrompt}
      ${tweetSectionPrompt}
      ${strategySection}
      `;
      
      // Enable Search to read the URL
      tools = [{ googleSearch: {} }];

  } else {
      // Standard Generation Mode (CTA / Authority)
      promptContext = `
      **TASK: Create Viral Social Media Content**
      Mode: ${params.style}
      ${specificInstructions}
      ${selectedPlatformTemplate}
      
      **REQUIRED OUTPUT STRUCTURE:**
      
      **SECTION 1: 7 VIRAL HOOKS**
      - Generate 7 distinct viral hooks (1-2 lines max each).
      - Format: Hook 1: [Text] ... Hook 7: [Text]
      - Use the "${params.hookType}" hook style.
      
      ${mainPostSection}
      
      ${commentSectionPrompt}
      
      ${imagePromptSection}

      ${blogSectionPrompt}

      ${instaThreadPrompt}
      
      ${tweetSectionPrompt}

      ${strategySection}
      `;
  }

  const prompt = `
  You are the AI-Powered Sustainable Business Launch System, a world-class viral content engine.
  ${promptContext}

  **Global Rules:**
  1. Tone: ${params.style === 'Authority-Building' ? 'Professional, Insightful, Leader' : 'Urgent, Action-Oriented, Exciting'}.
  2. Readability: Grade 5 level. Short sentences.
  3. Bridge: Every piece of content must naturally lead to the offer "${params.offerName}".
  4. Language: ${params.language}.
  5. **Customization and Branding:** "Ensure all generated content aligns perfectly with our brand guidelines, including colors, logos, and tone of voice."
  6. **CRITICAL STYLE RULES**:
     - **NO JARGON**: Use simple, plain words that a 5th grader can understand.
     - **CLEAN OUTPUT**: Do not use decorative stars (*), excessive dashes (--), or fancy symbols unless asked. Keep it clean and readable.
     - **Clear & Concise**: Avoid fluff. Get straight to the point.
  
  Output strictly in Markdown. Use the "SECTION X: TITLE" headers exactly as requested.
  `;

  const requestParts: any[] = [{ text: prompt }];

  // Add image if present
  if (params.imageContext) {
    requestParts.unshift({
      inlineData: {
        data: params.imageContext.data,
        mimeType: params.imageContext.mimeType
      }
    });
  }

  // Only add tools if explicitly required to avoid errors with empty arrays
  const config: any = {};
  if (tools && tools.length > 0) {
      config.tools = tools;
  }

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: requestParts },
      config: config
  });

  return response.text || "";
};

// --- Video Meta Generation (Hooks, Captions) ---
export const generateVideoMeta = async (
  task: 'hooks' | 'captions' | 'script', 
  context: string,
  videoContext?: { data: string, mimeType: string }
): Promise<string> => {
  const ai = getAIClient();
  let prompt = "";
  
  if (task === 'hooks') {
    prompt = `Generate 5 viral video hooks (first 3 seconds) for a video about: "${context}".
    ${videoContext ? 'Analyze the visual and audio context of the attached video to make the hooks relevant to what is happening on screen.' : ''}
    Style: Controversial, Pattern Interrupt, or Curiosity Gap.
    Format: Bullet points.`;
  } else if (task === 'captions') {
    prompt = `Write a viral social media caption for this video context: "${context}".
    ${videoContext ? 'Analyze the visual and audio context of the attached video.' : ''}
    Include: Hook line, short body value, and Call to Action.
    Platform: Instagram Reels / TikTok.`;
  } else if (task === 'script') {
    prompt = `Write a 60-second video script based on this context: "${context}".
    ${videoContext ? 'CRITICAL: Watch the attached video. Write a voiceover script or improved content script that matches the visual flow of the video provided.' : ''}
    Structure: Hook (0-3s), Retain (3-15s), Value (15-45s), CTA (45-60s).`;
  }

  const parts: any[] = [{ text: prompt }];
  if (videoContext) {
      parts.unshift({
          inlineData: {
              data: videoContext.data,
              mimeType: videoContext.mimeType
          }
      });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts }
  });

  return response.text || "";
};

// --- Transcribe Audio ---
export const transcribeAudio = async (audioBase64: string, mimeType: string = 'audio/wav'): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        { text: "Transcribe this audio exactly. Do not add any other text." }
      ]
    }
  });
  return response.text || "";
};

// --- Image Generation ---
export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio,
            outputMimeType: 'image/jpeg'
        }
    });
    
    // Check if response has generatedImages and it's not empty
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64EncodeString: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64EncodeString}`;
    }
    throw new Error("No image generated");
};

export const generateImageNano = async (prompt: string, imageContext?: {data: string, mimeType: string}): Promise<string> => {
    const ai = getAIClient();
    
    const parts: any[] = [{ text: prompt }];
    if (imageContext) {
        parts.unshift({
            inlineData: {
                data: imageContext.data,
                mimeType: imageContext.mimeType
            }
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts }
    });
    
    // Find image part
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image generated by Nano");
};

export const generateImageNanoPro = async (prompt: string, aspectRatio: string = "1:1", imageContext?: {data: string, mimeType: string}): Promise<string> => {
    const ai = getAIClient();
    
    const parts: any[] = [{ text: prompt }];
    if (imageContext) {
        parts.unshift({
            inlineData: {
                data: imageContext.data,
                mimeType: imageContext.mimeType
            }
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: "1K"
            }
        }
    });
    
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image generated by Nano Pro");
};

// --- Face Fusion / Multi-Image Generation ---
export const generateFaceFusion = async (images: {data: string, mimeType: string}[], prompt: string): Promise<string> => {
    const ai = getAIClient();
    const parts: any[] = [];
    
    // Add all images as inlineData parts
    images.forEach(img => {
        parts.push({
            inlineData: {
                data: img.data,
                mimeType: img.mimeType
            }
        });
    });

    // Add prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K"
            }
        }
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image generated");
};

export const generateFaceFusionNano = async (images: {data: string, mimeType: string}[], prompt: string): Promise<string> => {
    const ai = getAIClient();
    const parts: any[] = [];
    
    // Add all images as inlineData parts
    images.forEach(img => {
        parts.push({
            inlineData: {
                data: img.data,
                mimeType: img.mimeType
            }
        });
    });

    // Add prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        // No imageConfig for flash-image typically.
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image generated by Nano");
};

export const editImageWithPrompt = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                { text: prompt }
            ]
        }
    });
    
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No edited image generated");
};

// --- Video Generation ---
export interface VideoGenerationParams {
    prompt: string;
    aspectRatio?: '16:9' | '9:16';
    resolution?: '720p' | '1080p';
    image?: { data: string, mimeType: string };
}

export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
    const ai = getAIClient();
    
    const model = 'veo-3.1-fast-generate-preview';
    
    let operation = await ai.models.generateVideos({
        model: model,
        prompt: params.prompt,
        image: params.image ? {
            imageBytes: params.image.data,
            mimeType: params.image.mimeType
        } : undefined,
        config: {
            numberOfVideos: 1,
            resolution: params.resolution || '720p',
            aspectRatio: params.aspectRatio || '9:16'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos.length > 0) {
        const videoUri = operation.response.generatedVideos[0].video.uri;
        const apiKey = process.env.API_KEY;
        const videoUrl = `${videoUri}&key=${apiKey}`;
        return videoUrl;
    }
    throw new Error("Video generation failed");
};

export const generateVideoFromImages = async (images: {data: string, mimeType: string}[], prompt: string): Promise<string> => {
    const ai = getAIClient();
    
    // Limit to 3 images as per guidelines for multi-reference
    const refs = images.slice(0, 3).map(img => ({
        image: {
            imageBytes: img.data,
            mimeType: img.mimeType
        },
        referenceType: VideoGenerationReferenceType.ASSET
    }));

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt || "Animate these characters",
        config: {
            numberOfVideos: 1,
            referenceImages: refs,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos.length > 0) {
        const videoUri = operation.response.generatedVideos[0].video.uri;
        const apiKey = process.env.API_KEY;
        const videoUrl = `${videoUri}&key=${apiKey}`;
        return videoUrl;
    }
    throw new Error("Video generation failed");
};

// --- Speech Generation ---
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName }
                }
            }
        }
    });
    
    if (response.candidates && response.candidates[0].content.parts && response.candidates[0].content.parts[0].inlineData) {
        return response.candidates[0].content.parts[0].inlineData.data;
    }
    throw new Error("Speech generation failed");
};

// --- Other Services ---
export const findViralContent = async (niche: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find 5 currently viral and trending topics, articles, or videos related to "${niche}". 
        For each, provide the Title and a direct URL. 
        Focus on content that has high engagement or is "breaking news" in this niche.`,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response.text || "No results found.";
};

export const generateBlogPost = async (topic: string, imageBase64?: string, imageMime?: string): Promise<string> => {
    const ai = getAIClient();
    const parts: any[] = [{ text: `Write a high-quality, engaging blog post about: ${topic}. Structure it with a catchy title, introduction, main body points, and conclusion. Keep it under 500 words.` }];
    
    if (imageBase64 && imageMime) {
        parts.unshift({
            inlineData: {
                data: imageBase64,
                mimeType: imageMime
            }
        });
        parts[1].text = `Write a blog post based on this image and the topic: ${topic}.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts }
    });

    return response.text || "";
};

export const generateBusinessRoadmap = async (businessType: string): Promise<string> => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a detailed step-by-step launch roadmap for a "${businessType}" business. Include phases for Research, Setup, Marketing, and Launch. Use Markdown formatting.`
    });
    return response.text || "";
};

export const analyzeSubscription = async (userData: any): Promise<any> => {
    const ai = getAIClient();
    const prompt = `
    Analyze this user subscription data and provide retention insights.
    User Data: ${JSON.stringify(userData)}
    
    Return a JSON object with:
    1. cancellation_risk (0-100 integer)
    2. renewal_action (string, advice)
    3. plan_change (string, e.g. "Stay on Monthly" or "Upgrade to Annual")
    4. message_template (string, personalized email snippet)
    5. priority_score (0-10 integer)
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });

    try {
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return { cancellation_risk: 0, renewal_action: "Error", plan_change: "None", message_template: "Error", priority_score: 0 };
    }
};
