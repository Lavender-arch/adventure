import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gemini Service using the latest @google/genai SDK for date inspiration and image processing.
 */

export const generateDateIdeas = async (interests: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use gemini-3-flash-preview for structured JSON output and text generation.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 9 fun and creative date activities for a couple visiting Nanjing, based on these interests: ${interests}. 
                 Each activity must include a title, a short description, and a matching FontAwesome icon name (e.g., 'fa-camera').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title of the activity" },
              description: { type: Type.STRING, description: "Detailed description of the activity" },
              icon: { type: Type.STRING, description: "FontAwesome class (e.g., fa-star)" },
            },
            required: ["title", "description", "icon"],
            propertyOrdering: ["title", "icon", "description"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error (generateDateIdeas):", error);
    return null;
  }
};

export const editLevelImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use gemini-2.5-flash-image for multimodal image editing.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error (editLevelImage):", error);
    return null;
  }
};
