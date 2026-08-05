export type ImageGenerationResult = {
  images: string[];
};

export interface ImageProvider {
  generateImages(prompt: string): Promise<ImageGenerationResult>;
}
