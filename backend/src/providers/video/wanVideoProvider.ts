import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { env } from "../../config/env.js";
import type {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "./videoProvider.js";

const WAN_I2V_API_BASE =
  "https://8scale.run/wan-2.2/14b/image-to-video";

const DEFAULT_MODEL =
  "wan-2.2-14b-image-to-video";

const DEFAULT_RESOLUTION = "480p";

const DEFAULT_ASPECT_RATIO = "9:16";

const CLIP_DURATION_SECONDS = 5;

const VIDEO_UPLOAD_DIR =
  path.resolve(
    "uploads",
    "videos",
  );

const PUBLIC_API_BASE_URL =
  process.env.PUBLIC_API_BASE_URL?.trim() ||
  "";

const sleep = (ms: number) =>
  new Promise<void>((resolve) =>
    setTimeout(
      resolve,
      ms,
    ),
  );


type WanSubmitResponse = {
  requestId?: string;
  request_id?: string;
  id?: string;
};

type WanStatusResponse = {
  status?:
    | "IN_QUEUE"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

  video?: string;
  url?: string;
  video_url?: string;

  output?:
    | string
    | {
        url?: string;
      };

  error?: string;
  message?: string;
};

const isPrivateOrLocalHostname = (
  hostname: string,
): boolean => {
  const normalized =
    hostname.trim().toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized === "::1"
  ) {
    return true;
  }

  const parts =
    normalized.split(".").map(Number);

  if (
    parts.length === 4 &&
    parts.every((part) =>
      Number.isInteger(part) &&
      part >= 0 &&
      part <= 255,
    )
  ) {
    const [a, b, c] = parts;

    return (
      a === 10 ||
      (a === 172 &&
        b >= 16 &&
        b <= 31) ||
      (a === 192 &&
        b === 168) ||
      (a === 169 &&
        b === 254)
    );
  }

  return false;
};

const execFileAsync =
  promisify(execFile);

const I2V_REFERENCE_HOLD_SECONDS = 1.2;

const ffprobeDurationSeconds = async (
  inputPath: string,
): Promise<number> => {
  const { stdout } =
    await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        inputPath,
      ],
      {
        maxBuffer:
          5 * 1024 * 1024,
      },
    );

  const duration = Number(
    stdout.trim(),
  );

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(
      `Unable to determine Wan clip duration for ${inputPath}. ffprobe returned: ${stdout.trim()}`,
    );
  }

  return duration;
};

const cleanWanI2VClip = async (
  inputPath: string,
  outputPath: string,
): Promise<void> => {
  const rawDurationSeconds =
    await ffprobeDurationSeconds(
      inputPath,
    );

  const motionDurationSeconds =
    rawDurationSeconds -
    I2V_REFERENCE_HOLD_SECONDS;

  if (
    motionDurationSeconds <= 0.1
  ) {
    throw new Error(
      `Wan I2V output is too short after removing the ${I2V_REFERENCE_HOLD_SECONDS}s reference lead-in. Raw duration: ${rawDurationSeconds.toFixed(3)}s.`,
    );
  }

  const ptsMultiplier =
    CLIP_DURATION_SECONDS /
    motionDurationSeconds;

  console.log(
    "[WanVideoProvider] Raw I2V duration:",
    `${rawDurationSeconds.toFixed(3)}s`,
  );

  console.log(
    "[WanVideoProvider] Motion duration after lead-in:",
    `${motionDurationSeconds.toFixed(3)}s`,
  );

  console.log(
    "[WanVideoProvider] Duration normalization multiplier:",
    ptsMultiplier.toFixed(6),
  );

  /*
   * Wan I2V can hold the supplied reference at the beginning.
   * Remove that lead-in, then time-stretch the remaining motion
   * so the cleaned clip occupies the full five-second clip budget.
   *
   * Important:
   * Do NOT use an input-side/output-side `-t` equal to the original
   * motion duration here. That would cap the muxed output before the
   * PTS stretch can expand it back to five seconds.
   */
  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-ss",
      String(
        I2V_REFERENCE_HOLD_SECONDS,
      ),
      "-i",
      inputPath,
      "-vf",
      `setpts=(PTS-STARTPTS)*${ptsMultiplier.toFixed(6)}`,
      "-t",
      String(
        CLIP_DURATION_SECONDS,
      ),
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    {
      maxBuffer:
        20 * 1024 * 1024,
    },
  );

  const cleanedDurationSeconds =
    await ffprobeDurationSeconds(
      outputPath,
    );

  console.log(
    "[WanVideoProvider] Normalized clip duration:",
    `${cleanedDurationSeconds.toFixed(3)}s`,
  );

  if (
    Math.abs(
      cleanedDurationSeconds -
        CLIP_DURATION_SECONDS,
    ) > 0.1
  ) {
    throw new Error(
      `Wan I2V duration normalization failed: expected ${CLIP_DURATION_SECONDS.toFixed(2)}s but produced ${cleanedDurationSeconds.toFixed(3)}s.`,
    );
  }
};

