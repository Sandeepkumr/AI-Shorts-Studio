import {
  mkdir,
  writeFile,
  unlink,
} from "node:fs/promises";

import { spawn } from "node:child_process";

import path from "node:path";

import { randomUUID } from "node:crypto";

const VIDEO_UPLOAD_DIR =
  path.resolve(
    "uploads",
    "videos",
  );

const runFFmpeg = (
  args: string[],
): Promise<void> =>
  new Promise(
    (resolve, reject) => {
      const ffmpeg =
        spawn(
          "ffmpeg",
          args,
        );

      let stderr = "";

      ffmpeg.stderr.on(
        "data",
        (data) => {
          stderr +=
            data.toString();
        },
      );

      ffmpeg.on(
        "error",
        reject,
      );

      ffmpeg.on(
        "close",
        (code) => {
          if (code === 0) {
            resolve();
            return;
          }

          reject(
            new Error(
              `FFmpeg failed with exit code ${code}: ${stderr}`,
            ),
          );
        },
      );
    },
  );

const getDimensions =
  (
    aspectRatio:
      | "9:16"
      | "16:9"
      | "1:1",
  ) => {
    switch (
      aspectRatio
    ) {
      case "16:9":
        return {
          width: 832,
          height: 480,
        };

      case "1:1":
        return {
          width: 512,
          height: 512,
        };

      case "9:16":
      default:
        return {
          width: 480,
          height: 832,
        };
    }
  };

export const normalizeVideoClip =
  async (
    videoUrl: string,
    aspectRatio:
      | "9:16"
      | "16:9"
      | "1:1",
    durationSeconds = 5,
  ): Promise<string> => {
    const inputPath =
      path.resolve(
        videoUrl.replace(
          /^\/+/,
          "",
        ),
      );

    await mkdir(
      VIDEO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    const {
      width,
      height,
    } =
      getDimensions(
        aspectRatio,
      );

    const fileName =
      `${randomUUID()}-normalized.mp4`;

    const outputPath =
      path.join(
        VIDEO_UPLOAD_DIR,
        fileName,
      );

    await runFFmpeg([
      "-y",

      "-i",
      inputPath,

      "-t",
      String(
        durationSeconds,
      ),

      "-vf",
      `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,

      "-r",
      "16",

      "-an",

      "-c:v",
      "libx264",

      "-preset",
      "veryfast",

      "-pix_fmt",
      "yuv420p",

      "-movflags",
      "+faststart",

      outputPath,
    ]);

    return (
      `/uploads/videos/${fileName}`
    );
  };

export const concatVideoClips =
  async (
    videoUrls: string[],
  ): Promise<string> => {
    if (
      videoUrls.length === 0
    ) {
      throw new Error(
        "No video clips provided for concatenation.",
      );
    }

    if (
      videoUrls.length === 1
    ) {
      return videoUrls[0];
    }

    await mkdir(
      VIDEO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    const listFile =
      path.join(
        VIDEO_UPLOAD_DIR,
        `${randomUUID()}-concat.txt`,
      );

    const outputFile =
      `${randomUUID()}-combined.mp4`;

    const outputPath =
      path.join(
        VIDEO_UPLOAD_DIR,
        outputFile,
      );

    const listContent =
      videoUrls
        .map(
          (videoUrl) =>
            `file '${path
              .resolve(
                videoUrl.replace(
                  /^\/+/,
                  "",
                ),
              )
              .replace(
                /'/g,
                "'\\''",
              )}'`,
        )
        .join("\n");

    await writeFile(
      listFile,
      `${listContent}\n`,
      "utf8",
    );

    try {
      await runFFmpeg([
        "-y",

        "-f",
        "concat",

        "-safe",
        "0",

        "-i",
        listFile,

        "-c",
        "copy",

        "-movflags",
        "+faststart",

        outputPath,
      ]);
    } finally {
      await unlink(
        listFile,
      ).catch(() => {});
    }

    return (
      `/uploads/videos/${outputFile}`
    );
  };

export const mergeVideoAndAudio =
  async (
    videoUrl: string,
    audioUrl: string,
    durationSeconds?: number,
  ): Promise<string> => {
    await mkdir(
      VIDEO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    const videoPath =
      path.resolve(
        videoUrl.replace(
          /^\/+/,
          "",
        ),
      );

    const audioPath =
      path.resolve(
        audioUrl.replace(
          /^\/+/,
          "",
        ),
      );

    const fileName =
      `${randomUUID()}.mp4`;

    const outputPath =
      path.join(
        VIDEO_UPLOAD_DIR,
        fileName,
      );

    console.log(
      "[MediaService] Merging video and audio...",
    );

    console.log(
      "[MediaService] Video:",
      videoPath,
    );

    console.log(
      "[MediaService] Audio:",
      audioPath,
    );

    const args = [
      "-y",

      "-i",
      videoPath,

      "-i",
      audioPath,

      "-map",
      "0:v:0",

      "-map",
      "1:a:0",

      "-c:v",
      "copy",

      "-c:a",
      "aac",

      "-af",
      "apad",

      ...(durationSeconds
        ? [
            "-t",
            String(
              durationSeconds,
            ),
          ]
        : []),

      outputPath,
    ];

    await runFFmpeg(
      args,
    );

    console.log(
      "[MediaService] Final video created:",
      outputPath,
    );

    return (
      `/uploads/videos/${fileName}`
    );
  };