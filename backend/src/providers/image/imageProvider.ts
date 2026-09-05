export type ImageGenerationReference = {
  imageUrl: string;
};

export type ImageGenerationOptions = {
  prompt: string;
  referenceImages?: ImageGenerationReference[];
  aspectRatio?: string;
  imageSize?: "512px" | "1K" | "2K" | "4K";
  isSceneKeyframe?: boolean;
};

export type ImageGenerationResult = {
  images: string[];
};

export interface ImageProvider {
  generateImages(
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult>;
}