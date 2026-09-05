import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";

import type {
  VoiceGenerationResult,
  VoiceProvider,
} from "./voiceProvider.js";

const ELEVENLABS_API_BASE =
  "https://api.elevenlabs.io/v1";

const DEFAULT_MODEL =
  process.env.ELEVENLABS_TTS_MODEL ||
  "eleven_v3";

const DEFAULT_OUTPUT_FORMAT =
  "mp3_44100_128";

const AUDIO_UPLOAD_DIR =
  path.resolve(
    "uploads",
    "audio",
  );

const normalizeVoiceSelection = (
  voice: string,
): "male" | "female" => {
  const normalized =
    voice.trim().toLowerCase();

  if (
    normalized === "male"
  ) {
    return "male";
  }

  if (
    normalized === "female"
  ) {
    return "female";
  }

  /*
   * Backward compatibility:
   * Older Shivora values such as "Leda" or "Kore"
   * are treated as female so the existing UI does not
   * break while the app moves to ElevenLabs voices.
   */
  if (
    normalized === "leda" ||
    normalized === "kore"
  ) {
    return "female";
  }

  return "female";
};

export class ElevenLabsVoiceProvider
  implements VoiceProvider
{
  async generateVoice(
    script: string,
    voice: string,
  ): Promise<VoiceGenerationResult> {
    const apiKey =
      env.elevenLabsApiKey?.trim();

    if (!apiKey) {
      throw new Error(
        "ELEVENLABS_API_KEY is not configured.",
      );
    }

    const text =
      script.trim();

    if (!text) {
      throw new Error(
        "TTS script is required.",
      );
    }

    const selectedVoice =
      normalizeVoiceSelection(
        voice,
      );

    const selectedVoiceId =
      selectedVoice === "male"
        ? env.elevenLabsMaleVoiceId?.trim()
        : env.elevenLabsFemaleVoiceId?.trim();

    if (!selectedVoiceId) {
      throw new Error(
        selectedVoice === "male"
          ? "ELEVENLABS_MALE_VOICE_ID is not configured."
          : "ELEVENLABS_FEMALE_VOICE_ID is not configured.",
      );
    }

    await mkdir(
      AUDIO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    console.log(
      "[ElevenLabsVoiceProvider] Starting voice generation",
    );

    console.log(
      "[ElevenLabsVoiceProvider] Model:",
      DEFAULT_MODEL,
    );

    console.log(
      "[ElevenLabsVoiceProvider] Voice selection:",
      selectedVoice,
    );

    console.log(
      "[ElevenLabsVoiceProvider] Voice ID:",
      selectedVoiceId,
    );

    console.log(
      "[ElevenLabsVoiceProvider] Output format:",
      DEFAULT_OUTPUT_FORMAT,
    );

    console.log(
      "[ElevenLabsVoiceProvider] Transcript:",
      text,
    );

    const response =
      await fetch(
        `${ELEVENLABS_API_BASE}/text-to-speech/${encodeURIComponent(
          selectedVoiceId,
        )}`,
        {
          method: "POST",

          headers: {
            "xi-api-key":
              apiKey,

            "Content-Type":
              "application/json",

            Accept:
              "audio/mpeg",
          },

          body: JSON.stringify({
            text,

            model_id:
              DEFAULT_MODEL,

            output_format:
              DEFAULT_OUTPUT_FORMAT,
          }),
        },
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `ElevenLabs TTS request failed (${response.status}): ${errorText}`,
      );
    }

    const audioBuffer =
      Buffer.from(
        await response.arrayBuffer(),
      );

    if (
      audioBuffer.length === 0
    ) {
      throw new Error(
        "ElevenLabs returned empty audio data.",
      );
    }

    console.log(
      "[ElevenLabsVoiceProvider] Audio bytes:",
      audioBuffer.length,
    );

    const fileName =
      `${randomUUID()}.mp3`;

    const audioPath =
      path.join(
        AUDIO_UPLOAD_DIR,
        fileName,
      );

    await writeFile(
      audioPath,
      audioBuffer,
    );

    console.log(
      "[ElevenLabsVoiceProvider] MP3 audio saved successfully:",
      audioPath,
    );

    return {
      audio:
        `/uploads/audio/${fileName}`,
    };
  }
}

export const createElevenLabsVoiceProvider =
  () =>
    new ElevenLabsVoiceProvider();