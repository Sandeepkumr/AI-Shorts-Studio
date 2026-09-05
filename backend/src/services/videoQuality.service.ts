import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync =
  promisify(execFile);

const DURATION_TOLERANCE_SECONDS = 0.25;

const resolveLocalUploadPath = (
  value: string,
): string => {
  const trimmed =
    value.trim();

  if (!trimmed) {
    throw new Error(
      "Video path is required.",
    );
  }

  if (
    trimmed.startsWith(
      "/uploads/",
    )
  ) {
    return (
      process.cwd() +
      trimmed
    );
  }

  if (
    trimmed.startsWith(
      "http://",
    ) ||
    trimmed.startsWith(
      "https://",
    )
  ) {
    throw new Error(
      "Video quality checks require a local video file path, not a remote URL.",
    );
  }

  return trimmed;
};

export const getVideoDurationSeconds =
  async (
    videoPath: string,
  ): Promise<number> => {
    const localPath =
      resolveLocalUploadPath(
        videoPath,
      );

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
          localPath,
        ],
        {
          maxBuffer:
            10 * 1024 * 1024,
        },
      );

    const duration =
      Number(
        stdout.trim(),
      );

    if (
      !Number.isFinite(
        duration,
      ) ||
      duration <= 0
    ) {
      throw new Error(
        `Could not determine video duration for: ${videoPath}`,
      );
    }

    return duration;
  };

export const assertVideoDuration =
  async (
    videoPath: string,
    expectedDurationSeconds: number,
    label: string,
    toleranceSeconds =
      DURATION_TOLERANCE_SECONDS,
  ): Promise<number> => {
    const actualDuration =
      await getVideoDurationSeconds(
        videoPath,
      );

    const difference =
      Math.abs(
        actualDuration -
          expectedDurationSeconds,
      );

    console.log(
      `[VideoQuality] ${label}: expected ${expectedDurationSeconds.toFixed(
        2,
      )}s, actual ${actualDuration.toFixed(
        2,
      )}s, difference ${difference.toFixed(
        2,
      )}s`,
    );

    if (
      difference >
      toleranceSeconds
    ) {
      throw new Error(
        `${label} duration check failed: expected ${expectedDurationSeconds.toFixed(
          2,
        )}s but received ${actualDuration.toFixed(
          2,
        )}s. Allowed tolerance: ±${toleranceSeconds.toFixed(
          2,
        )}s.`,
      );
    }

    return actualDuration;
  };