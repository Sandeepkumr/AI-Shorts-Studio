import { GoogleGenAI } from "@google/genai";
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

const DEFAULT_MODEL =
  process.env.GEMINI_TTS_MODEL ||
  "gemini-2.5-flash-preview-tts";

const DEFAULT_VOICE = "Kore";

const AUDIO_UPLOAD_DIR =
  path.resolve(
    "uploads",
    "audio",
  );

/**
 * Gemini TTS returns raw PCM/L16 audio.
 *
 * Current Gemini TTS output:
 * - PCM signed 16-bit little-endian
 * - 24,000 Hz
 * - mono
 *
 * We wrap the PCM bytes in a standard WAV
 * container so FFmpeg can read the audio.
 */
const createWavBuffer = (
  pcmData: Buffer,
  sampleRate = 24_000,
  channels = 1,
  bitsPerSample = 16,
): Buffer => {
  const bytesPerSample =
    bitsPerSample / 8;

  const blockAlign =
    channels * bytesPerSample;

  const byteRate =
    sampleRate * blockAlign;

  const dataSize =
    pcmData.length;

  const headerSize = 44;

  const wavBuffer =
    Buffer.alloc(
      headerSize + dataSize,
    );

  // RIFF
  wavBuffer.write(
    "RIFF",
    0,
    4,
    "ascii",
  );

  wavBuffer.writeUInt32LE(
    36 + dataSize,
    4,
  );

  wavBuffer.write(
    "WAVE",
    8,
    4,
    "ascii",
  );

  // fmt
  wavBuffer.write(
    "fmt ",
    12,
    4,
    "ascii",
  );

  wavBuffer.writeUInt32LE(
    16,
    16,
  );

  // PCM
  wavBuffer.writeUInt16LE(
    1,
    20,
  );

  wavBuffer.writeUInt16LE(
    channels,
    22,
  );

  wavBuffer.writeUInt32LE(
    sampleRate,
    24,
  );

  wavBuffer.writeUInt32LE(
    byteRate,
    28,
  );

  wavBuffer.writeUInt16LE(
    blockAlign,
    32,
  );

  wavBuffer.writeUInt16LE(
    bitsPerSample,
    34,
  );

  // data
  wavBuffer.write(
    "data",
    36,
    4,
    "ascii",
  );

  wavBuffer.writeUInt32LE(
    dataSize,
    40,
  );

  pcmData.copy(
    wavBuffer,
    44,
  );

  return wavBuffer;
};

export class GeminiVoiceProvider
  implements VoiceProvider
{
  async generateVoice(
    script: string,
    voice: string,
  ): Promise<VoiceGenerationResult> {
    if (!env.geminiApiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured.",
      );
    }

    /*
     * IMPORTANT:
     * This provider receives only the final
     * transcript that should be spoken.
     *
     * Do NOT send translation instructions,
     * system instructions, or meta instructions
     * in this value.
     */
    const text =
      script.trim();

    if (!text) {
      throw new Error(
        "TTS script is required.",
      );
    }

    const selectedVoice =
      voice.trim() ||
      DEFAULT_VOICE;

    const ai =
      new GoogleGenAI({
        apiKey:
          env.geminiApiKey,
      });

    await mkdir(
      AUDIO_UPLOAD_DIR,
      {
        recursive: true,
      },
    );

    console.log(
      "[GeminiVoiceProvider] Starting voice generation",
    );

    console.log(
      "[GeminiVoiceProvider] Model:",
      DEFAULT_MODEL,
    );

    console.log(
      "[GeminiVoiceProvider] Voice:",
      selectedVoice,
    );

    console.log(
      "[GeminiVoiceProvider] Transcript:",
      text,
    );

    const response =
      await ai.models.generateContent({
        model:
          DEFAULT_MODEL,

        /*
         * Plain transcript only.
         */
        contents: text,

        config: {
          responseModalities: [
            "AUDIO",
          ],

          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName:
                  selectedVoice,
              },
            },
          },
        },
      });

    const audioPart =
      response.candidates?.[0]
        ?.content?.parts?.find(
          (part) =>
            typeof part.inlineData?.data ===
              "string" &&
            part.inlineData.data.length > 0,
        );

    const audioData =
      audioPart?.inlineData?.data;

    if (!audioData) {
      throw new Error(
        "Gemini did not return audio data.",
      );
    }

    const pcmBuffer =
      Buffer.from(
        audioData,
        "base64",
      );

    if (
      pcmBuffer.length === 0
    ) {
      throw new Error(
        "Gemini returned empty audio data.",
      );
    }

    console.log(
      "[GeminiVoiceProvider] PCM bytes:",
      pcmBuffer.length,
    );

    const wavBuffer =
      createWavBuffer(
        pcmBuffer,
        24_000,
        1,
        16,
      );

    const fileName =
      `${randomUUID()}.wav`;

    const audioPath =
      path.join(
        AUDIO_UPLOAD_DIR,
        fileName,
      );

    await writeFile(
      audioPath,
      wavBuffer,
    );

    console.log(
      "[GeminiVoiceProvider] WAV audio saved successfully:",
      audioPath,
    );

    return {
      audio:
        `/uploads/audio/${fileName}`,
    };
  }
}

export const createGeminiVoiceProvider =
  () =>
    new GeminiVoiceProvider();