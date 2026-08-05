import type {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "./videoProvider.js";

export class MockVideoProvider implements VideoProvider {
  async generateVideo(
    _options?: VideoGenerationOptions,
  ): Promise<VideoGenerationResult> {
    return {
      video: "mock.mp4",
    };
  }
}
