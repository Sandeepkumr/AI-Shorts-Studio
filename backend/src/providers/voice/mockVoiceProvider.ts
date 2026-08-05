import type { VoiceGenerationResult, VoiceProvider } from "./voiceProvider.js";

export class MockVoiceProvider implements VoiceProvider {
  async generateVoice(
    _script: string,
    _voice: string,
  ): Promise<VoiceGenerationResult> {
    return {
      audio: "mock.mp3",
    };
  }
}
