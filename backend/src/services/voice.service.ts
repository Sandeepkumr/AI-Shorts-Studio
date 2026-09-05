import OpenAI from "openai";

import { ElevenLabsVoiceProvider } from "../providers/voice/elevenLabsVoiceProvider.js";

import type {
  VoiceGenerationResult,
  VoiceProvider,
} from "../providers/voice/voiceProvider.js";

import { env } from "../config/env.js";

export type {
  VoiceGenerationResult,
} from "../providers/voice/voiceProvider.js";

type SupportedLanguage =
  | "English (US)"
  | "English (UK)"
  | "Hindi"
  | "Punjabi"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Korean";

const TRANSLATION_MODEL =
  process.env.OPENAI_TRANSLATION_MODEL ||
  process.env.OPENAI_STORY_MODEL ||
  "gpt-4.1-mini";

const ENGLISH_LANGUAGES: SupportedLanguage[] = [
  "English (US)",
  "English (UK)",
];

const isSupportedLanguage = (
  value: string,
): value is SupportedLanguage => {
  return [
    "English (US)",
    "English (UK)",
    "Hindi",
    "Punjabi",
    "Spanish",
    "French",
    "German",
    "Japanese",
    "Korean",
  ].includes(value as SupportedLanguage);
};

const sleep = (
  milliseconds: number,
) =>
  new Promise<void>((resolve) =>
    setTimeout(
      resolve,
      milliseconds,
    ),
  );

const isRetryableOpenAIError = (
  error: unknown,
): boolean => {
  const candidate =
    error as {
      status?: unknown;
      message?: unknown;
    };

  const status =
    typeof candidate.status === "number"
      ? candidate.status
      : undefined;

  if (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message =
    typeof candidate.message === "string"
      ? candidate.message.toLowerCase()
      : error instanceof Error
        ? error.message.toLowerCase()
        : "";

  return (
    message.includes("rate limit") ||
    message.includes("temporarily unavailable") ||
    message.includes("service unavailable") ||
    message.includes("overloaded") ||
    message.includes("timeout")
  );
};

const translateNarration = async (
  narration: string,
  targetLanguage: SupportedLanguage,
): Promise<string> => {
  const cleanNarration =
    narration.trim();

  if (!cleanNarration) {
    throw new Error(
      "Narration is required for translation.",
    );
  }

  if (
    ENGLISH_LANGUAGES.includes(
      targetLanguage,
    )
  ) {
    return cleanNarration;
  }

  const apiKey =
    env.openaiApiKey?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  const client =
    new OpenAI({
      apiKey,
    });

  console.log(
    "[VoiceService] Translating narration with OpenAI...",
  );

  console.log(
    "[VoiceService] Target language:",
    targetLanguage,
  );

  const translationPrompt = [
    `Translate the following spoken narration into ${targetLanguage}.`,
    "",
    "Rules:",
    "- Return only the translated narration.",
    "- Do not add explanations.",
    "- Do not add quotation marks.",
    "- Keep all names unchanged.",
    "- Preserve the original story meaning and events.",
    "- Keep the narration natural and easy to speak aloud.",
    "- Do not shorten or expand the story unnecessarily.",
    "- Preserve the emotional tone.",
    "",
    "Narration:",
    cleanNarration,
  ].join("\n");

  let lastError: unknown;

  const retryDelays = [
    2_000,
    4_000,
    8_000,
  ];

  for (
    let attempt = 1;
    attempt <= 3;
    attempt += 1
  ) {
    try {
      console.log(
        `[VoiceService] OpenAI translation attempt ${attempt}/3`,
      );

      const response =
        await client.chat.completions.create({
          model:
            TRANSLATION_MODEL,

          messages: [
            {
              role: "system",
              content:
                "You are a professional voiceover translator. Return only the translated narration.",
            },
            {
              role: "user",
              content:
                translationPrompt,
            },
          ],

          response_format: {
            type: "text",
          },
        });

      const translatedText =
        response.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error(
          "OpenAI returned an empty translation.",
        );
      }

      console.log(
        "[VoiceService] OpenAI translation completed:",
        translatedText,
      );

      return translatedText;
    } catch (error) {
      lastError = error;

      console.warn(
        `[VoiceService] OpenAI translation attempt ${attempt} failed.`,
      );

      console.warn(
        "[VoiceService] Translation error:",
        error,
      );

      if (
        !isRetryableOpenAIError(
          error,
        ) ||
        attempt >= 3
      ) {
        break;
      }

      const delay =
        retryDelays[
          attempt - 1
        ] ?? 8_000;

      await sleep(
        delay,
      );
    }
  }

  /*
   * Translation failure should not destroy the entire
   * video job. Fall back to the original narration so
   * ElevenLabs can still generate audio.
   */
  console.warn(
    "[VoiceService] OpenAI translation unavailable.",
  );

  console.warn(
    "[VoiceService] Falling back to original narration for TTS.",
  );

  if (lastError) {
    console.warn(
      "[VoiceService] Last translation error:",
      lastError,
    );
  }

  return cleanNarration;
};

export class VoiceService {
  constructor(
    private readonly provider: VoiceProvider =
      new ElevenLabsVoiceProvider(),
  ) {}

  async generateVoice(
    script?: string,
    voice?: string,
    language?: string,
  ): Promise<VoiceGenerationResult> {
    const narration =
      script?.trim();

    if (!narration) {
      throw new Error(
        "Narration script is required.",
      );
    }

    const selectedVoice =
      voice?.trim().toLowerCase() ||
      "female";

    if (
      selectedVoice === "none"
    ) {
      throw new Error(
        "Voice generation is disabled for this request.",
      );
    }

    const requestedLanguage =
      language?.trim() ||
      "English (US)";

    const targetLanguage: SupportedLanguage =
      isSupportedLanguage(
        requestedLanguage,
      )
        ? requestedLanguage
        : "English (US)";

    console.log(
      "[VoiceService] Original narration:",
      narration,
    );

    console.log(
      "[VoiceService] Selected language:",
      targetLanguage,
    );

    console.log(
      "[VoiceService] Selected voice:",
      selectedVoice,
    );

    const spokenText =
      await translateNarration(
        narration,
        targetLanguage,
      );

    console.log(
      "[VoiceService] Final TTS transcript:",
      spokenText,
    );

    return this.provider.generateVoice(
      spokenText,
      selectedVoice,
    );
  }
}

export const createVoiceService = (
  provider?: VoiceProvider,
) =>
  new VoiceService(
    provider ??
      new ElevenLabsVoiceProvider(),
  );

export const voiceService =
  createVoiceService();