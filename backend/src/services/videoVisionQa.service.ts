import {
  mkdtemp,
  readFile,
  rm,
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";
import {
  execFile,
} from "node:child_process";
import {
  promisify,
} from "node:util";

import OpenAI from "openai";

import type {
  VideoCharacter,
  VideoScenePlan,
} from "../providers/video/videoProvider.js";

const execFileAsync =
  promisify(execFile);

const VIDEO_QA_MODEL =
  process.env.OPENAI_VIDEO_QA_MODEL ||
  "gpt-5.6-luna";

const FRAME_COUNT = 3;

const MAX_REFERENCE_IMAGES = 8;

export type VideoQaStatus =
  | "pass"
  | "fail";

export type VideoQaCheck = {
  score: number;
  pass: boolean;
  reason: string;
};

export type VideoVisionQaResult = {
  status: VideoQaStatus;

  overallScore: number;

  checks: {
    characters: VideoQaCheck;
    actions: VideoQaCheck;
    emotion: VideoQaCheck;
    expression: VideoQaCheck;
    bodyLanguage: VideoQaCheck;
    startState: VideoQaCheck;
    endState: VideoQaCheck;
    continuity: VideoQaCheck;
  };

  missingStoryElements: string[];

  unexpectedElements: string[];

  summary: string;

  retryRecommended: boolean;
};

type QaFrame = {
  frameNumber: number;
  imageDataUrl: string;
};

type QaReferenceImage = {
  characterId: string;
  characterName: string;
  imageDataUrl: string;
};

const isObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const clampScore = (
  value: unknown,
): number => {
  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      numberValue,
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(numberValue),
    ),
  );
};

const toStringArray = (
  value: unknown,
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
          "string" &&
        item.trim().length > 0,
    )
    .map((item) =>
      item.trim(),
    );
};

const normalizeCheck = (
  value: unknown,
  fallbackReason: string,
): VideoQaCheck => {
  const object =
    isObject(value)
      ? value
      : {};

  const score =
    clampScore(object.score);

  const explicitPass =
    typeof object.pass ===
    "boolean"
      ? object.pass
      : undefined;

  return {
    score,

    pass:
      explicitPass ??
      score >= 75,

    reason:
      typeof object.reason ===
        "string" &&
      object.reason.trim()
        ? object.reason.trim()
        : fallbackReason,
  };
};

const resolveLocalVideoPath = (
  videoPath: string,
): string => {
  const trimmed =
    videoPath.trim();

  if (!trimmed) {
    throw new Error(
      "Video path is required for vision QA.",
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
      "Video vision QA requires a local video file path.",
    );
  }

  if (
    trimmed.startsWith(
      "/uploads/",
    )
  ) {
    return path.resolve(
      process.cwd(),
      trimmed.slice(1),
    );
  }

  if (
    path.isAbsolute(
      trimmed,
    )
  ) {
    return trimmed;
  }

  return path.resolve(
    process.cwd(),
    trimmed.replace(
      /^\/+/,
      "",
    ),
  );
};


const resolveLocalCharacterImagePath = (
  imageUrl: string,
): string | undefined => {
  const trimmed = imageUrl.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("/uploads/")) {
    return path.resolve(process.cwd(), trimmed.slice(1));
  }

  if (trimmed.startsWith("uploads/")) {
    return path.resolve(process.cwd(), trimmed);
  }

  if (path.isAbsolute(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/uploads/")) {
      return path.resolve(process.cwd(), parsed.pathname.slice(1));
    }
  } catch {
    // Not a URL; handled by caller as unavailable.
  }

  return undefined;
};

const loadCharacterReferenceImages = async (
  characters: VideoCharacter[],
): Promise<QaReferenceImage[]> => {
  const results: QaReferenceImage[] = [];

  for (const character of characters) {
    if (results.length >= MAX_REFERENCE_IMAGES) break;

    const imageUrl = character.imageUrl?.trim();
    if (!imageUrl) continue;

    const localPath = resolveLocalCharacterImagePath(imageUrl);
    if (!localPath) {
      console.warn(
        `[VideoVisionQA] Skipping non-local character reference for ${character.name}: ${imageUrl}`,
      );
      continue;
    }

    try {
      const bytes = await readFile(localPath);
      results.push({
        characterId: character.id,
        characterName: character.name,
        imageDataUrl: `data:image/jpeg;base64,${bytes.toString("base64")}`,
      });
    } catch (error) {
      console.warn(
        `[VideoVisionQA] Could not load character reference for ${character.name}:`,
        error,
      );
    }
  }

  return results;
};

