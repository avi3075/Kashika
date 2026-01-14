import { GoogleGenAI } from "@google/genai";

interface MeshInfo {
  filename: string;
  dimensions: { width: number, height: number, depth: number };
  mode: string;
}

/**
 * Analyzes the mesh metadata using Gemini to generate a repair strategy.
 */
export async function analyzeWithGemini(info: MeshInfo): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Skipping Gemini analysis.");
    return "AI Analysis unavailable (API_KEY missing).";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      I am a pottery repair assistant. I have a 3D model file named "${info.filename}".
      Its dimensions are ${info.dimensions.width.toFixed(2)}x${info.dimensions.height.toFixed(2)}x${info.dimensions.depth.toFixed(2)} units.
      The user requested "${info.mode}" repair mode.
      
      Please generate a short, technical summary of what theoretical repairs you would apply to a clay pot 
      (e.g., filling holes, smoothing cracks, fixing non-manifold edges). 
      Keep it under 20 words.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Analysis complete.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis failed, proceeding with standard algorithms.";
  }
}

/**
 * Generates an image using Gemini 3 Pro Image Preview
 */
export async function generateImage(prompt: string, aspectRatio: string = "1:1") {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Per guidelines: "Use 'gemini-3-pro-image-preview' if the user requests high-quality images"
  // Feature request explicitly asked for this model and aspect ratios.
  const model = 'gemini-3-pro-image-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, // 1:1, 16:9 etc
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { 
          image: `data:image/png;base64,${part.inlineData.data}` 
        };
      }
    }
    throw new Error("No image generated");
  } catch (e) {
    console.error("Gemini Generate Image Error:", e);
    throw e;
  }
}

/**
 * Edits an image using Gemini 2.5 Flash Image
 */
export async function editImage(base64Data: string, mimeType: string, prompt: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Per guidelines: "gemini-2.5-flash-image" for editing
  const model = 'gemini-2.5-flash-image';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // The output might contain both text and image parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { 
          image: `data:image/png;base64,${part.inlineData.data}`,
          text: null
        };
      }
    }
    
    // If no image, maybe it returned text explaining why
    return {
      image: null,
      text: response.text
    };

  } catch (e) {
    console.error("Gemini Edit Image Error:", e);
    throw e;
  }
}