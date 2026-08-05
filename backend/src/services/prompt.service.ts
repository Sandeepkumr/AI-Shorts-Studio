import {
  MockPromptProvider,
} from "../providers/prompt/mockPromptProvider.js";
import { createPromptProvider } from "../providers/provider.config.js";
import type {
  PromptEnhancement,
  PromptProvider,
} from "../providers/prompt/promptProvider.js";

export type EnhancedPrompt = PromptEnhancement;

export class PromptService {
  constructor(
    private readonly provider: PromptProvider = createPromptProvider(),
    private readonly fallbackProvider: PromptProvider = new MockPromptProvider(),
  ) {}

  async enhancePrompt(prompt?: string): Promise<EnhancedPrompt> {
    const sourcePrompt = prompt?.trim() || "your video concept";

    try {
      return await this.provider.enhancePrompt(sourcePrompt);
    } catch (error) {
      console.error(
        "Prompt provider failed; falling back to MockPromptProvider.",
        error,
      );

      return this.fallbackProvider.enhancePrompt(sourcePrompt);
    }
  }
}

export const createPromptService = (provider?: PromptProvider) =>
  new PromptService(provider);

export const promptService = createPromptService();