const resolveImageUrl = (
  imageUrl: string,
): string => {
  const trimmed =
    imageUrl.trim();

  if (!trimmed) {
    throw new Error(
      "Wan I2V requires a reference image URL.",
    );
  }

  const publicBase =
    PUBLIC_API_BASE_URL.replace(
      /\/+$/,
      "",
    );

  /*
   * The VideoService currently produces absolute local/LAN
   * URLs such as:
   *   http://192.168.31.189:4000/uploads/characters/vamika.png
   *
   * A previous version returned those URLs unchanged because
   * they were already absolute. That caused 8Scale to time out.
   *
   * When PUBLIC_API_BASE_URL is configured, rewrite any local/LAN
   * reference to the public tunnel while preserving the path.
   */
  if (
    publicBase
  ) {
    try {
      const parsed =
        new URL(trimmed);

      if (
        isPrivateOrLocalHostname(
          parsed.hostname,
        )
      ) {
        const resolved =
          `${publicBase}${parsed.pathname}${parsed.search}`;

        console.log(
          "[WanVideoProvider] Rewrote local reference image URL:",
          resolved,
        );

        return resolved;
      }

      if (
        parsed.protocol ===
          "https:" ||
        parsed.protocol ===
          "http:"
      ) {
        return trimmed;
      }
    } catch {
      /*
       * Fall through to relative-path handling below.
       */
    }
  }

  /*
   * Relative path:
   *   /uploads/characters/vamika.png
   */
  if (
    !trimmed.startsWith(
      "http://",
    ) &&
    !trimmed.startsWith(
      "https://",
    )
  ) {
    if (!publicBase) {
      throw new Error(
        "Reference image URL is relative, but PUBLIC_API_BASE_URL is not configured. Set PUBLIC_API_BASE_URL to an address that 8Scale can reach.",
      );
    }

    const relative =
      trimmed.startsWith("/")
        ? trimmed
        : `/${trimmed}`;

    const resolved =
      `${publicBase}${relative}`;

    console.log(
      "[WanVideoProvider] Resolved relative reference image URL:",
      resolved,
    );

    return resolved;
  }

  return trimmed;
};

