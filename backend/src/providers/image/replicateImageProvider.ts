import Replicate from "replicate";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";

import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  ImageProvider,
} from "./imageProvider.js";

const CHARACTER_UPLOAD_DIR =
  path.resolve(
    "uploads",
    "characters",
  );

const REPLICATE_MODEL =
  "black-forest-labs/flux-1.1-pro";

/*
 * Free Replicate accounts can be heavily rate-limited
 * when creating predictions.
 *
 * Keep a conservative gap between prediction requests.
 * This queue is process-wide, so even multiple incoming
 * API requests cannot fire FLUX predictions together.
 */
const MIN_REQUEST_GAP_MS = 12_000;

const MAX_RETRIES = 3;

const sleep = (
  milliseconds: number,
) =>
  new Promise<void>((resolve) =>
    setTimeout(
      resolve,
      milliseconds,
    ),
  );

let nextPredictionAllowedAt = 0;

const waitForPredictionSlot =
  async (): Promise<void> => {
    const now = Date.now();

    const waitTime =
      Math.max(
        0,
        nextPredictionAllowedAt -
          now,
      );

    if (waitTime > 0) {
      console.log(
        `[ReplicateImageProvider] Waiting ${Math.ceil(
          waitTime / 1000,
        )}s before next prediction...`,
      );

      await sleep(waitTime);
    }

    /*
     * Reserve the next slot before making
     * the actual API request.
     */
    nextPredictionAllowedAt =
      Date.now() +
      MIN_REQUEST_GAP_MS;
  };

const getRetryAfterSeconds = (
  error: unknown,
): number | undefined => {
  const candidate =
    error as {
      response?: {
        headers?: Headers;
      };
    };

  const retryAfter =
    candidate.response?.headers?.get(
      "retry-after",
    );

  if (!retryAfter) {
    return undefined;
  }

  const seconds =
    Number(retryAfter);

  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return undefined;
  }

  return seconds;
};

const isRateLimitError = (
  error: unknown,
): boolean => {
  const candidate =
    error as {
      status?: number;
      response?: {
        status?: number;
      };
      message?: string;
    };

  if (
    candidate.status === 429 ||
    candidate.response?.status ===
      429
  ) {
    return true;
  }

  const message =
    typeof candidate.message ===
    "string"
      ? candidate.message.toLowerCase()
      : "";

  return (
    message.includes(
      "too many requests",
    ) ||
    message.includes(
      "rate limit",
    ) ||
    message.includes(
      "rate-limit",
    ) ||
    message.includes(
      "throttled",
    )
  );
};

export class ReplicateImageProvider
  implements ImageProvider
{
  private readonly client: Replicate;

  constructor() {
    if (!env.replicateApiToken) {
      throw new Error(
        "REPLICATE_API_TOKEN is not configured.",
      );
    }

    this.client =
      new Replicate({
        auth:
          env.replicateApiToken,
      });
  }

  async generateImages(
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    const cleanPrompt =
      options.prompt.trim();

    if (!cleanPrompt) {
      throw new Error(
        "Image prompt is required.",
      );
    }

    /*
     * FLUX fallback is currently used for
     * normal character/image generation.
     *
     * Reference images are intentionally not
     * forwarded here. Gemini is the provider
     * responsible for reference-aware scene
     * generation.
     */
    if (
      options.referenceImages &&
      options.referenceImages.length > 0
    ) {
      console.log(
        "[ReplicateImageProvider] Reference images were supplied, but this fallback provider does not use them.",
      );
    }

    await mkdir(
      CHARACTER_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    console.log(
      "[ReplicateImageProvider] Starting image generation",
    );

    console.log(
      "[ReplicateImageProvider] Model:",
      REPLICATE_MODEL,
    );

    console.log(
      "[ReplicateImageProvider] Prompt:",
      cleanPrompt,
    );

    let output:
      | unknown
      | undefined;

    let lastError:
      | unknown
      | undefined;

    for (
      let attempt = 1;
      attempt <= MAX_RETRIES;
      attempt += 1
    ) {
      try {
        /*
         * Global queue/rate-limit protection.
         */
        await waitForPredictionSlot();

        console.log(
          `[ReplicateImageProvider] Prediction attempt ${attempt}/${MAX_RETRIES}`,
        );

        output =
          await this.client.run(
            REPLICATE_MODEL,
            {
              input: {
                prompt:
                  cleanPrompt,

                aspect_ratio:
                  "1:1",

                output_format:
                  "png",

                output_quality:
                  90,

                safety_tolerance:
                  2,

                prompt_upsampling:
                  true,
              },
            },
          );

        break;
      } catch (error) {
        lastError = error;

        const rateLimited =
          isRateLimitError(
            error,
          );

        console.warn(
          `[ReplicateImageProvider] Prediction attempt ${attempt} failed.`,
        );

        console.warn(
          "[ReplicateImageProvider] Error:",
          error,
        );

        /*
         * Do not retry normal API/configuration
         * errors. Retry only rate-limit failures.
         */
        if (
          !rateLimited ||
          attempt >= MAX_RETRIES
        ) {
          throw error;
        }

        const serverRetryAfter =
          getRetryAfterSeconds(
            error,
          );

        /*
         * Use the provider's retry-after value
         * when available, but keep a safe minimum.
         */
        const retryDelaySeconds =
          Math.max(
            serverRetryAfter ??
              0,
            12,
          );

        console.warn(
          `[ReplicateImageProvider] Rate limited. Retrying in ${retryDelaySeconds}s...`,
        );

        await sleep(
          retryDelaySeconds *
            1000,
        );
      }
    }

    if (!output) {
      throw (
        lastError ??
        new Error(
          "Replicate did not return an image.",
        )
      );
    }

    /*
     * Current Replicate JS SDK returns FileOutput
     * objects for generated image files.
     */
    const fileOutput =
      Array.isArray(output)
        ? output[0]
        : output;

    if (!fileOutput) {
      throw new Error(
        "Replicate returned an empty image output.",
      );
    }

    const fileName =
      `${randomUUID()}.png`;

    const filePath =
      path.join(
        CHARACTER_UPLOAD_DIR,
        fileName,
      );

    /*
     * FileOutput can be written directly
     * by the current Replicate SDK.
     */
    await writeFile(
      filePath,
      fileOutput as any,
    );

    console.log(
      "[ReplicateImageProvider] Image saved successfully:",
      filePath,
    );

    let remoteUrl:
      | string
      | undefined;

    try {
      const possibleFile =
        fileOutput as {
          url?: () => string;
        };

      if (
        typeof possibleFile.url ===
        "function"
      ) {
        remoteUrl =
          possibleFile.url();
      }
    } catch {
      remoteUrl =
        undefined;
    }

    if (remoteUrl) {
      console.log(
        "[ReplicateImageProvider] Source URL:",
        remoteUrl,
      );
    }

    return {
      images: [
        `/uploads/characters/${fileName}`,
      ],
    };
  }
}

export const createReplicateImageProvider =
  () =>
    new ReplicateImageProvider();