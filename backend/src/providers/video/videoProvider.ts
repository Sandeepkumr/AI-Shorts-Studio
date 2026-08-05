export type VideoGenerationOptions = Record<string, unknown> | undefined;

export type VideoGenerationResult = {
  video: string;
};

export interface VideoProvider {
  generateVideo(options?: VideoGenerationOptions): Promise<VideoGenerationResult>;
}
