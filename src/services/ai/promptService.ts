export type PromptEnhancement = {
  originalPrompt: string;
  enhancedPrompt: string;
  keywords: string[];
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const promptService = {
  async enhancePrompt(prompt: string): Promise<PromptEnhancement> {
    await wait(180);

    const trimmedPrompt = prompt.trim();

    return {
      originalPrompt: trimmedPrompt,
      enhancedPrompt:
        trimmedPrompt ||
        "A cinematic, high-quality AI video concept with expressive lighting and intentional camera movement.",
      keywords: ["cinematic", "high-quality", "story-driven"],
    };
  },
};
