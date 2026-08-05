export type PromptEnhancement = {
  enhancedPrompt: string;
};

export interface PromptProvider {
  enhancePrompt(prompt: string): Promise<PromptEnhancement>;
}
