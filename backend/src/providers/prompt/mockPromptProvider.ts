import type { PromptEnhancement, PromptProvider } from "./promptProvider.js";

export class MockPromptProvider implements PromptProvider {
  async enhancePrompt(prompt: string): Promise<PromptEnhancement> {
    return {
      enhancedPrompt: `Mock enhanced prompt: cinematic, story-driven video about ${prompt}.`,
    };
  }
}
