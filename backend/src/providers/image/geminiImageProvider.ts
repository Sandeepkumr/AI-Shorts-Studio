import { GoogleGenAI } from "@google/genai";
import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";

import type {
  ImageGenerationOptions,
  ImageGenerationReference,
  ImageGenerationResult,
  ImageProvider,
} from "./imageProvider.js";

const MODEL = "gemini-3.1-flash-image";

const UPLOAD_ROOT = path.resolve("uploads");

const CHARACTER_UPLOAD_DIR = path.join(
  UPLOAD_ROOT,
  "characters",
);

const SCENE_UPLOAD_DIR = path.join(
  UPLOAD_ROOT,
  "scene-images",
);

const getMimeType = (
  filePath: string,
): string => {
  const extension =
    path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";

    case ".webp":
      return "image/webp";

    case ".png":
    default:
      return "image/png";
  }
};

const resolveLocalUploadPath = (
  imageUrl: string,
): string => {
  const trimmed =
    imageUrl.trim();

  if (!trimmed) {
    throw new Error(
      "Reference image URL is required.",
    );
  }

  let uploadPath = trimmed;

  try {
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      uploadPath =
        new URL(trimmed).pathname;
    }
  } catch {
    throw new Error(
      `Invalid reference image URL: ${imageUrl}`,
    );
  }

  if (
    !uploadPath.startsWith("/uploads/")
  ) {
    throw new Error(
      `Gemini reference image must point to a local /uploads file: ${imageUrl}`,
    );
  }

  const relativePath =
    uploadPath.replace(
      /^\/uploads\//,
      "",
    );

  const resolvedPath =
    path.resolve(
      UPLOAD_ROOT,
      relativePath,
    );

  const relativeToUploadRoot =
    path.relative(
      UPLOAD_ROOT,
      resolvedPath,
    );

  if (
    relativeToUploadRoot.startsWith("..") ||
    path.isAbsolute(
      relativeToUploadRoot,
    )
  ) {
    throw new Error(
      `Reference image resolved outside uploads directory: ${imageUrl}`,
    );
  }

  return resolvedPath;
};

const loadReferenceImage = async (
  reference:
    | ImageGenerationReference
    | string,
) => {
  const imageUrl =
    typeof reference === "string"
      ? reference
      : reference.imageUrl;

  const localPath =
    resolveLocalUploadPath(
      imageUrl,
    );

  const imageBuffer =
    await readFile(localPath);

  return {
    image: {
      data:
        imageBuffer.toString(
          "base64",
        ),
      mime_type:
        getMimeType(localPath),
    },
    sourceUrl: imageUrl,
    localPath,
  };
};

const getOutputDirectory = (
  options: ImageGenerationOptions,
): string => {
  const hasReferences =
    (options.referenceImages?.length ??
      0) > 0;

  return hasReferences
    ? SCENE_UPLOAD_DIR
    : CHARACTER_UPLOAD_DIR;
};

const sanitizeAspectRatio = (
  aspectRatio?: string,
): string => {
  const value =
    aspectRatio?.trim();

  if (!value) {
    return "9:16";
  }

  const supported =
    new Set([
      "1:1",
      "2:3",
      "3:2",
      "3:4",
      "4:3",
      "4:5",
      "5:4",
      "9:16",
      "16:9",
      "21:9",
    ]);

  return supported.has(value)
    ? value
    : "9:16";
};

const sanitizeImageSize = (
  imageSize?: ImageGenerationOptions["imageSize"],
): "512px" | "1K" | "2K" | "4K" => {
  switch (imageSize) {
    case "512px":
      return "512px";

    case "2K":
      return "2K";

    case "4K":
      return "4K";

    case "1K":
    default:
      return "1K";
  }
};

export class GeminiImageProvider
  implements ImageProvider
{
  async generateImages(
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    if (!env.geminiApiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured.",
      );
    }

    const cleanPrompt =
      options.prompt.trim();

    if (!cleanPrompt) {
      throw new Error(
        "Image prompt is required.",
      );
    }

    const referenceImages =
      options.referenceImages ?? [];

    /*
     * Gemini 3.1 Flash Image supports
     * multiple reference images. For
     * character consistency, keep the
     * hard limit at four character refs.
     */
    if (
      referenceImages.length > 4
    ) {
      throw new Error(
        `Gemini scene generation supports at most 4 character reference images. Received ${referenceImages.length}.`,
      );
    }

    const outputDirectory =
      getOutputDirectory(options);

    await mkdir(
      outputDirectory,
      {
        recursive: true,
      },
    );

    const client =
      new GoogleGenAI({
        apiKey:
          env.geminiApiKey,
      });

    console.log(
      "[GeminiImageProvider] Starting image generation.",
    );

    console.log(
      "[GeminiImageProvider] Model:",
      MODEL,
    );

    console.log(
      "[GeminiImageProvider] Reference image count:",
      referenceImages.length,
    );

    const input: Array<
      | {
          type: "text";
          text: string;
        }
      | {
          type: "image";
          mime_type: string;
          data: string;
        }
    > = [];

    /*
     * Text first makes the task explicit.
     */
    input.push({
      type: "text",
      text: cleanPrompt,
    });

    for (
      const reference of referenceImages
    ) {
      const loaded =
        await loadReferenceImage(
          reference,
        );

      console.log(
        "[GeminiImageProvider] Reference image loaded:",
        loaded.sourceUrl,
      );

      console.log(
        "[GeminiImageProvider] Reference image path:",
        loaded.localPath,
      );

      input.push({
        type: "image",
        mime_type:
          loaded.image.mime_type,
        data:
          loaded.image.data,
      });
    }

    /*
     * Use the current multimodal
     * Gemini image-generation API.
     */
    const interaction =
      await client.interactions.create(
        {
          model: MODEL,
          input,
          response_format: {
            type: "image",
            aspect_ratio:
              sanitizeAspectRatio(
                options.aspectRatio,
              ),
            image_size:
              sanitizeImageSize(
                options.imageSize,
              ),
          },
        },
      );

    const outputImage =
      interaction.output_image;

    if (!outputImage?.data) {
      console.error(
        "[GeminiImageProvider] Gemini interaction response:",
        JSON.stringify(
          interaction,
          null,
          2,
        ),
      );

      throw new Error(
        "Gemini image generation completed without returning an image.",
      );
    }

    const mimeType =
      outputImage.mime_type ||
      "image/png";

    const extension =
      mimeType.includes("jpeg") ||
      mimeType.includes("jpg")
        ? "jpg"
        : "png";

    const fileName =
      `${randomUUID()}.${extension}`;

    const filePath =
      path.join(
        outputDirectory,
        fileName,
      );

    await writeFile(
      filePath,
      Buffer.from(
        outputImage.data,
        "base64",
      ),
    );

    const uploadPrefix =
      outputDirectory ===
      SCENE_UPLOAD_DIR
        ? "scene-images"
        : "characters";

    const resultUrl =
      `/uploads/${uploadPrefix}/${fileName}`;

    console.log(
      "[GeminiImageProvider] Image saved successfully:",
      resultUrl,
    );

    return {
      images: [
        resultUrl,
      ],
    };
  }
}

export const createGeminiImageProvider =
  () =>
    new GeminiImageProvider();