import { GoogleGenAI, Modality } from "@google/genai";

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
  try {
    const ai = getAIClient();
    
    let promptContext = "";
    let tools: any[] = [];

    // --- PLATFORM TEMPLATES ---
    const platformTemplates: Record<string, string> = {
        'Facebook': `
        **PLATFORM: FACEBOOK**
        - Format: Short-form text, soft CTA.
        - Style: No spam triggers. Conversational. No jargon.
        - Structure: Hook -> Story/Value -> Soft Bridge -> CTA.
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
    **SECTION 4: 9 VIRAL COMMENTS**
    Generate exactly 9 numbered comments to post under the main content.
    Format: "1 - [Insight]. **[Bridge to Offer]**"
    Rules:
    - Short, punchy, conversational (Jonathan Montoya style).
    - Each must bridge to the offer: "${params.offerName}".
    - **CRITICAL: You MUST BOLD the sentence that bridges to the offer** using markdown (e.g., **Check out the LaunchPad here**).
    - **MANDATORY: The 9th (last) comment MUST be the 'Closer' and MUST explicitly include the Offer URL**: ${params.offerLink || '[Link in Bio]'}
    - Include one specific Call to Action (CTA) in each.
    - **NO JARGON**. Keep it simple.
    `;

    const imagePromptSection = `
    **SECTION 2: VIRAL IMAGE PROMPT**
    Generate a HIGHLY SPECIFIC image prompt following the "Viral Power Quote" style:
    
    • **Style**: "Viral Power Quote". High-end digital art style.
    • **Theme**: "Digital Empire" / "Future Tech". Dark, moody, and ultra-modern.
    • **Lighting**: Cinematic lighting with strong contrast (chiaroscuro). Volumetric lighting with glowing neon accents (Cyan, Electric Blue, or Golden Amber).
    • **Background**: Dark, tech-themed environment with glowing elements (digital grids, holographic data, futuristic interfaces). Must be 80% dark to support text overlay.
    • **Subject**: A single confident, powerful figure (modern entrepreneur). Intense, motivational, and triumphant expression.
    • **Composition**: CRITICAL - Subject in the upper 60%. Bottom 40% must be clean, dark negative space for a quote overlay.
    
    **Context**: Visualise the topic "${params.topics.join(', ') || 'Business Success'}" within this specific dark, tech, cinematic aesthetic.
    `;

    const blogSectionPrompt = `
    **SECTION 3: VIRAL MINI-BLOG**
    Write a high-impact short blog post (300-400 words) repurposing this topic.
    Structure: Hook -> Problem -> Insight -> Solution -> Steps -> Payoff.
    - Bridge to the offer "${params.offerName}" at the end.
    - Practical, no fluff.
    - **NO STARS OR DASHES** in the body text. Keep it clean.
    `;

    const instaThreadPrompt = `
    **SECTION 6: INSTAGRAM THREAD / CAROUSEL**
    Generate a 7-slide Carousel using the "Facebook-Safe Educational Graphic" script style:

    **STYLE RULES (CRITICAL):**
    - **NO HYPE**: Avoid risky words like "viral", "secret", "profit", "explode", "unlock", "cash", "money".
    - **TONE**: Calm, educational, helpful, clear.
    - **FORMAT**:
        - Use **double asterisks** for **Yellow Highlighted Key Phrases**.
        - Use [[double brackets]] for [[Blue Underlined Link-Style Text]].
    
    **SLIDE 1 STRUCTURE (The Hook):**
    - Line 1: **[Strong Educational Hook in CAPS]**
    - Line 2: [1-2 helpful sentences explaining the value]
    - Line 3: [[Soft Call to Action (e.g. Comment 'GUIDE')]] 👇
    - Line 4: (Tiny context/disclaimer note in parentheses)

    **SLIDES 2-6 (The Lesson):**
    - Deliver clear, numbered steps or insights.
    - Highlight key terms with **bold**.
    - Keep it short and readable.
    - Ensure there are enough points to fill 7 slides total.

    **SLIDE 7 (The Close):**
    - Soft educational CTA to: "${params.offerName}"
    - Format: [[${params.offerLink || 'Link in comments'}]] 👇
    - (Optional tiny note)

    Format output as:
    Slide 1: [Content]
    Slide 2: [Content]
    ...
    Slide 7: [Content]
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
        
        **SECTION 5: MAIN POST BODY**
        - **Platform**: Viral Facebook Style (Short paragraphs, engaging, spacing, no jargon).
        - **Structure**:
           1. **Hook**: [Use one of the generated hooks].
           2. **The Lesson**: What we learned from the video.
           3. **The Bridge**: "This is why I created ${params.offerName}..."
           4. **CTA**: ${params.offerLink ? `Check it out here: ${params.offerLink}` : 'Link in bio'}.

        ${instaThreadPrompt}
        ${tweetSectionPrompt}
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
        
        **SECTION 5: MAIN POST BODY**
        - Create the main content based on the selected platform: ${params.platform}.
        - Ensure it bridges naturally to the offer.

        ${instaThreadPrompt}
        ${tweetSectionPrompt}
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
        
        **SECTION 5: MAIN POST BODY**
        - Write the full post optimized for ${params.platform}.
        - Focus on value and authority.
        
        ${commentSectionPrompt}
        
        ${imagePromptSection}

        ${blogSectionPrompt}

        ${instaThreadPrompt}
        
        ${tweetSectionPrompt}
        `;
    }

    const prompt = `
    You are GreenNova AI LaunchPad, a world-class viral content engine.
    ${promptContext}

    **Global Rules:**
    1. Tone: ${params.style === 'Authority-Building' ? 'Professional, Insightful, Leader' : 'Urgent, Action-Oriented, Exciting'}.
    2. Readability: Grade 5 level. Short sentences.
    3. Bridge: Every piece of content must naturally lead to the offer "${params.offerName}".
    4. Language: ${params.language}.
    5. **CRITICAL STYLE RULES**:
       - **NO JARGON**: Use simple, plain words that a 5th grader can understand.
       - **CLEAN OUTPUT**: Do not use decorative stars (*), excessive dashes (--), or fancy symbols. Keep it clean and readable.
       - **Clear & Direct**: Avoid fluff. Get straight to the point.
    
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
    
    let text = response.text || "No content generated.";

    // Append sources if available from search grounding
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri ? `[${chunk.web.title || 'Source'}](${chunk.web.uri})` : null)
        .filter(Boolean);
      
      const uniqueSources = [...new Set(sources)];
      if (uniqueSources.length > 0) {
        text += "\n\n**Sources:**\n" + uniqueSources.join('\n');
      }
    }

    return text;
  } catch (error) {
    console.error("Text Gen Error:", error);
    throw error;
  }
};

export const findViralContent = async (niche: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Find trending, high-engagement viral content topics related to "${niche}" from the last 7 days.
      Focus on YouTube videos, Viral Tweets, or Facebook trends.
      
      Output a list of 5 items.
      **CRITICAL: You MUST output the link in Markdown format: [Title](URL).**
      
      Format for each item:
      1. **Headline**: [Title of the video/post](URL)
      2. **The Hook**: Why it's going viral.
      3. **Engagement**: Est. views/likes.
      
      Ensure the URL is valid and extractable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    return response.text || "No viral content found.";
  } catch (error) {
    console.error("Viral Search Error:", error);
    throw error;
  }
};

export const generateBusinessRoadmap = async (businessType: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `Create a detailed step-by-step launch roadmap for a sustainable "${businessType}" business.
    Include:
    1. Marketing Strategy
    2. Recommended AI Tools
    3. Content Ideas
    4. Potential Revenue Streams
    Format as a clean markdown list.
    **NO JARGON. Keep it clear.**`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No roadmap generated.";
  } catch (error) {
    console.error("Roadmap Gen Error:", error);
    throw error;
  }
};

export const generateBlogPost = async (context: string, imageBase64?: string, mimeType?: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const systemInstruction = "You are a world-class content creator. You provide deep value and clear insight. Write for an international audience interested in online business and AI.";
    
    const parts: any[] = [{
        text: `Write a high-impact, viral-style blog post based on this context: "${context}".

        STRICT FORMATTING RULES:
        1. **HEADING**: Must be at the very top, in **ALL CAPITAL LETTERS**.
        2. **Meta Description**: Immediately below the heading.
        3. **Body Content**:
           - Hook
           - Problem
           - Insight/Solution
           - Action Steps
           - CTA (Call to Action)
        
        **STYLE GUIDELINES**:
        - **NO JARGON**: Use simple, direct language.
        - **CLEAN TEXT**: Avoid using asterisks (*), dashes (-), or fancy formatting in the body.
        - **Clear & Concise**: Keep it easy to read.

        Tone: Professional, motivational, practical.
        Length: 400-600 words.
        `
    }];

    if (imageBase64 && mimeType) {
        parts.unshift({
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { systemInstruction }
    });

    return response.text || "Failed to generate blog post.";
  } catch (error) {
    console.error("Blog Gen Error:", error);
    throw error;
  }
};

export const generateShortsScript = async (topic: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Create a viral 60-second YouTube Shorts script about: "${topic}".
      
      Format:
      [Visual Cue]: Description of visual
      [Audio]: The spoken script
      
      Structure:
      1. Hook (0-3s): Grab attention immediately.
      2. Value/Story (3-50s): Deliver the core message or tip.
      3. CTA (50-60s): Tell them what to do next.
      
      Make it punchy, fast-paced, and engaging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Failed to generate script.";
  } catch (error) {
    console.error("Script Gen Error:", error);
    throw error;
  }
};


// --- Image Editing (Nano Banana) ---
export const editImageWithPrompt = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// --- Image Generation (Imagen) ---
export const generateImage = async (prompt: string, aspectRatio: string = '1:1'): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as any,
        outputMimeType: 'image/jpeg',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image generated.");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// --- Image Generation (Nano Banana) ---
export const generateImageNano = async (prompt: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated by Nano Banana model");
  } catch (error) {
    console.error("Nano Image Gen Error:", error);
    throw error;
  }
};

// --- Image Generation (Nano Banana Pro / Gemini 3 Pro) ---
// Used for High-Quality tasks and better text rendering within images
export const generateImageNanoPro = async (prompt: string, aspectRatio: string = '1:1', imageContext?: { data: string, mimeType: string }): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const parts: any[] = [{ text: prompt }];

    // If image context provided (e.g. profile photo for authority posts), add it
    if (imageContext) {
        parts.unshift({
            inlineData: {
                data: imageContext.data,
                mimeType: imageContext.mimeType
            }
        });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Nano Banana Pro
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated by Nano Banana Pro model");
  } catch (error) {
    console.error("Nano Pro Image Gen Error:", error);
    throw error;
  }
};

// --- Text to Speech ---
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned.");
    }
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// --- Video Generation (Veo) ---
export interface VideoGenerationParams {
  prompt: string;
  image?: {
    data: string; // base64
    mimeType: string;
  };
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export const generateVideo = async (params: VideoGenerationParams): Promise<string> => {
  try {
    const ai = getAIClient();

    const args: any = {
      model: 'veo-3.1-fast-generate-preview', // Using fast model for interactive experience
      prompt: params.prompt,
      config: {
        numberOfVideos: 1,
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
      }
    };

    if (params.image) {
      args.image = {
        imageBytes: params.image.data,
        mimeType: params.image.mimeType
      };
    }

    let operation = await ai.models.generateVideos(args);

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s interval
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned.");
    }

    // Fetch video bytes - Requires API Key in URL
    const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
// --- Animate Image with Grok AI (via Veo) ---
export const animateImageWithGrok = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
    // This is a semantic wrapper around generateVideo for the "Grok" feature requirement
    return generateVideo({
        prompt: prompt || "Animate this image cinematically, subtle motion, high quality",
        image: { data: imageBase64, mimeType },
        aspectRatio: '16:9',
        resolution: '720p'
    });
};