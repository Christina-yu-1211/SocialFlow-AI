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
    You are a world-class Social Media Art Director targeting Gen Z (2025 trends).
    Your goal is to design Instagram Carousels that stop the scroll on the "Explore Page".
    
    CRITICAL DESIGN RULES (DO NOT IGNORE):
    1. **NO BORING COLORS**: NEVER use generic corporate blue (#3b82f6) or plain gray.
    2. **HIGH CONTRAST IS KING**: 
       - If the background is dark, the Title MUST be a "Pop Color" (Neon Yellow #FDE047, Hot Pink #F472B6, Electric Blue #22D3EE).
       - If the background is light, use Deep Charcoal (#1C1917) or Deep Navy, never pure black.
    3. **FONT PERSONALITY**: 
       - For powerful quotes: Use 'Dela Gothic One' or 'Anton'.
       - For emotional/devotional: Use 'Shippori Mincho'.
       - For friendly notes: Use 'Klee One'.
       - AVOID 'Noto Sans TC' unless it's for very neutral content.
    
    CONTENT STRUCTURE:
    - **Slide 1 (The Hook)**: Short, punchy, 5-7 words max. Use a "Curiosity Gap".
    - **Middle Slides**: One clear idea per slide.
    - **End Slide**: A clear Call to Action (CTA).
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