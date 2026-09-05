import OpenAI, { toFile } from "openai";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";

import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  ImageProvider,
} from "./imageProvider.js";

const MODEL = "gpt-image-2";

const UPLOAD_ROOT = path.resolve("uploads");

const CHARACTER_UPLOAD_DIR = path.join(
  UPLOAD_ROOT,
  "characters",
);

const SCENE_UPLOAD_DIR = path.join(
  UPLOAD_ROOT,
  "scene-images",
);

/**
 * Continuation frames come from already-rendered video clips.
 * They are continuity context for VideoService, not character-identity
 * references and must never be sent to OpenAI as source identity images.
 */
const isContinuationFrameReference = (
  imageUrl: string,
): boolean =>
  /\/uploads\/video-frames\//i.test(imageUrl.trim());

const resolveLocalUploadPath = (
  imageUrl: string,
): string => {
  const trimmed = imageUrl.trim();

  if (!trimmed) {
    throw new Error("Reference image URL is required.");
  }

  let uploadPath = trimmed;

  /*
   * Accept both:
   *   /uploads/characters/a.png
   * and:
   *   http://192.168.x.x:4000/uploads/characters/a.png
   */
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    try {
      const parsed = new URL(trimmed);
      uploadPath = parsed.pathname;
    } catch {
      throw new Error(
        `Invalid reference image URL: ${imageUrl}`,
      );
    }
  }

  if (!uploadPath.startsWith("/uploads/")) {
    throw new Error(
      `OpenAI reference image must point to /uploads/: ${imageUrl}`,
    );
  }

  const relativePath = uploadPath.replace(
    /^\/uploads\//,
    "",
  );

  const resolvedPath = path.resolve(
    UPLOAD_ROOT,
    relativePath,
  );

  const relativeToUploadRoot = path.relative(
    UPLOAD_ROOT,
    resolvedPath,
  );

  if (
    relativeToUploadRoot.startsWith("..") ||
    path.isAbsolute(relativeToUploadRoot)
  ) {
    throw new Error(
      `Reference image resolved outside uploads directory: ${imageUrl}`,
    );
  }

  return resolvedPath;
};

const getMimeType = (
  filePath: string,
): string => {
  const extension = path
    .extname(filePath)
    .toLowerCase();

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

const getImageSize = (
  aspectRatio?: string,
): "1024x1024" | "1536x1024" | "1024x1536" => {
  switch (aspectRatio?.trim()) {
    case "16:9":
    case "3:2":
      return "1536x1024";
    case "9:16":
    case "2:3":
      return "1024x1536";
    case "1:1":
    default:
      return "1024x1024";
  }
};

const loadReferenceFile = async (
  imageUrl: string,
) => {
  const localPath = resolveLocalUploadPath(imageUrl);
  const imageBuffer = await readFile(localPath);
  const mimeType = getMimeType(localPath);

  const file = await toFile(
    imageBuffer,
    path.basename(localPath),
    { type: mimeType },
  );

  return {
    file,
    localPath,
    sourceUrl: imageUrl,
  };
};

const extractBase64Image = (
  data: unknown,
): string | undefined => {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return undefined;
  }

  const candidate = data as {
    b64_json?: unknown;
  };

  return typeof candidate.b64_json === "string"
    ? candidate.b64_json
    : undefined;
};

export class OpenAIImageProvider implements ImageProvider {
  private readonly client: OpenAI;

  constructor() {
    if (!env.openaiApiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured.",
      );
    }

