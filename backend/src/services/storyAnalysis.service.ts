import { OpenAIStoryAnalysisProvider } from "../providers/story/openaiStoryAnalysisProvider.js";

import type {
  StoryAnalysisOptions,
  StoryAnalysisProvider,
  StoryAnalysisResult,
} from "../providers/story/storyAnalysisProvider.js";

export class StoryAnalysisService {
  constructor(
    private readonly provider: StoryAnalysisProvider =
      new OpenAIStoryAnalysisProvider(),
  ) {}

  async analyzeStory(
    story?: string,
    options?: StoryAnalysisOptions,
  ): Promise<StoryAnalysisResult> {
    const sourceStory = story?.trim();

    if (!sourceStory) {
      throw new Error("Story is required.");
    }

    return this.provider.analyzeStory(
      sourceStory,
      options,
    );
  }
}

export const createStoryAnalysisService = (
  provider?: StoryAnalysisProvider,
) =>
  new StoryAnalysisService(provider);

export const storyAnalysisService =
  createStoryAnalysisService();