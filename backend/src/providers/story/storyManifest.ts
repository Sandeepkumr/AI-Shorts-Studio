export type StoryCharacterReference = {
  /**
   * Stable reference information resolved later by the
   * character/image pipeline.
   */
  imageUrl?: string;
  imageKey?: string;
  source?: string;
};

export type StoryCharacter = {
  /**
   * Stable identity ID for the character across the full story.
   */
  id: string;

  name: string;

  role: string;

  /**
   * Permanent visual identity description.
   */
  visualDescription: string;

  /**
   * Prompt used later when a character reference image
   * needs to be generated.
   */
  imagePrompt: string;

  /**
   * Runtime-resolved image URL.
   * Story analysis itself does not create this.
   */
  imageUrl?: string;

  /**
   * Optional resolved character reference metadata.
   */
  reference?: StoryCharacterReference;
};

export type StoryEmotion =
  | string;

export type StoryExpression =
  | string;

export type StoryAction =
  | string;

export type StoryBodyLanguage =
  | string;

export type StoryCharacterScenePlan = {
  /**
   * Must reference an ID from StoryAnalysisResult.characters.
   */
  characterId: string;

  /**
   * Ordered physical actions performed by this character.
   */
  actions: StoryAction[];

  /**
   * Dominant emotional state during this beat.
   */
  emotion: StoryEmotion;

  /**
   * Visible facial expression.
   */
  expression: StoryExpression;

  /**
   * Visible physical/body-language cues.
   */
  bodyLanguage: StoryBodyLanguage[];

  /**
   * Visible physical state at the beginning
   * of this character's participation.
   */
  startState: string;

  /**
   * Visible physical state this character should reach
   * before the beat ends.
   */
  endState: string;
};

export type StoryContinuity = {
  /**
   * Previous story beat/scene number.
   */
  previousSceneNumber?: number;

  /**
   * Character states that must be carried forward
   * from the previous beat.
   *
   * Example:
   * {
   *   "character-1": "standing near the doorway"
   * }
   */
  inheritedCharacterStates: Record<
    string,
    string
  >;

  /**
   * Whether the location/environment should continue
   * visually from the previous beat.
   */
  locationContinues: boolean;

  /**
   * Important continuity constraints that must not be broken.
   */
  requiredContinuity: string[];
};

export type StoryScene = {
  sceneNumber: number;

  /**
   * Stable beat identifier.
   */
  id: string;

  title: string;

  description: string;

  narration: string;

  /**
   * Duration hint for this story beat.
   * This is NOT the final generated clip duration.
   */
  durationSeconds: number;

  /**
   * Location/environment for this story beat.
   */
  location: string;

  /**
   * Characters visibly present in the beat.
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
   * Detailed intelligence for each visible character.
   */
  characterPlans: StoryCharacterScenePlan[];

  /**
   * Scene-level physical state at the beginning.
   *
   * Kept for backward compatibility.
   */
  startState: string;

  /**
   * Scene-level physical state at the end.
   *
   * Kept for backward compatibility.
   */
  endState: string;

  /**
   * Continuity relationship with the previous beat.
   */
  continuity: StoryContinuity;
};

export type StoryManifest = {
  /**
   * Manifest version allows the schema to evolve safely later.
   */
  version: 1;

  title: string;

  summary: string;

  /**
   * User-requested final video duration.
   *
   * This is metadata only.
   * Story beats are not clips.
   */
  requestedDurationSeconds?: 15 | 30 | 60;

  characters: StoryCharacter[];

  /**
   * IMPORTANT:
   * These are STORY BEATS, not generated video clips.
   */
  storyBeats: StoryScene[];
};

export type StoryAnalysisResult = StoryManifest;

export interface StoryAnalysisProvider {
  analyzeStory(
    story: string,
  ): Promise<StoryAnalysisResult>;
}