export class WanVideoProvider
  implements VideoProvider
{
  async generateVideo(
    options?: VideoGenerationOptions,
  ): Promise<VideoGenerationResult> {
    const apiKey =
      env.scale8ApiKey?.trim();

    if (!apiKey) {
      throw new Error(
        "SCALE8_API_KEY is not configured.",
      );
    }

    const referenceImageUrl =
      options?.referenceImageUrl?.trim();

    if (!referenceImageUrl) {
      throw new Error(
        "Wan I2V requires referenceImageUrl. No reference image was provided.",
      );
    }

    const imageUrl =
      resolveImageUrl(
        referenceImageUrl,
      );

    const rawPrompt =
      options?.prompt?.trim() ||
      "Create a cinematic short video scene using the provided reference image. Preserve the subject's identity and visual appearance.";

    const prompt = [
      rawPrompt,
      "Start motion immediately. The source image is a continuity anchor, not a poster or intro card.",
      "Preserve the supplied characters and scene layout; animate only the requested action.",
      "No extra people, duplicate characters, motorcyclists, unrelated vehicles, text, logos, or unrelated scenes.",
    ].join("\n\n");

    const safePrompt =
      prompt.length <= 2000
        ? prompt
        : `${prompt.slice(0, 1990).trimEnd()}...`;

    const resolution =
      options?.resolution ===
        "580p"
        ? "580p"
        : options?.resolution ===
            "720p"
          ? "720p"
          : DEFAULT_RESOLUTION;

    const aspectRatio =
      options?.aspectRatio ||
      DEFAULT_ASPECT_RATIO;

    await mkdir(
      VIDEO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    console.log(
      "[WanVideoProvider] Starting 5-second IMAGE-TO-VIDEO clip generation",
    );

    console.log(
      "[WanVideoProvider] Model:",
      DEFAULT_MODEL,
    );

    console.log(
      "[WanVideoProvider] Prompt:",
      prompt,
    );

    console.log(
      "[WanVideoProvider] Reference image:",
      imageUrl,
    );

    console.log(
      "[WanVideoProvider] Public API base URL:",
      PUBLIC_API_BASE_URL ||
        "(not configured)",
    );

    console.log(
      "[WanVideoProvider] Resolution:",
      resolution,
    );

    console.log(
      "[WanVideoProvider] Aspect ratio:",
      aspectRatio,
    );

    console.log(
      "[WanVideoProvider] Duration:",
      CLIP_DURATION_SECONDS,
    );

    const submitResponse =
      await fetch(
        WAN_I2V_API_BASE,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            prompt:
              safePrompt,

            negative_prompt:
              "blurry, low quality, distorted, deformed, disfigured, bad anatomy, watermark, text, oversaturated",

            resolution,

            aspect_ratio:
              aspectRatio,

            seconds:
              CLIP_DURATION_SECONDS,

            image:
              imageUrl,
          }),
        },
      );

    const submitText =
      await submitResponse.text();

    if (!submitResponse.ok) {
      throw new Error(
        `Wan I2V API request failed (${submitResponse.status}): ${submitText}`,
      );
    }

    let submitData:
      WanSubmitResponse;

    try {
      submitData =
        JSON.parse(
          submitText,
        ) as WanSubmitResponse;
    } catch {
      throw new Error(
        `Wan I2V API returned invalid JSON: ${submitText}`,
      );
    }

    const requestId =
      submitData.requestId ||
      submitData.request_id ||
      submitData.id;

    if (!requestId) {
      throw new Error(
        `Wan I2V API did not return a request ID: ${submitText}`,
      );
    }

    console.log(
      "[WanVideoProvider] Request ID:",
      requestId,
    );

    let statusData:
      WanStatusResponse = {};

    for (;;) {
      await sleep(5000);

      const statusResponse =
        await fetch(
          `https://8scale.run/status/${encodeURIComponent(
            requestId,
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${apiKey}`,
            },
          },
        );

      const statusText =
        await statusResponse.text();

      if (!statusResponse.ok) {
        throw new Error(
          `Wan status request failed (${statusResponse.status}): ${statusText}`,
        );
      }

      try {
        statusData =
          JSON.parse(
            statusText,
          ) as WanStatusResponse;
      } catch {
        throw new Error(
          `Wan status returned invalid JSON: ${statusText}`,
        );
      }

      console.log(
        "[WanVideoProvider] Status:",
        statusData.status,
      );

      console.log(
        "[WanVideoProvider] Status response:",
        JSON.stringify(
          statusData,
          null,
          2,
        ),
      );

      if (
        statusData.status ===
          "FAILED" ||
        statusData.status ===
          "CANCELLED"
      ) {
        console.error(
          "[WanVideoProvider] FULL FAILURE RESPONSE:",
          JSON.stringify(
            statusData,
            null,
            2,
          ),
        );

        console.error(
          "[WanVideoProvider] Failure status:",
          statusData.status,
        );

        console.error(
          "[WanVideoProvider] Failure error:",
          statusData.error,
        );

        console.error(
          "[WanVideoProvider] Failure message:",
          statusData.message,
        );

        /*
         * Wan can return the real execution error in the
         * `output` URL when status=FAILED. In this case the
         * URL may point to a text/log object such as out.txt.
         *
         * Read that file before throwing so the real provider
         * error is visible in the backend terminal.
         */
        if (
          typeof statusData.output ===
            "string" &&
          statusData.output.startsWith(
            "http",
          )
        ) {
          try {
            console.error(
              "[WanVideoProvider] Fetching failure output:",
              statusData.output,
            );

            const failureOutputResponse =
              await fetch(
                statusData.output,
              );

            const failureOutputText =
              await failureOutputResponse.text();

            console.error(
              "[WanVideoProvider] Failure output HTTP status:",
              failureOutputResponse.status,
            );

            console.error(
              "[WanVideoProvider] Failure output body:",
              failureOutputText,
            );

            if (
              failureOutputText.trim()
            ) {
              throw new Error(
                `Wan video generation failed: ${failureOutputText.trim()}`,
              );
            }
          } catch (outputError) {
            /*
             * If the output file cannot be fetched or the
             * fetched text was intentionally thrown above,
             * preserve the useful error information.
             */
            if (
              outputError instanceof
                Error &&
              outputError.message.startsWith(
                "Wan video generation failed:",
              )
            ) {
              throw outputError;
            }

            console.error(
              "[WanVideoProvider] Failed to read Wan failure output:",
              outputError,
            );
          }
        }

        throw new Error(
          statusData.error ||
            statusData.message ||
            `Wan video generation ${statusData.status?.toLowerCase()}.`,
        );
      }

      if (
        statusData.status ===
        "COMPLETED"
      ) {
        break;
      }
    }

    const videoUrl =
      statusData.video ||
      statusData.url ||
      statusData.video_url ||
      (typeof statusData.output ===
      "string"
        ? statusData.output
        : statusData.output?.url);

    if (!videoUrl) {
      throw new Error(
        `Wan completed but did not return a video URL: ${JSON.stringify(
          statusData,
        )}`,
      );
    }

    const fileName =
      `${randomUUID()}.mp4`;

    const downloadPath =
      path.join(
        VIDEO_UPLOAD_DIR,
        fileName,
      );

    const rawPath =
      path.join(
        VIDEO_UPLOAD_DIR,
        `${randomUUID()}-raw.mp4`,
      );

    console.log(
      "[WanVideoProvider] Downloading I2V video:",
      rawPath,
    );

    const videoResponse =
      await fetch(
        videoUrl,
      );

    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download Wan I2V video (${videoResponse.status}).`,
      );
    }

    const videoBuffer =
      Buffer.from(
        await videoResponse.arrayBuffer(),
      );

    await writeFile(
      rawPath,
      videoBuffer,
    );

    console.log(
      "[WanVideoProvider] Removing I2V reference-image lead-in:",
      `${I2V_REFERENCE_HOLD_SECONDS}s`,
    );

    try {
      await cleanWanI2VClip(
        rawPath,
        downloadPath,
      );
    } finally {
      await unlink(
        rawPath,
      ).catch(
        () => undefined,
      );
    }

    console.log(
      "[WanVideoProvider] Clean I2V video clip saved successfully.",
    );

    return {
      video:
        `/uploads/videos/${fileName}`,

      durationSeconds:
        CLIP_DURATION_SECONDS,

      model:
        DEFAULT_MODEL,

      sceneNumber:
        options?.sceneNumber,
    };
  }
}

export const createWanVideoProvider =
  () =>
    new WanVideoProvider();