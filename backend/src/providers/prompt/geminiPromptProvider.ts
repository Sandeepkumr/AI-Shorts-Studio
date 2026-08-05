import { GoogleGenAI } from "@google/genai";

import { env } from "../../config/env.js";
import type { PromptEnhancement, PromptProvider } from "./promptProvider.js";

const systemInstruction = `You are an expert AI prompt engineer.

Expand the user's prompt into a highly descriptive cinematic prompt suitable for AI image generation.

Do not change the meaning.

Return only the enhanced prompt.`;

export class GeminiPromptProvider implements PromptProvider {
  async enhancePrompt(prompt: string): Promise<PromptEnhancement> {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const client = new GoogleGenAI({ apiKey: env.geminiApiKey });
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { systemInstruction },
    });
    const enhancedPrompt = response.text?.trim();

    if (!enhancedPrompt) {
      throw new Error("Gemini returned an empty prompt enhancement.");
    }

    return { enhancedPrompt };
  }
}
