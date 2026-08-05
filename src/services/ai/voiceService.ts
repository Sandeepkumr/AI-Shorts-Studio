export type VoiceAccent = "primary" | "secondary" | "success" | "warning";

export type VoiceProfile = {
  id: string;
  name: string;
  description: string;
  language: string;
  initials: string;
  accent: VoiceAccent;
};

export type VoiceGenerationStep =
  | "Preparing narration..."
  | "Generating speech..."
  | "Synchronizing timing..."
  | "Finalizing...";

export type VoiceGenerationResult = {
  voice: VoiceProfile;
  duration: string;
};

type GenerateVoiceOptions = {
  script: string;
  voiceId: string;
  onProgress?: (stepIndex: number) => void;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const voices: VoiceProfile[] = [
  {
    id: "emma",
    name: "Emma",
    description: "Warm • Friendly",
    language: "English (US)",
    initials: "EM",
    accent: "primary",
  },
  {
    id: "james",
    name: "James",
    description: "Professional • Deep",
    language: "English (UK)",
    initials: "JA",
    accent: "secondary",
  },
  {
    id: "sophia",
    name: "Sophia",
    description: "Young • Energetic",
    language: "English (US)",
    initials: "SO",
    accent: "success",
  },
  {
    id: "michael",
    name: "Michael",
    description: "Documentary • Calm",
    language: "English (US)",
    initials: "MI",
    accent: "warning",
  },
];

const generationSteps: VoiceGenerationStep[] = [
  "Preparing narration...",
  "Generating speech...",
  "Synchronizing timing...",
  "Finalizing...",
];

const getVoice = (voiceId: string) =>
  voices.find((voice) => voice.id === voiceId) ?? voices[0];

export const voiceService = {
  async getVoices(): Promise<VoiceProfile[]> {
    await wait(120);
    return voices;
  },

  async getVoiceById(voiceId: string): Promise<VoiceProfile> {
    await wait(80);
    return getVoice(voiceId);
  },

  async previewVoice(voiceId: string): Promise<VoiceProfile> {
    await wait(2000);
    return getVoice(voiceId);
  },

  async getGenerationSteps(): Promise<VoiceGenerationStep[]> {
    return generationSteps;
  },

  async generateVoice({
    script: _script,
    voiceId,
    onProgress,
  }: GenerateVoiceOptions): Promise<VoiceGenerationResult> {
    onProgress?.(0);

    for (let stepIndex = 1; stepIndex < generationSteps.length; stepIndex += 1) {
      await wait(650);
      onProgress?.(stepIndex);
    }

    await wait(1050);

    return {
      duration: "00:14",
      voice: getVoice(voiceId),
    };
  },

  async playPreview(voiceId: string): Promise<VoiceProfile> {
    await wait(3000);
    return getVoice(voiceId);
  },
};
