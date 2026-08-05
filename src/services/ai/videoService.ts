export type VideoGenerationOptions = {
  prompt: string;
  imageId: string;
  voiceId: string;
  aspectRatio?: string;
  duration?: string;
};

export type VideoGenerationResult = {
  id: string;
  status: "queued" | "generating" | "complete";
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const videoService = {
  async generateVideo(
    _options: VideoGenerationOptions,
  ): Promise<VideoGenerationResult> {
    await wait(900);

    return {
      id: "mock-video-001",
      status: "queued",
    };
  },
};