/**
 * Extract a small number of representative frames.
 *
 * We deliberately sample the beginning, middle, and end
 * instead of sending the entire video to the model.
 */
const extractQaFrames = async (
  videoPath: string,
): Promise<{
  directory: string;
  frames: QaFrame[];
}> => {
  const localPath =
    resolveLocalVideoPath(
      videoPath,
    );

  const tempDirectory =
    await mkdtemp(
      path.join(
        os.tmpdir(),
        "shivora-video-qa-",
      ),
    );

  try {
    const durationResult =
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
            10 *
            1024 *
            1024,
        },
      );

    const duration =
      Number(
        durationResult.stdout.trim(),
      );

    if (
      !Number.isFinite(
        duration,
      ) ||
      duration <= 0
    ) {
      throw new Error(
        "Could not determine video duration for vision QA.",
      );
    }

    /*
     * Keep samples away from exact boundaries,
     * where codecs may return less useful frames.
     */
    const sampleTimes =
      [
        Math.max(
          0.05,
          duration * 0.08,
        ),

        Math.max(
          0.10,
          duration * 0.50,
        ),

        Math.max(
          0.15,
          duration * 0.92,
        ),
      ];

    const frames: QaFrame[] =
      [];

    for (
      let index = 0;
      index <
        sampleTimes.length;
      index += 1
    ) {
      const framePath =
        path.join(
          tempDirectory,
          `frame-${index + 1}.jpg`,
        );

      await execFileAsync(
        "ffmpeg",
        [
          "-y",
          "-ss",
          sampleTimes[index]!
            .toFixed(3),
          "-i",
          localPath,
          "-frames:v",
          "1",
          "-vf",
          "scale='min(768,iw)':-2",
          "-q:v",
          "3",
          framePath,
        ],
        {
          maxBuffer:
            10 *
            1024 *
            1024,
        },
      );

      const bytes =
        await readFile(
          framePath,
        );

      frames.push({
        frameNumber:
          index + 1,

        imageDataUrl:
          `data:image/jpeg;base64,${bytes.toString(
            "base64",
          )}`,
      });
    }

    return {
      directory:
        tempDirectory,
      frames,
    };
  } catch (error) {
    await rm(
      tempDirectory,
      {
        recursive: true,
        force: true,
      },
    );

    throw error;
  }
};

