export type StoryCharacterReference = {
  imageUrl?: string;
  imageKey?: string;
  source?: string;
};

export type StoryGender =
  | "male"
  | "female"
  | "unknown";

export type StoryAgeGroup =
  | "child"
  | "teen"
  | "adult"
  | "elderly"
  | "unknown";

export type StoryVoiceGender =
  | "male"
  | "female"
  | "neutral";

export type StoryVoiceCategory =
  | "male_child"
  | "female_child"
  | "male_teen"
  | "female_teen"
  | "male_adult"
  | "female_adult"
  | "male_elderly"
  | "female_elderly"
  | "neutral"
  | "unknown"
  | "none";

export type StoryVoiceProfile = {
  gender: StoryVoiceGender;
  ageGroup: StoryAgeGroup;
  category: StoryVoiceCategory;
  voiceId?: string;
};

export type StoryCharacter = {
  id: string;
  name: string;
  role: string;
  gender: StoryGender;
  ageGroup: StoryAgeGroup;
  personality: string;
  voiceProfile: StoryVoiceProfile;
  visualDescription: string;
  imagePrompt: string;
  imageUrl?: string;
  reference?: StoryCharacterReference;
};

export type StoryEmotion = string;
export type StoryExpression = string;
export type StoryAction = string;
export type StoryBodyLanguage = string;

export type StoryDialogueLine = {
  /**
   * Stable identifier used to associate dialogue with semantic story events.
   */
  id?: string;
  characterId: string;
  text: string;
  emotion?: string;
  delivery?: string;
};

export type StoryEventImportance =
  | "essential"
  | "supporting";

export type StoryEvent = {
  /**
   * Stable semantic event identifier.
   */
  id: string;

  /**
   * Chronological order in the original story.
   */
  sequence: number;

  /**
   * Primary character who performs the event.
   */
  actorCharacterId: string;

  /**
   * Plain-language semantic action.
   */
  action: string;

  /**
   * Optional character affected by the action.
   */
  targetCharacterId?: string;

  /**
   * Optional object involved in the event.
   */
  object?: string;

  /**
   * Emotional state during the event.
   */
  emotion: StoryEmotion;

  /**
   * Observable facial expression during the event.
   */
  expression: StoryExpression;

  /**
   * Observable physical gestures/body movement.
   */
  bodyLanguage: StoryBodyLanguage[];

  /**
   * Visible state before the event.
   */
  beforeState: string;

  /**
   * Visible state after the event.
   */
  afterState: string;

  /**
   * Dialogue lines that belong to or directly support this event.
   */
  dialogueIds: string[];

  /**
   * Location when it is materially different or important.
   */
  location?: string;

  /**
   * Importance for later beat planning.
   */
  importance: StoryEventImportance;
};

export type StoryCharacterScenePlan = {
  characterId: string;
  actions: StoryAction[];
  emotion: StoryEmotion;
  expression: StoryExpression;
  bodyLanguage: StoryBodyLanguage[];
  startState: string;
  endState: string;
};

export type StoryContinuity = {
  previousSceneNumber?: number;
  inheritedCharacterStates: Record<string, string>;
  locationContinues: boolean;
  requiredContinuity: string[];
};

export type StoryScene = {
  sceneNumber: number;
  id: string;

  /**
   * Canonical semantic events assigned to this beat by the Beat Planner.
   * Event IDs refer to StoryManifest.storyEvents.
   */
  eventIds?: string[];

  title: string;
  description: string;
  narration: string;
  dialogue: StoryDialogueLine[];
  durationSeconds: number;
  location: string;
  visibleCharacterIds: string[];
  actions: string[];
  characterPlans: StoryCharacterScenePlan[];
  startState: string;
  endState: string;
  continuity: StoryContinuity;
};

export type StoryLanguage =
  | "English (US)"
  | "English (UK)"
  | "Hindi"
  | "Punjabi"
  | "Spanish"
  | "French"
  | "German"
  | "Japanese"
  | "Korean";

export type StoryAnalysisOptions = {
  /**
   * Target total storyboard duration selected by the user.
   *
   * The semantic analysis itself does not force scene count or
   * 5-second clipping. Later beat planning owns that responsibility.
   */
  requestedDurationSeconds?: 15 | 30 | 60;

  /**
   * Target spoken-language output selected by the user.
   *
   * This controls generated narration/dialogue language.
   */
  language?: StoryLanguage;
};

export type StoryManifest = {
  version: 1;
  title: string;
  summary: string;
  requestedDurationSeconds?: 15 | 30 | 60;
  characters: StoryCharacter[];

  /**
   * Canonical semantic representation of what actually happens in the story.
   *
   * This is the source of truth for later beat planning.
   */
  storyEvents: StoryEvent[];

  /**
   * Provisional visual beats retained for backward compatibility.
   *
   * Later Clip/Beat Planning is responsible for fitting these events into
   * exact 5-second clips.
   */
  storyBeats: StoryScene[];
};

export type StoryAnalysisResult = StoryManifest;

export interface StoryAnalysisProvider {
  analyzeStory(
    story: string,
    options?: StoryAnalysisOptions,
  ): Promise<StoryAnalysisResult>;
}
