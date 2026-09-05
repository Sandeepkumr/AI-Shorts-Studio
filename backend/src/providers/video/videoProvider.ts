export type VideoVoice =
  | "auto"
  | "male"
  | "female"
  | "none";

export type VideoStyle =
  | "3d"
  | "cinematic"
  | "realistic"
  | "anime"
  | "cartoon";

export type VideoCamera =
  | "auto"
  | "cinematic"
  | "close-up"
  | "wide"
  | "dynamic";

export type VideoLanguage =
  | "English (US)"
  | "English (UK)"
  | "Hindi"
  | "Punjabi"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Korean";

export type VideoCharacter = {
  id: string;
  name: string;
  role: string;
  visualDescription: string;
  imageUrl?: string;
};

export type VideoScenePlan = {
  sceneNumber: number;

  /**
   * Stable identifier for the story beat / clip plan.
   */
  id?: string;

  title: string;

  description: string;

  narration: string;

  /**
   * Planning duration.
   *
   * The actual generated video clip is still controlled
   * by the video service and is currently 5 seconds.
   */
  durationSeconds: number;

  /**
   * Location/environment for this scene.
   */
  location?: string;

  /**
   * Characters that are explicitly visible in this scene.
   */
  visibleCharacterIds: string[];

  /**
   * Ordered scene-level actions.
   *
   * Kept for backward compatibility with the current
   * video generation pipeline.
   */
  actions: string[];

  /**
   * Detailed per-character intelligence.
   */
  characterPlans?: Array<{
    characterId: string;

    actions: string[];

    emotion: string;

    expression: string;

    bodyLanguage: string[];

    startState: string;

    endState: string;
  }>;

  /**
   * Continuity information from Story Analysis / Clip Planner.
   */
  continuity?: {
    previousSceneNumber?: number;

    inheritedCharacterStates: Record<
      string,
      string
    >;

    locationContinues: boolean;

    requiredContinuity: string[];
  };

  /**
   * Visible scene state at the beginning.
   */
  startState: string;

  /**
   * Visible scene state that must be reached at the end.
   */
  endState: string;
};

export type VideoGenerationOptions = {
  prompt?: string;

  model?: string;

  aspectRatio?:
    | "16:9"
    | "9:16"
    | "1:1";

  resolution?:
    | "480p"
    | "580p"
    | "720p"
    | "1080p"
    | "4k";

  durationSeconds?: number;

  sceneNumber?: number;

  referenceImageUrl?: string;

  narration?: string;

  voice?: VideoVoice;

  language?: VideoLanguage;

  style?: VideoStyle;

  camera?: VideoCamera;

  appearance?: string;

  characters?: VideoCharacter[];

  /**
   * Backward-compatible plain-text scene prompts.
   *
   * Existing providers may still use this.
   */
  scenePrompts?: string[];

  /**
   * Structured scene plans produced by Story Analysis
   * and later refined by the Clip Planner.
   *
   * This is the preferred source for scene generation.
   */
  scenePlans?: VideoScenePlan[];
};

export type VideoGenerationResult = {
  video: string;

  durationSeconds?: number;

  model?: string;

  sceneNumber?: number;
};

export interface VideoProvider {
  generateVideo(
    options?: VideoGenerationOptions,
  ): Promise<VideoGenerationResult>;
}