const buildExpectedManifestText = (
  scenePlan: VideoScenePlan,
  characters: VideoCharacter[],
): string => {
  const visibleIds =
    new Set(
      scenePlan
        .visibleCharacterIds ??
        [],
    );

  const visibleCharacters =
    characters.filter(
      (character) =>
        visibleIds.has(
          character.id,
        ) ||
        (
          character.id &&
          visibleIds.has(
            character.id,
          )
        ),
    );

  const characterDetails =
    (
      scenePlan.characterPlans ??
      []
    ).map((plan) => {
      const character =
        characters.find(
          (item) =>
            item.id ===
            plan.characterId,
        );

      return [
        `Character ID: ${plan.characterId}`,
        character
          ? `Character name: ${character.name}`
          : "",
        character
          ? `Role: ${character.role}`
          : "",
        character
          ? `Visual identity: ${character.visualDescription}`
          : "",
        `Actions: ${plan.actions.join("; ")}`,
        `Emotion: ${plan.emotion}`,
        `Expression: ${plan.expression}`,
        `Body language: ${plan.bodyLanguage.join("; ")}`,
        `Start state: ${plan.startState}`,
        `End state: ${plan.endState}`,
      ]
        .filter(Boolean)
        .join("\n");
    });

  return [
    `Scene title: ${scenePlan.title}`,
    `Scene description: ${scenePlan.description}`,
    `Location: ${scenePlan.location ?? "Not specified"}`,

    `Visible character IDs: ${
      scenePlan.visibleCharacterIds.join(
        ", ",
      )
    }`,

    visibleCharacters.length > 0
      ? `Visible character names: ${visibleCharacters
          .map(
            (character) =>
              character.name,
          )
          .join(", ")}`
      : "",

    `Scene actions in order: ${
      scenePlan.actions.join("; ")
    }`,

    `Scene start state: ${scenePlan.startState}`,

    `Scene end state: ${scenePlan.endState}`,

    characterDetails.length > 0
      ? `Per-character requirements:\n${characterDetails.join(
          "\n\n",
        )}`
      : "",

    scenePlan.continuity
      ? [
          "Continuity requirements:",
          `Location continues: ${
            scenePlan.continuity
              .locationContinues
          }`,
          `Inherited character states: ${JSON.stringify(
            scenePlan.continuity
              .inheritedCharacterStates,
          )}`,
          `Required continuity: ${scenePlan.continuity.requiredContinuity.join(
            "; ",
          )}`,
        ].join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

const buildQaSystemInstruction =
  (): string => `
You are Shivora's video quality-control vision evaluator.

You are evaluating a generated video clip against a structured expected scene manifest.
You will also receive authoritative saved/generated character reference images when available.

INPUTS:
1. Expected story/scene manifest.
2. Three sampled video frames: early, middle, final.
3. Optional character reference images. Each reference image is labeled with its character name and ID.

CHARACTER IDENTITY RULES:
- When a character reference image is supplied, treat that image as the authoritative visual identity.
- Compare the generated character against the supplied reference for face, hair, clothing, color palette, age/proportions, species, and other distinctive visual traits.
- A conflict between textual appearance guidance and the supplied reference image must be resolved in favor of the reference image.
- Do not require pixel-perfect identity; judge whether the character is recognizably the same designed character.
- Do not invent traits that cannot be visually supported by the reference.
- If no reference image is supplied, use the textual manifest identity only.

VISUAL EVIDENCE RULES:
- Judge only what is visually supported by the supplied frames.
- Do not assume an action happened just because the prompt says it.
- Do not invent unseen events.
- Distinguish "not visible in sampled frames" from "clearly wrong".
- The final frame is especially important for end-state evaluation.

SEVERITY / RETRY RULES:
- CRITICAL failures: wrong character identity, wrong species, missing main character, wrong core action, broken required start/end state, or a continuity error that changes the story. These should fail and can recommend retry.
- MATERIAL failures: clearly wrong emotion/expression/body language when explicitly required, or a meaningful story-state mismatch. These can fail and recommend retry when regeneration could reasonably fix them.
- MINOR/background variance: tiny distant background people/objects that do not interact with the characters, subjective cinematic preferences, or details that are only weakly visible in sampled frames. Do NOT recommend a paid regeneration solely for these minor issues.
- Do not reject a clip merely because a background location looks naturally populated unless the extra person is prominent, interacting, duplicated, or contradicts the story.
- If a requirement cannot be reliably judged from the sampled frames, report the uncertainty in the reason instead of inventing certainty.

SCORING:
- Score each category 0-100.
- A strong character-reference match should materially improve the characters score.
- Overall pass should reflect critical story correctness, not cosmetic perfection.
- Use the weakest important category seriously, but do not let a minor background variation alone force failure.

RETRY:
- Set retryRecommended=true only when the failure is material and reasonably fixable by regenerating the clip.
- For minor/background-only issues, retryRecommended=false.

Return ONLY valid JSON using exactly this structure:
{
  "status": "pass" | "fail",
  "overallScore": 0,
  "checks": {
    "characters": { "score": 0, "pass": false, "reason": "" },
    "actions": { "score": 0, "pass": false, "reason": "" },
    "emotion": { "score": 0, "pass": false, "reason": "" },
    "expression": { "score": 0, "pass": false, "reason": "" },
    "bodyLanguage": { "score": 0, "pass": false, "reason": "" },
    "startState": { "score": 0, "pass": false, "reason": "" },
    "endState": { "score": 0, "pass": false, "reason": "" },
    "continuity": { "score": 0, "pass": false, "reason": "" }
  },
  "missingStoryElements": [],
  "unexpectedElements": [],
  "summary": "",
  "retryRecommended": false
}
`;

export const evaluateVideoClipWithVision =
  async (
    videoPath: string,
    scenePlan: VideoScenePlan,
    characters: VideoCharacter[] = [],
  ): Promise<VideoVisionQaResult> => {
    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured.",
      );
    }

    const client =
      new OpenAI({
        apiKey,
      });

    let frameDirectory:
      | string
      | undefined;

    try {
      const extracted =
        await extractQaFrames(
          videoPath,
        );

      frameDirectory =
        extracted.directory;

      if (
        extracted.frames.length ===
        0
      ) {
        throw new Error(
          "No frames were extracted for video vision QA.",
        );
      }

      const expectedManifest =
        buildExpectedManifestText(
          scenePlan,
          characters,
        );

      const characterReferences =
        await loadCharacterReferenceImages(
          characters.filter((character) =>
            scenePlan.visibleCharacterIds.includes(character.id),
          ),
        );

      const characterReferenceContent =
        characterReferences.map((reference) => [
          {
            type: "text" as const,
            text: `AUTHORITATIVE CHARACTER REFERENCE: ${reference.characterName} (${reference.characterId})`,
          },
          {
            type: "image_url" as const,
            image_url: {
              url: reference.imageDataUrl,
            },
          },
        ]).flat();

      const frameContent =
        extracted.frames.map(
          (frame) => ({
            type:
              "image_url" as const,

            image_url: {
              url:
                frame.imageDataUrl,
            },
          }),
        );

      console.log(
        `[VideoVisionQA] Loaded ${characterReferences.length} authoritative character reference image(s) for scene ${scenePlan.sceneNumber}.`,
      );

      const response =
        await client.chat.completions.create(
          {
            model:
              VIDEO_QA_MODEL,


            messages: [
              {
                role: "system",
                content:
                  buildQaSystemInstruction(),
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: [
                      "EXPECTED SCENE MANIFEST:",
                      expectedManifest,
                      "",
                      "EVALUATE THE GENERATED VIDEO USING THESE SAMPLED FRAMES.",
                      "Frame 1 is the beginning.",
                      "Frame 2 is the middle.",
                      "Frame 3 is the ending.",
                    ].join("\n"),
                  },

                  ...(characterReferenceContent.length > 0
                    ? [
                        {
                          type: "text" as const,
                          text: "AUTHORITATIVE CHARACTER REFERENCE IMAGES FOLLOW. Compare visible characters against these references when present.",
                        },
                        ...characterReferenceContent,
                      ]
                    : []),

                  ...frameContent,
                ],
              },
            ],
          },
        );

      const raw =
        response.choices[0]
          ?.message
          ?.content
          ?.trim();

      if (!raw) {
        throw new Error(
          "OpenAI video vision QA returned an empty response.",
        );
      }

      let parsed:
        | unknown;

      try {
        parsed =
          JSON.parse(raw);
      } catch {
        throw new Error(
          "OpenAI video vision QA returned invalid JSON.",
        );
      }

      if (!isObject(parsed)) {
        throw new Error(
          "OpenAI video vision QA returned an invalid object.",
        );
      }

      const checksSource =
        isObject(
          parsed.checks,
        )
          ? parsed.checks
          : {};

      const checks = {
        characters:
          normalizeCheck(
            checksSource.characters,
            "Character check did not return a valid result.",
          ),

        actions:
          normalizeCheck(
            checksSource.actions,
            "Action check did not return a valid result.",
          ),

        emotion:
          normalizeCheck(
            checksSource.emotion,
            "Emotion check did not return a valid result.",
          ),

        expression:
          normalizeCheck(
            checksSource.expression,
            "Expression check did not return a valid result.",
          ),

        bodyLanguage:
          normalizeCheck(
            checksSource.bodyLanguage,
            "Body-language check did not return a valid result.",
          ),

        startState:
          normalizeCheck(
            checksSource.startState,
            "Start-state check did not return a valid result.",
          ),

        endState:
          normalizeCheck(
            checksSource.endState,
            "End-state check did not return a valid result.",
          ),

        continuity:
          normalizeCheck(
            checksSource.continuity,
            "Continuity check did not return a valid result.",
          ),
      };

      const overallScore =
        clampScore(
          parsed.overallScore,
        );

      const status =
        parsed.status ===
          "pass" &&
        Object.values(
          checks,
        ).every(
          (check) =>
            check.pass,
        ) &&
        overallScore >= 75
          ? "pass"
          : "fail";

      const missingStoryElements =
        toStringArray(
          parsed.missingStoryElements,
        );

      const unexpectedElements =
        toStringArray(
          parsed.unexpectedElements,
        );

      const summary =
        typeof parsed.summary ===
          "string" &&
        parsed.summary.trim()
          ? parsed.summary.trim()
          : "Video vision QA completed.";

      const retryRecommended =
        status === "fail" ||
        parsed.retryRecommended ===
          true;

      const result: VideoVisionQaResult =
        {
          status,

          overallScore,

          checks,

          missingStoryElements,

          unexpectedElements,

          summary,

          retryRecommended,
        };

      console.log(
        "[VideoVisionQA] Result:",
        JSON.stringify(
          {
            status:
              result.status,

            overallScore:
              result.overallScore,

            retryRecommended:
              result.retryRecommended,

            missingStoryElements:
              result.missingStoryElements,

            unexpectedElements:
              result.unexpectedElements,
          },
          null,
          2,
        ),
      );

      return result;
    } finally {
      if (frameDirectory) {
        await rm(
          frameDirectory,
          {
            recursive: true,
            force: true,
          },
        );
      }
    }
  };