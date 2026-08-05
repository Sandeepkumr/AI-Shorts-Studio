import { GeminiPromptProvider } from "./prompt/geminiPromptProvider.js";
import { MockPromptProvider } from "./prompt/mockPromptProvider.js";
import type { PromptProvider } from "./prompt/promptProvider.js";

type PromptProviderName = "mock" | "gemini";

export const PROVIDERS: { prompt: PromptProviderName } = {
  prompt: "gemini",
};

export const createPromptProvider = (): PromptProvider => {
  switch (PROVIDERS.prompt) {
    case "gemini":
      return new GeminiPromptProvider();
    case "mock":
      return new MockPromptProvider();
  }
};
