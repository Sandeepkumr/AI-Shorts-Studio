export type VoiceGenerationResult = {
  audio: string;
};

export interface VoiceProvider {
  generateVoice(script: string, voice: string): Promise<VoiceGenerationResult>;
}
