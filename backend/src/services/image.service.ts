import { OpenAIImageProvider } from "../providers/image/openaiImageProvider.js";

import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  ImageProvider,
} from "../providers/image/imageProvider.js";

export type {
  ImageGenerationOptions,
  ImageGenerationResult,
} from "../providers/image/imageProvider.js";

export class ImageService {
  constructor(
    private readonly primaryProvider: ImageProvider =
      new OpenAIImageProvider(),
  ) {}

  async generateImages(
    input?:
      | string
      | ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    const options: ImageGenerationOptions =
      typeof input === "string"
        ? {
            prompt:
              input.trim() ||
              "your video concept",
          }
        : {
            prompt:
              input?.prompt?.trim() ||
              "your video concept",

            referenceImages:
              input?.referenceImages,

            aspectRatio:
              input?.aspectRatio,

            imageSize:
              input?.imageSize,

            isSceneKeyframe:
              input?.isSceneKeyframe,
          };

    console.log(
      "[ImageService] Using primary image provider: OpenAI",
    );

    console.log(
      "[ImageService] Prompt:",
      options.prompt,
    );

    console.log(
      "[ImageService] Reference image count:",
      options.referenceImages?.length ??
        0,
    );

    try {
      const result =
        await this.primaryProvider.generateImages(
          options,
        );

      console.log(
        "[ImageService] OpenAI image generation successful.",
      );

      return result;
    } catch (error) {
      console.error(
        "[ImageService] OpenAI image generation failed.",
        error,
      );

      /*
       * Do not silently fall back to Gemini or Replicate.
       *
       * Both providers are currently unavailable in the
       * demo environment:
       *
       * - Gemini image generation is returning quota 0 / 429.
       * - Replicate is returning insufficient credit / 402.
       *
       * Failing clearly here prevents multiple useless
       * paid-provider attempts and makes the real problem
       * visible immediately.
       */
      throw error;
    }
  }
}

export const createImageService = (
  primaryProvider?: ImageProvider,
) =>
  new ImageService(
    primaryProvider,
  );

export const imageService =
  createImageService();