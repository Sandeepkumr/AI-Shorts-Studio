import { MockVoiceProvider } from "../providers/voice/mockVoiceProvider.js";
import type {
  VoiceGenerationResult,
  VoiceProvider,
} from "../providers/voice/voiceProvider.js";

export type { VoiceGenerationResult } from "../providers/voice/voiceProvider.js";

export class VoiceService {
  constructor(private readonly provider: VoiceProvider = new MockVoiceProvider()) {}

  async generateVoice(
    script?: string,
    voice?: string,
  ): Promise<VoiceGenerationResult> {
    return this.provider.generateVoice(
      script?.trim() || "Mock narration script.",
      voice?.trim() || "Emma",
    );
  }
}

export const createVoiceService = (provider?: VoiceProvider) =>
  new VoiceService(provider);

export const voiceService = createVoiceService();
