import { MockImageProvider } from "../providers/image/mockImageProvider.js";
import type {
  ImageGenerationResult,
  ImageProvider,
} from "../providers/image/imageProvider.js";

export type { ImageGenerationResult } from "../providers/image/imageProvider.js";

export class ImageService {
  constructor(private readonly provider: ImageProvider = new MockImageProvider()) {}

  async generateImages(prompt?: string): Promise<ImageGenerationResult> {
    return this.provider.generateImages(prompt?.trim() || "your video concept");
  }
}

export const createImageService = (provider?: ImageProvider) =>
  new ImageService(provider);

export const imageService = createImageService();
