import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please provide API_KEY in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface ViralPostParams {
  style: string;
  platform: string;
  offerName: string;
  offerLink: string;
  offerDescription: string;
  targetAudience: string;
  ctaKeyword: string;
  topics: string[];
  hookType: string;
  language: string;
  contentUrl?: string; 
  imageContext?: {
    data: string;
    mimeType: string;
  };
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ViralSearchResponse {
  viral_hooks: string[];
  why_it_works: string[];
  repurposed_content: {
    facebook: string;
    instagram: string;
    tiktok: string;
    x: string;
    linkedin: string;
  };
  cta_variations: string[];
  image_prompt: string;
  sources?: GroundingSource[];
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
  image?: {
    data: string;
    mimeType: string;
  };
}

/**
 * AI-Powered Sustainable Business Launch System (SBL) Viral Post Generator
 * Optimized for the "GreenNova Threads" 1+8 Comment Ladder System + IG Carousel + X Thread.
 * STRICTLY following the 1+8 Framework requested by user.
 */
export const generateViralPost = async (params: ViralPostParams): Promise<string> => {
  const ai = getAIClient();
    
  let tools: any[] = [];
  if (params.contentUrl) {
      tools = [{ googleSearch: {} }];
  }

  const systemInstruction = `
You are the AI-Powered Sustainable Business Launch System (SBL) Content Architect.
Your mission is to perform a DEEP REPURPOSING of the provided Source into a high-converting "GreenNova Threads" suite.

STRICT FORMATTING RULES:

1. **MAIN POST**: 
   - Heading: "**MAIN POST**"
   - Length: MUST be between 120 and 130 characters (not including the 👇).
   - Requirement: MUST end with 👇.
   - Style: High curiosity, scroll-stopping, bold colored-background style.

2. **COMMENT LADDER**:
   - Heading: "**COMMENT LADDER**"
   - Structure: Exactly 8 Comments.
   - COMMENT 1: Context + Problem Setup. No CTA. Explain why most people fail vs smart people. End with: ✅ [benefit].
   - COMMENTS 2-7: Value + Natural Bridge. Structure:
     - Strategy #[Number]: [Name]
     - [Real details: numbers, metrics, tools, results]
     - [Natural bridge sentence leading to ${params.offerName}]
     - 👇 Say "${params.ctaKeyword}" to get the blueprint
     - ✅ [Checkmark benefit]
   - COMMENT 8: Final Offer. Structure:
     - 🎯 "Here's what happened..."
     - [Recap of results]
     - "My ${params.offerName} gives you:"
     - [4 bullet points starting with →]
     - 👇 Say "${params.ctaKeyword}" for the full blueprint
     - Get instant access: ${params.offerLink}
     - [Closing contrast line]

3. **VIRAL BLOG**: 
   - Heading: "**VIRAL BLOG**"
   - Line 1: BLOG TITLE IN ALL CAPITAL LETTERS.
   - Line 2: **SEO Meta Description:** [150-160 characters].
   - Line 3: **SEO Keywords:** [Keywords].
   - Body: 1,500 - 3,000 characters of repurposed content.

4. **LINKEDIN POST**:
   - Heading: "**LINKEDIN POST**"
   - Professional authority post based on the niche.

5. **INSTA CAROUSEL**:
   - Heading: "**INSTA CAROUSEL**"
   - Structure: 7 Slides. Hook, Problem, 3 Benefits (Viral Hooks, Automated Scripts, Monetization), Transformation, CTA.

6. **X THREAD**:
   - Heading: "**X THREAD**"
   - 5-7 tweets. Tweet 1 is hook. Last tweet is CTA: Say "${params.ctaKeyword}".

7. **13-OPTION POST MENU**:
   - Heading: "**13-OPTION POST MENU**"
   - Provide a 13-option post-selection menu for the user's next piece of content.

8. **PROMOS**:
   - Heading: "**PROMOS**"
   - Include: 
     1. ${params.offerName}: ${params.offerLink}
     2. Leave Your 9–5: [Insert generic high-converting link or context provided]

CASING: Only main section labels (e.g., "**COMMENT LADDER**") and the Blog Title should be in ALL CAPS.
`;

  const userPrompt = `
NICHE: ${params.topics.join(", ")}
HOOK TYPE: ${params.hookType}
OFFER: ${params.offerName}
OFFER LINK: ${params.offerLink}
AUDIENCE: ${params.targetAudience}
CTA KEYWORD: "${params.ctaKeyword}"
SOURCE: ${params.contentUrl || "N/A"}

Generate the full suite. Strictly follow the 1+8 Comment Ladder framework for the COMMENT LADDER section.
`;

  const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: userPrompt }] },
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
        temperature: 0.7,
      }
  });

  return response.text || "";
};

