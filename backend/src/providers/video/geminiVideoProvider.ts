import {
  GoogleGenAI,
  VideoGenerationReferenceType,
} from "@google/genai";
import {
  mkdir,
  readFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";

import type {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "./videoProvider.js";

const DEFAULT_MODEL =
  process.env.GEMINI_VIDEO_MODEL ||
  "veo-3.1-lite-generate-preview";

const REFERENCE_IMAGE_MODEL =
  "veo-3.1-generate-preview";

const DEFAULT_RESOLUTION = "720p";

const DEFAULT_ASPECT_RATIO = "16:9";

const DEFAULT_DURATION_SECONDS = 8;

const VIDEO_UPLOAD_DIR = path.resolve(
  "uploads",
  "videos",
);

const UPLOAD_ROOT = path.resolve(
  "uploads",
);

const sleep = (ms: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );

const getGeminiResolution = (
  resolution?: VideoGenerationOptions["resolution"],
): "720p" | "1080p" | "4k" => {
  switch (resolution) {
    case "1080p":
      return "1080p";

    case "4k":
      return "4k";

    case "720p":
    default:
      return "720p";
  }
};

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

const getLocalUploadPath = (
  imageUrl: string,
): string | null => {
  try {
    const normalized =
      imageUrl.trim();

    if (!normalized) {
      return null;
    }

    let uploadPath = normalized;

    if (
      normalized.startsWith("http://") ||
      normalized.startsWith("https://")
    ) {
      uploadPath =
        new URL(normalized).pathname;
    }

    if (
      !uploadPath.startsWith(
        "/uploads/",
      ) &&
      uploadPath !== "/uploads"
    ) {
      return null;
    }

    const relativePath =
      uploadPath.replace(
        /^\/+uploads\/+?/,
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
      relativeToUploadRoot.startsWith(
        "..",
      ) ||
      path.isAbsolute(
        relativeToUploadRoot,
      )
    ) {
      return null;
    }

    return resolvedPath;
  } catch {
    return null;
  }
};

const loadReferenceImage = async (
  imageUrl: string,
) => {
  const localPath =
    getLocalUploadPath(
      imageUrl,
    );

  if (!localPath) {
    throw new Error(
      `Gemini reference image must point to a local /uploads file: ${imageUrl}`,
    );
  }

  const imageBuffer =
    await readFile(
      localPath,
    );

  return {
    image: {
      imageBytes:
        imageBuffer.toString(
          "base64",
        ),
      mimeType:
        getMimeType(localPath),
    },
    referenceType:
      VideoGenerationReferenceType.ASSET,
    sourceUrl: imageUrl,
    localPath,
  };
};

const getReferenceImageUrls = (
  options?: VideoGenerationOptions,
): string[] => {
  const urls = [
    options?.referenceImageUrl,
    ...(options?.characters ?? []).map(
      (character) =>
        character.imageUrl,
    ),
  ]
    .filter(
      (
        value,
      ): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    )
    .map(
      (value) =>
        value.trim(),
    );

  return Array.from(
    new Set(urls),
  ).slice(0, 3);
};

export class GeminiVideoProvider
  implements VideoProvider
{
  async generateVideo(
    options?: VideoGenerationOptions,
  ): Promise<VideoGenerationResult> {
    if (!env.geminiApiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured.",
      );
    }

    const prompt =
      options?.prompt?.trim() ||
      "Create a cinematic short video scene.";

    const requestedModel =
      options?.model?.trim() ||
      DEFAULT_MODEL;

    const resolution =
      getGeminiResolution(
        options?.resolution,
      );

    const aspectRatio =
      options?.aspectRatio ||
      DEFAULT_ASPECT_RATIO;

    const referenceImageUrls =
      getReferenceImageUrls(
        options,
      );

    const model =
      referenceImageUrls.length > 0 &&
      requestedModel.includes(
        "lite",
      )
        ? REFERENCE_IMAGE_MODEL
        : requestedModel;

    const ai = new GoogleGenAI({
      apiKey: env.geminiApiKey,
    });

    await mkdir(
      VIDEO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    console.log(
      "[GeminiVideoProvider] Starting video generation",
    );

    console.log(
      "[GeminiVideoProvider] Requested model:",
      requestedModel,
    );

    console.log(
      "[GeminiVideoProvider] Effective model:",
      model,
    );

    console.log(
      "[GeminiVideoProvider] Prompt:",
      prompt,
    );

    console.log(
      "[GeminiVideoProvider] Resolution:",
      resolution,
    );

    console.log(
      "[GeminiVideoProvider] Aspect ratio:",
      aspectRatio,
    );

    console.log(
      "[GeminiVideoProvider] Reference image URLs:",
      referenceImageUrls,
    );

    const referenceImages = [];

    for (
      const imageUrl of referenceImageUrls
    ) {
      const reference =
        await loadReferenceImage(
          imageUrl,
        );

      referenceImages.push(
        reference,
      );

      console.log(
        "[GeminiVideoProvider] Reference image loaded:",
        reference.sourceUrl,
      );

      console.log(
        "[GeminiVideoProvider] Reference image path:",
        reference.localPath,
      );
    }

    console.log(
      "[GeminiVideoProvider] Reference image count:",
      referenceImages.length,
    );

    let operation =
      await ai.models.generateVideos({
        model,
        source: {
          prompt,
        },
        config: {
          aspectRatio,
          resolution,
          ...(referenceImages.length >
          0
            ? {
                referenceImages:
                  referenceImages.map(
                    ({
                      image,
                      referenceType,
                    }) => ({
                      image,
                      referenceType,
                    }),
                  ),
              }
            : {}),
        },
      });

    console.log(
      "[GeminiVideoProvider] Initial operation:",
      JSON.stringify(
        operation,
        null,
        2,
      ),
    );

    while (!operation.done) {
      console.log(
        "[GeminiVideoProvider] Video is still generating...",
      );

      await sleep(10_000);

      operation =
        await ai.operations.getVideosOperation({
          operation,
        });
    }

    console.log(
      "[GeminiVideoProvider] Generation completed.",
    );

    console.log(
      "[GeminiVideoProvider] Operation done:",
      operation.done,
    );

    if (operation.error) {
      console.error(
        "[GeminiVideoProvider] Operation error:",
        JSON.stringify(
          operation.error,
          null,
          2,
        ),
      );

      throw new Error(
        `Gemini video generation failed: ${JSON.stringify(
          operation.error,
        )}`,
      );
    }

    console.log(
      "[GeminiVideoProvider] Response keys:",
      Object.keys(
        operation.response ?? {},
      ),
    );

    const generatedVideos =
      operation.response
        ?.generatedVideos ?? [];

    console.log(
      "[GeminiVideoProvider] Generated video count:",
      generatedVideos.length,
    );

    if (
      generatedVideos.length === 0
    ) {
      console.error(
        "[GeminiVideoProvider] Full completed operation:",
        JSON.stringify(
          operation,
          null,
          2,
        ),
      );

      throw new Error(
        "Gemini completed the operation but returned zero generated videos.",
      );
    }

    const generatedVideo =
      generatedVideos[0]?.video;

    if (!generatedVideo) {
      console.error(
        "[GeminiVideoProvider] First generated video object:",
        JSON.stringify(
          generatedVideos[0],
          null,
          2,
        ),
      );

      throw new Error(
        "Gemini returned a generated video entry without video data.",
      );
    }

    const fileName =
      `${randomUUID()}.mp4`;

    const downloadPath =
      path.join(
        VIDEO_UPLOAD_DIR,
        fileName,
      );

    console.log(
      "[GeminiVideoProvider] Downloading video:",
      downloadPath,
    );

    await ai.files.download({
      file: generatedVideo,
      downloadPath,
    });

    console.log(
      "[GeminiVideoProvider] Video saved successfully.",
    );

    return {
      video:
        `/uploads/videos/${fileName}`,

      durationSeconds:
        options?.durationSeconds ||
        DEFAULT_DURATION_SECONDS,

      model,

      sceneNumber:
        options?.sceneNumber,
    };
  }
}

export const createGeminiVideoProvider =
  () =>
    new GeminiVideoProvider();