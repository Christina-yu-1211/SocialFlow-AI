import { GoogleGenAI, Type } from "@google/genai";
import { SlideContent, GeminiResponse } from '../types';

// Initialize Gemini Client
export const generateSocialContent = async (
  promptText: string,
  pageCount: number
): Promise<GeminiResponse> => {
  // Always use process.env.API_KEY directly in the named parameter object
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a world-class Social Media Art Director and Gen Z Trend Specialist (2025 focus).
    Your mission: Transform long-form text into high-engagement IG Carousels that stop the scroll.

    STRATEGY FOR GEN Z ENGAGEMENT:
    1. **THE HOOK (Slide 1)**: Must use a "Curiosity Gap" or "Relatable Pain Point". 
       - Bad: "How to Pray". Good: "Why your prayers feel like they're hitting a ceiling (and how to fix it)".
       - Use "POV", "Trust me", or "Wait for the last slide" energy.
    2. **TONE**: Relatable, authentic, and slightly punchy. Avoid "preachy" or "corporate" language. Use emojis sparingly but effectively.
    3. **CONTENT CHUNKING**: One powerful idea per slide. If the original text is a sermon, find the "Micro-Epiphanies".
    4. **VISUAL TYPOGRAPHY**: Suggest fonts that match the vibe:
       - 'Anton' for bold statements.
       - 'Dela Gothic One' for "main character" energy.
       - 'Klee One' for personal, soft sharing.

    CRITICAL SUMMARY RULES:
    - DO NOT lose the original meaning, but REWRITE it for social media.
    - Transform long sentences into punchy bullet points or short statements.
    - Slide 1: Maximum 7 words.
    - Middle Slides: Maximum 25 words per slide.
    - Final Slide (CTA): Engagement-focused (e.g., "Tag a friend who needs this", "Save for later").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transform this text into ${pageCount} aesthetic slides:\n\n${promptText}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['cover', 'content', 'end'] },
                  title: { type: Type.STRING, description: "Hook headline" },
                  body: { type: Type.STRING, description: "Short body text" },
                  note: { type: Type.STRING, description: "Footer/Scripture ref" }
                },
                required: ['type', 'title', 'body', 'note']
              }
            },
            themeSuggestion: {
              type: Type.OBJECT,
              properties: {
                bgColor: { type: Type.STRING, description: "Background Hex" },
                titleColor: { type: Type.STRING, description: "Headline Hex (Make it POP)" },
                bodyColor: { type: Type.STRING, description: "Body Text Hex (Readable)" },
                fontFamily: { 
                  type: Type.STRING, 
                  enum: ['Noto Sans TC', 'Dela Gothic One', 'Anton', 'Shippori Mincho', 'Klee One', 'DotGothic16'] 
                },
                mood: { type: Type.STRING, description: "Design Vibe" }
              },
              required: ['bgColor', 'titleColor', 'bodyColor', 'fontFamily', 'mood']
            }
          },
          required: ['slides', 'themeSuggestion']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsedData = JSON.parse(jsonText);
    const rawSlides = parsedData.slides as Omit<SlideContent, 'id'>[];
    
    // Add IDs for React keys
    return {
      slides: rawSlides.map((slide, index) => ({
        ...slide,
        id: Date.now().toString() + index,
        type: index === 0 ? 'cover' : index === rawSlides.length - 1 ? 'end' : 'content'
      })),
      themeSuggestion: parsedData.themeSuggestion
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};