export const repurposeYouTubeVideo = async (url: string, offerContext?: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Provide a TRUE explanation and repurposing of this video: ${url} for the context: ${offerContext}` }] },
    config: { tools: [{ googleSearch: {} }] }
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Video Source",
    uri: chunk.web?.uri || ""
  })).filter((s: any) => s.uri) || [];

  return { text: response.text || "", sources };
};

export const findViralContent = async (query: string, platform: string): Promise<ViralSearchResponse> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Find viral patterns for ${query} on ${platform}.` }] },
    config: { 
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                viral_hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                why_it_works: { type: Type.ARRAY, items: { type: Type.STRING } },
                repurposed_content: {
                    type: Type.OBJECT,
                    properties: {
                        facebook: { type: Type.STRING },
                        instagram: { type: Type.STRING },
                        tiktok: { type: Type.STRING },
                        x: { type: Type.STRING },
                        linkedin: { type: Type.STRING },
                    }
                },
                cta_variations: { type: Type.ARRAY, items: { type: Type.STRING } },
                image_prompt: { type: Type.STRING }
            }
        },
        tools: [{ googleSearch: {} }]
    }
  });

  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Pattern Source",
    uri: chunk.web?.uri || ""
  })).filter((s: any) => s.uri) || [];

  const result = JSON.parse(response.text || "{}");
  return { ...result, sources };
};

export const transcribeAudio = async (data: string, mime: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data, mimeType: mime } }, { text: "Transcribe" }] }
  });
  return response.text || "";
};

export const generateSpeech = async (text: string, voice: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateBusinessRoadmap = async (type: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Roadmap for ${type}` });
  return response.text || "";
};

export const analyzeSubscription = async (data: any) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze: ${JSON.stringify(data)}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateVideoMeta = async (task: string, context: string, data?: any) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `${task} for ${context}` }];
  if (data) parts.push({ inlineData: data });
  const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: { parts } });
  return response.text || "";
};

export const generateImage = async (prompt: string, aspectRatio: string = '1:1') => {
  const ai = getAIClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: aspectRatio as any,
    },
  });
  return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
};

export const generateImageNano = async (prompt: string, imageContext?: {data: string, mimeType: string}) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: prompt }];
  if (imageContext) {
    parts.unshift({ inlineData: { data: imageContext.data, mimeType: imageContext.mimeType } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const generateImageNanoPro = async (prompt: string, aspectRatio: string = '1:1', imageContext?: {data: string, mimeType: string}) => {
  const ai = getAIClient();
  const parts: any[] = [{ text: prompt }];
  if (imageContext) {
    parts.unshift({ inlineData: { data: imageContext.data, mimeType: imageContext.mimeType } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: {
      imageConfig: { aspectRatio: aspectRatio as any }
    }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const editImageWithPrompt = async (data: string, mimeType: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: prompt }
      ]
    },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const generateVideo = async (params: VideoGenerationParams) => {
  const ai = getAIClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    image: params.image ? {
      imageBytes: params.image.data,
      mimeType: params.image.mimeType
    } : undefined,
    config: {
      numberOfVideos: 1,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateFaceFusion = async (images: {data: string, mimeType: string}[], prompt: string) => {
  const ai = getAIClient();
  const parts: any[] = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));
  parts.push({ text: `Analyze these people and fuse them into this scene: ${prompt}` });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const generateFaceFusionNano = async (images: {data: string, mimeType: string}[], prompt: string) => {
  const ai = getAIClient();
  const parts: any[] = images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } }));
  parts.push({ text: `Analyze these people and fuse them into this scene: ${prompt}` });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};

export const generateVideoFromImages = async (images: {data: string, mimeType: string}[], prompt: string) => {
    const ai = getAIClient();
    const referenceImages = images.slice(0, 3).map(img => ({
        image: {
            imageBytes: img.data,
            mimeType: img.mimeType
        },
        referenceType: "ASSET" as any
    }));

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            referenceImages: referenceImages as any,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
