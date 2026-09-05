import type {
  StoryAnalysisOptions,
  StoryAnalysisResult,
} from "../providers/story/storyAnalysisProvider.js";

import { OpenAIStoryOptimizationProvider } from "../providers/story/storyOptimizationProvider.js";

export class StoryOptimizationService {
  constructor(
    private readonly provider =
      new OpenAIStoryOptimizationProvider(),
  ) {}

  async optimizeStory(
    story?: string,
    analysis?: StoryAnalysisResult,
    options?: StoryAnalysisOptions,
  ): Promise<StoryAnalysisResult> {
    const sourceStory =
      story?.trim();

    if (!sourceStory) {
      throw new Error(
        "Story is required.",
      );
    }

    if (!analysis) {
      throw new Error(
        "Story analysis is required.",
      );
    }

    if (
      !options?.requestedDurationSeconds
    ) {
      throw new Error(
        "requestedDurationSeconds is required.",
      );
    }

    if (!options.language) {
      throw new Error(
        "language is required.",
      );
    }

    return this.provider.optimizeStory(
      sourceStory,
      analysis,
      options,
    );
  }
}

export const storyOptimizationService =
  new StoryOptimizationService();