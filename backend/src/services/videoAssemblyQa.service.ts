import {
  getVideoDurationSeconds,
} from "./videoQuality.service.js";

const DURATION_TOLERANCE_SECONDS = 0.25;

export type AssemblyContractResult = {
  expectedClipCount: number;
  actualClipCount: number;
  expectedClipDurationSeconds: number;
  expectedFinalDurationSeconds: number;
  valid: boolean;
};

/**
 * Validate that the set of accepted clips is complete and that every
 * accepted clip satisfies the fixed-duration contract before concatenation.
 */
export const assertAssemblyContract = async (
  clipPaths: string[],
  expectedClipCount: number,
  expectedClipDurationSeconds: number,
  expectedFinalDurationSeconds: number,
): Promise<AssemblyContractResult> => {
  if (
    clipPaths.length !==
    expectedClipCount
  ) {
    throw new Error(
      `Assembly contract failed: expected ${expectedClipCount} accepted clips, received ${clipPaths.length}.`,
    );
  }

  for (
    let index = 0;
    index < clipPaths.length;
    index += 1
  ) {
    const clipPath =
      clipPaths[index];

    if (
      !clipPath?.trim()
    ) {
      throw new Error(
        `Assembly contract failed: clip ${index + 1} has no valid path.`,
      );
    }

    const actualDuration =
      await getVideoDurationSeconds(
        clipPath,
      );

    const difference =
      Math.abs(
        actualDuration -
          expectedClipDurationSeconds,
      );

    console.log(
      `[VideoAssemblyQA] Clip ${index + 1}/${expectedClipCount}: expected ${expectedClipDurationSeconds.toFixed(
        2,
      )}s, actual ${actualDuration.toFixed(
        2,
      )}s, difference ${difference.toFixed(
        2,
      )}s`,
    );

    if (
      difference >
      DURATION_TOLERANCE_SECONDS
    ) {
      throw new Error(
        `Assembly contract failed: clip ${index + 1} is ${actualDuration.toFixed(
          2,
        )}s; expected ${expectedClipDurationSeconds.toFixed(
          2,
        )}s.`,
      );
    }
  }

  const expectedFromClips =
    expectedClipCount *
    expectedClipDurationSeconds;

  if (
    Math.abs(
      expectedFromClips -
        expectedFinalDurationSeconds,
    ) >
    DURATION_TOLERANCE_SECONDS
  ) {
    throw new Error(
      `Assembly contract failed: clip contract totals ${expectedFromClips.toFixed(
        2,
      )}s but requested final duration is ${expectedFinalDurationSeconds.toFixed(
        2,
      )}s.`,
    );
  }

  const result: AssemblyContractResult =
    {
      expectedClipCount,
      actualClipCount:
        clipPaths.length,
      expectedClipDurationSeconds,
      expectedFinalDurationSeconds,
      valid: true,
    };

  console.log(
    "[VideoAssemblyQA] Assembly contract passed:",
    result,
  );

  return result;
};