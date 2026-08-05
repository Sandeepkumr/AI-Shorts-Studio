import { MockVideoProvider } from "../providers/video/mockVideoProvider.js";
import type {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "../providers/video/videoProvider.js";

export type {
  VideoGenerationOptions,
  VideoGenerationResult,
} from "../providers/video/videoProvider.js";

export class VideoService {
  constructor(private readonly provider: VideoProvider = new MockVideoProvider()) {}

  async generateVideo(
    options?: VideoGenerationOptions,
  ): Promise<VideoGenerationResult> {
    return this.provider.generateVideo(options);
  }
}

export const createVideoService = (provider?: VideoProvider) =>
  new VideoService(provider);

export const videoService = createVideoService();