    this.client = new OpenAI({
      apiKey: env.openaiApiKey,
    });
  }

  async generateImages(
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    const prompt = options.prompt.trim();

    if (!prompt) {
      throw new Error("Image prompt is required.");
    }

    const incomingReferences = (
      options.referenceImages ?? []
    )
      .map((reference) => reference.imageUrl.trim())
      .filter(Boolean);

    /*
     * IMPORTANT T2V ARCHITECTURE RULE
     *
     * VideoService may provide the previous clip's extracted frame to
     * createSceneKeyframe() as continuity context. That frame is located
     * under /uploads/video-frames/ and MUST NOT be treated as an identity
     * source image for the new keyframe.
     *
     * Only actual character reference images are allowed into the OpenAI
     * image-edit source list.
     */
    const continuationReferences = incomingReferences.filter(
      isContinuationFrameReference,
    );

    const characterReferences = incomingReferences.filter(
      (reference) => !isContinuationFrameReference(reference),
    );

    if (continuationReferences.length > 0) {
      console.log(
        "[OpenAIImageProvider] Ignoring previous video-frame references as source images:",
        continuationReferences,
      );
    }

    if (characterReferences.length > 4) {
      throw new Error(
        `OpenAI scene generation currently receives at most 4 character references. Received ${characterReferences.length}.`,
      );
    }

    /*
     * If any reference was supplied by VideoService, this is scene-keyframe
     * work. This remains true even when the only supplied reference was a
     * previous video frame that we intentionally filtered out above.
     *
     * This keeps fresh T2V scene images out of /uploads/characters without
     * changing the behavior of normal character-image generation calls that
     * have no references at all.
     */
    const isSceneGeneration =
      options.isSceneKeyframe === true ||
      incomingReferences.length > 0;

    const outputDirectory = isSceneGeneration
      ? SCENE_UPLOAD_DIR
      : CHARACTER_UPLOAD_DIR;

    await mkdir(outputDirectory, {
      recursive: true,
    });

    console.log(
      "[OpenAIImageProvider] Starting image generation.",
    );

    console.log(
      "[OpenAIImageProvider] Model:",
      MODEL,
    );

    console.log(
      "[OpenAIImageProvider] Incoming reference count:",
      incomingReferences.length,
    );

    console.log(
      "[OpenAIImageProvider] Character reference count:",
      characterReferences.length,
    );

    console.log(
      "[OpenAIImageProvider] Continuation-frame reference count ignored:",
      continuationReferences.length,
    );

    console.log(
      "[OpenAIImageProvider] Output directory:",
      outputDirectory,
    );

    console.log(
      "[OpenAIImageProvider] Prompt:",
      prompt,
    );

    const size = getImageSize(
      options.aspectRatio,
    );

    /*
     * FRESH SCENE GENERATION WITHOUT CHARACTER REFERENCES
     *
     * This is the normal T2V path for AI-generated characters that do not
     * have separate saved reference images. It intentionally uses the normal
     * image-generation endpoint. The prompt itself contains the authoritative
     * scene state and character descriptions.
     */
    if (characterReferences.length === 0) {
      const response =
        await this.client.images.generate({
          model: MODEL,
          prompt,
          size,
          n: 1,
        });

      const imageData = extractBase64Image(
        response.data?.[0],
      );

      if (!imageData) {
        throw new Error(
          "OpenAI did not return an image.",
        );
      }

      const fileName = `${randomUUID()}.png`;
      const filePath = path.join(
        outputDirectory,
        fileName,
      );

      await writeFile(
        filePath,
        Buffer.from(imageData, "base64"),
      );

      const resultUrl = isSceneGeneration
        ? `/uploads/scene-images/${fileName}`
        : `/uploads/characters/${fileName}`;

      console.log(
        "[OpenAIImageProvider] Fresh image saved successfully:",
        resultUrl,
      );

      return {
        images: [resultUrl],
      };
    }

    /*
     * FRESH SCENE GENERATION WITH CHARACTER REFERENCES
     *
     * Only actual character reference images reach the OpenAI edit endpoint.
     * A previous video frame can never become an identity/source image here.
     */
    const loadedReferences = [];

    for (const referenceUrl of characterReferences) {
      const loaded = await loadReferenceFile(
        referenceUrl,
      );

      loadedReferences.push(loaded);

      console.log(
        "[OpenAIImageProvider] Character reference loaded:",
        loaded.sourceUrl,
      );

      console.log(
        "[OpenAIImageProvider] Local path:",
        loaded.localPath,
      );
    }

    const scenePrompt = [
      prompt,
      "",
      "IMPORTANT SCENE COMPOSITION RULES:",
      "Create ONE finished cinematic scene image.",
      "This must be a normal full-scene composition.",
      "Do NOT create a character sheet.",
      "Do NOT create a collage.",
      "Do NOT create a split screen.",
      "Do NOT create multiple panels.",
      "Do NOT show reference images as cards.",
      "Do NOT show labels or borders.",
      "Do NOT copy neutral backgrounds from the character references.",
      "Place all referenced characters naturally inside the same physical scene.",
      "Use the supplied character images as identity references, not as visible scene content.",
      "Preserve each referenced character's recognizable identity, face, hair, clothing, colors, proportions, age, and species.",
      "Respect the requested scene, environment, pose, action, perspective, lighting, and spatial relationships.",
      "Do not add extra people, duplicate characters, unrelated animals, text, logos, or UI elements.",
    ].join("\n");

    const editResponse =
      await this.client.images.edit({
        model: MODEL,
        prompt: scenePrompt,
        image: loadedReferences.map(
          ({ file }) => file,
        ),
        size,
        n: 1,
      } as any);

    const imageData = extractBase64Image(
      editResponse.data?.[0],
    );

    if (!imageData) {
      console.error(
        "[OpenAIImageProvider] OpenAI image response:",
        JSON.stringify(
          editResponse,
          null,
          2,
        ),
      );

      throw new Error(
        "OpenAI scene generation completed without returning an image.",
      );
    }

    const fileName = `${randomUUID()}.png`;
    const filePath = path.join(
      outputDirectory,
      fileName,
    );

    await writeFile(
      filePath,
      Buffer.from(imageData, "base64"),
    );

    const resultUrl = `/uploads/scene-images/${fileName}`;

    console.log(
      "[OpenAIImageProvider] Fresh scene image saved successfully:",
      resultUrl,
    );

    return {
      images: [resultUrl],
    };
  }
}

export const createOpenAIImageProvider = () =>
  new OpenAIImageProvider();
