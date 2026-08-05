import type { ImageGenerationResult, ImageProvider } from "./imageProvider.js";

export class MockImageProvider implements ImageProvider {
  async generateImages(_prompt: string): Promise<ImageGenerationResult> {
    return {
      images: ["mock-image-01.jpg", "mock-image-02.jpg"],
    };
  }
}
