import OpenAI from "openai";

import type {
  StoryAnalysisOptions,
  StoryAnalysisResult,
  StoryAnalysisProvider,
  StoryCharacter,
  StoryCharacterScenePlan,
  StoryContinuity,
  StoryDialogueLine,
  StoryEvent,
  StoryScene,
} from "./storyAnalysisProvider.js";

const STORY_OPTIMIZATION_MODEL =
  process.env.OPENAI_STORY_MODEL ||
  "gpt-4.1-mini";

const MAX_RETRIES = 3;
const MAX_CHOREOGRAPHY_REPAIRS = 2;

const RETRY_DELAYS_MS = [
  2_000,
  4_000,
  8_000,
];

const MIN_SCENE_DURATION = 3;
const MAX_SCENE_DURATION = 10;

const systemInstruction = `
You are a senior storyboard optimization engine for an AI video generator.

You receive:
1. The original user story.
2. An existing structured story analysis.
3. A target video duration.
4. A target spoken language.

Your job is to RE-PLAN the storyboard so it fits the user's selected target duration as closely as possible while preserving the original story.

Return ONLY valid JSON.

Return this exact structure:

{
  "version": 1,
  "title": "string",
  "summary": "string",
  "requestedDurationSeconds": 15,
  "characters": [],
  "storyEvents": [],
  "storyBeats": []
}

Each storyBeat MUST also contain an optional eventIds array containing the exact IDs of the canonical storyEvents represented in that beat.

STORYBOARD OPTIMIZATION RULES

- Preserve the original story meaning.
- Preserve all important story events.
- Do not invent unrelated events.
- Do not add filler just to increase duration.
- Do not blindly compress every existing scene.
- Re-plan the number of scenes when necessary.
- Merge related events when that improves pacing.
- Remove redundant beats when necessary.
- Keep the important beginning, action/conflict, and ending.
- Every scene must move the story forward.
- Every scene must be visually useful for animation.
- Every scene must contain observable actions.
- Keep the story coherent from beginning to end.

VISUAL CHOREOGRAPHY RULES

- Design every story beat for a 5-second image-to-video clip.
- Each beat should contain ONE primary visual action and at most ONE small supporting action.
- Actions must describe what a camera can visibly verify, not an intention, interpretation, or outcome.
- Write actions as atomic physical choreography with a clear subject, object, direction, and result whenever relevant.
- Prefer: "The shopkeeper lifts the fries container and holds it toward the customer."
- Avoid: "The shopkeeper offers fries."
- Prefer: "The customer shakes his head left-to-right twice and raises one open hand to refuse."
- Avoid: "The customer politely declines."
- Prefer explicit object ownership and transfer states: who holds the object, who reaches for it, and whether the object changes hands.
- Never describe an implied action as completed unless it is meant to be visibly shown.
- Do not combine a refusal with an acceptance, handoff, or unrelated action in the same beat unless the story explicitly requires both.
- If a beat contains an interaction with an object, specify the object's visible state at the start and end.
- Make every important reaction physically visible through a concrete gesture, pose, gaze direction, or facial expression.
- EndState must describe a single, stable, camera-visible pose/state that can cleanly become the next beat's startState.
- Adjacent beats must not contradict object ownership, character position, or physical state.
- For continuation, the next beat may change only what its actions explicitly change.
- Character plans must assign each action to the character who physically performs it. Never copy another character's action into a character plan.
- When an action involves two characters, separate their physical behaviors explicitly (for example: one extends an object; the other shakes their head and keeps hands away).
- Avoid generic phrases such as "interacts with", "responds", "politely declines", "prepares", "shows excitement", or "handles the situation" unless they are followed by the exact visible physical behavior.
- Do not rely on dialogue alone to communicate a physical action; the action must be visible even with audio muted.
- Preserve character identity and stable character IDs.
- Preserve important character visual traits.
- Preserve character gender, ageGroup, personality, and voiceProfile exactly when already established by Story Analysis.
- Never invent, remove, reorder, or rewrite the semantic storyEvents. They are the canonical representation of what happens in the user's story and must be carried forward unchanged.
- Use storyEvents as the source of truth for story meaning; storyBeats are only the timed visual presentation of those events.
- Every canonical storyEvent must be assigned to exactly one storyBeat through eventIds. Never invent event IDs, omit an event, duplicate an event across multiple beats, reorder event sequence, or rewrite the event's semantic meaning.
- eventIds must reference the exact canonical storyEvents supplied in the analysis.
- A beat may contain multiple eventIds only when those events are tightly coupled micro-events that can be shown coherently within the same 5-second shot without exceeding the physical-action budget.
- Do not solve too many events in one beat by creating a long action chain. Use the beat's startState/endState to carry the stable result of an event when appropriate.
- CharacterPlans and scene.actions are derived visual choreography for the assigned eventIds; they are not an alternate source of story meaning.
- Preserve continuity between scenes.

DURATION RULES

The sum of all storyBeats.durationSeconds MUST be as close as possible to the target duration.

Target duration is a HARD STORYBOARD PLANNING CONSTRAINT.

Allowed per-scene duration:
- minimum 3 seconds
- maximum 10 seconds

For 15 seconds:
- Prefer EXACTLY 3 story beats, each about 5 seconds.
- Each beat should represent one visually coherent clip-sized moment.
- Keep dialogue especially concise.

For 30 seconds:
- Prefer EXACTLY 6 story beats, each about 5 seconds.

For 60 seconds:
- Prefer EXACTLY 12 story beats, each about 5 seconds.

Prefer one story beat per 5-second generated video clip. Do not pack multiple major actions into one beat.
Never create filler beats.

Never remove an important story event merely to satisfy timing.

DIALOGUE RULES

- Preserve the original intended dialogue meaning.
- Keep dialogue realistic for the scene duration.
- Never overload a short scene with too many words.
- Every dialogue line must belong to a valid character.
- Preserve dialogue IDs when supplied by the semantic analysis; do not invent new dialogue identities unnecessarily.
- Keep character IDs unchanged.
- "emotion" describes the emotional state.
- "delivery" describes how the line is spoken.

LANGUAGE RULES

The selected target language applies to:
- dialogue text
- narration
- title when natural
- summary when natural

Do NOT translate:
- character IDs
- technical identifiers

Character names should remain consistent with the original story.

Visual descriptions, action descriptions, character states,
continuity instructions, and image prompts may remain in English
so downstream visual systems remain stable.

For visual-generation safety, use generic descriptive identity language rather
than exact franchise names, logos, emblems, or branded costume names inside
visual fields. Story/dialogue/title text may retain the user's original
character name where necessary for narrative continuity.

CHARACTER RULES

- Preserve existing characters unless the original analysis clearly contains an invalid character.
- Do not create unnecessary new characters.
- Do not remove a plot-important character.
- Keep stable IDs.
- Character visual descriptions should remain consistent.
- The character name may remain unchanged for story/dialogue continuity.
- For visual-generation fields (visualDescription, imagePrompt, scene description, actions, startState, endState, and continuity), do NOT require exact reproduction of a real-world copyrighted, trademarked, branded, or franchise character.
- When the story names a well-known fictional/franchise character, express the visual identity as an original fictional character using generic visual traits (for example: costume colors, mask, hairstyle, body type, accessories, role, and behavior) rather than relying on the exact franchise identity, logo, emblem, or signature branded costume.
- Never add logos, brand marks, trademarked emblems, franchise text, or recognizable branding to visual-generation descriptions.
- Preserve the story event and the user's intended character role even when the visual representation is generalized for generation safety.

SCENE STRUCTURE RULES

Every storyBeat must contain:

{
  "sceneNumber": 1,
  "id": "scene-1",
  "title": "string",
  "description": "string",
  "narration": "string",
  "dialogue": [],
  "durationSeconds": 5,
  "location": "string",
  "eventIds": ["event-1"],
  "visibleCharacterIds": [],
  "actions": [],
  "characterPlans": [],
  "startState": "string",
  "endState": "string",
  "continuity": {
    "previousSceneNumber": 0,
    "inheritedCharacterStates": {},
    "locationContinues": false,
    "requiredContinuity": []
  }
}

Every visible character MUST have exactly one character plan.

Every character plan MUST contain:
- characterId
- actions
- emotion
- expression
- bodyLanguage
- startState
- endState

CONTINUITY RULES

- Scene 1 has no previous scene.
- Scene 2 references scene 1.
- Scene 3 references scene 2.
- Continue sequentially.
- Do not break character states without explaining the transition.
- Preserve location continuity when appropriate.

GENERAL OUTPUT RULES

- Return JSON only.
- No markdown.
- No commentary.
- No code fences.
`;

const sleep = (
  milliseconds: number,
) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, milliseconds),
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
    message.includes(
      "temporarily unavailable",
    ) ||
    message.includes(
      "service unavailable",
    ) ||
    message.includes("overloaded") ||
    message.includes("timeout")
  );
};

const isObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const toNonEmptyString = (
  value: unknown,
  fallback: string,
): string =>
  typeof value === "string" &&
  value.trim().length > 0
    ? value.trim()
    : fallback;

const toStringArray = (
  value: unknown,
): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter(Boolean);
};

const uniqueStrings = (
  values: string[],
): string[] =>
  Array.from(
    new Set(values),
  );

const sanitizeVisualText = (
  value: string,
): string => {
  const replacements: Array<[RegExp, string]> = [
    [/\\bSpider[- ]?Man\\b/gi, "masked red-and-blue spider-themed superhero"],
    [/\\bIron\\s*Man\\b/gi, "armored red-and-gold superhero"],
    [/\\bSuperman\\b/gi, "caped blue-suited flying superhero"],
    [/\\bBatman\\b/gi, "masked dark-suited vigilante"],
    [/\\bWonder\\s*Woman\\b/gi, "powerful armored heroine with a heroic costume"],
    [/\\bHulk\\b/gi, "large muscular green superhuman"],
  ];

  let result = value;

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  // Common Hindi spelling encountered in generated scene descriptions.
  result = result
    .replace(/स्पाइडर[-‐‑–— ]?मैन/gi, "लाल-नीले मास्क वाले स्पाइडर-थीम वाले सुपरहीरो")
    .replace(/सुपरमैन/gi, "केप पहने नीले सूट वाला उड़ने वाला सुपरहीरो")
    .replace(/बैटमैन/gi, "डार्क मास्क पहना हुआ नकाबपोश रक्षक");

  return result.trim();
};

const toDuration = (
  value: unknown,
  fallback = 5,
): number => {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(
    MAX_SCENE_DURATION,
    Math.max(
      MIN_SCENE_DURATION,
      Math.round(parsed),
    ),
  );
};


const normalizeCharacterGender = (
  value: unknown,
  fallback: StoryCharacter["gender"] = "unknown",
): StoryCharacter["gender"] => {
  if (
    value === "male" ||
    value === "female" ||
    value === "unknown"
  ) {
    return value;
  }

  return fallback;
};

const normalizeCharacterAgeGroup = (
  value: unknown,
  fallback: StoryCharacter["ageGroup"] = "unknown",
): StoryCharacter["ageGroup"] => {
  if (
    value === "child" ||
    value === "teen" ||
    value === "adult" ||
    value === "elderly" ||
    value === "unknown"
  ) {
    return value;
  }

  return fallback;
};

const normalizeVoiceProfile = (
  value: unknown,
  fallback: StoryCharacter["voiceProfile"],
): StoryCharacter["voiceProfile"] => {
  if (!isObject(value)) {
    return fallback;
  }

  const gender =
    value.gender === "male" ||
    value.gender === "female" ||
    value.gender === "neutral"
      ? value.gender
      : fallback.gender;

  const ageGroup = normalizeCharacterAgeGroup(
    value.ageGroup,
    fallback.ageGroup,
  );

  const category =
    value.category === "male_child" ||
    value.category === "female_child" ||
    value.category === "male_teen" ||
    value.category === "female_teen" ||
    value.category === "male_adult" ||
    value.category === "female_adult" ||
    value.category === "male_elderly" ||
    value.category === "female_elderly" ||
    value.category === "neutral" ||
    value.category === "unknown" ||
    value.category === "none"
      ? value.category
      : fallback.category;

  return {
    gender,
    ageGroup,
    category,
    voiceId:
      typeof value.voiceId === "string" &&
      value.voiceId.trim()
        ? value.voiceId.trim()
        : fallback.voiceId,
  };
};

const getFallbackCharacter = (
  characters: StoryCharacter[],
  index: number,
): StoryCharacter | undefined =>
  characters[index];

const normalizeDialogue = (
  value: unknown,
  characterIds: Set<string>,
): StoryDialogueLine[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: Array<
    StoryDialogueLine | null
  > = value.map(
    (line, index): StoryDialogueLine | null => {
      if (!isObject(line)) {
        return null;
      }

      const characterId =
        toNonEmptyString(
          line.characterId,
          "",
        );

      const text =
        toNonEmptyString(
          line.text,
          "",
        );

      if (
        !characterId ||
        !text ||
        !characterIds.has(
          characterId,
        )
      ) {
        return null;
      }

      const normalizedLine:
        StoryDialogueLine = {
        id:
          toNonEmptyString(
            line.id,
            `dialogue-${index + 1}`,
          ),
        characterId,
        text,
        emotion:
          toNonEmptyString(
            line.emotion,
            "neutral",
          ),
        delivery:
          toNonEmptyString(
            line.delivery,
            "natural",
          ),
      };

      return normalizedLine;
    },
  );

  return normalized.filter(
    (
      line,
    ): line is StoryDialogueLine =>
      line !== null,
  );
};

const normalizeActionTokens = (
  value: string,
): Set<string> =>
  new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(
        (token) =>
          token.length >= 3 &&
          !new Set(["the","a","an","and","then","with","while","into","toward","from","their","his","her","its"]).has(token),
      )
      .map(
        (token) =>
          ({"grabs":"grab","holds":"hold","holding":"hold","picks":"pick","picking":"pick","takes":"take","taking":"take","looks":"look","looking":"look","turns":"turn","turning":"turn","walks":"walk","walking":"walk","runs":"run","running":"run","sits":"sit","sitting":"sit","stands":"stand","standing":"stand","opens":"open","opening":"open","closes":"close","closing":"close","reaches":"reach","reaching":"reach","points":"point","pointing":"point","smiles":"smile","smiling":"smile","speaks":"speak","speaking":"speak"} as Record<string,string>)[token] ??
          token,
      ),
  );

const actionSimilarityScore = (
  first: string,
  second: string,
): number => {
  const firstTokens = normalizeActionTokens(first);
  const secondTokens = normalizeActionTokens(second);

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  }

  return (
    intersection /
    Math.max(
      firstTokens.size,
      secondTokens.size,
    )
  );
};

const selectCharacterPlanActions = (
  rawActions: string[],
  sceneActions: string[],
): string[] => {
  const uniqueRawActions =
    uniqueStrings(rawActions);

  if (
    uniqueRawActions.length <= 2
  ) {
    return uniqueRawActions;
  }

  if (
    sceneActions.length === 0
  ) {
    return uniqueRawActions.slice(
      0,
      2,
    );
  }

  /*
   * CharacterPlans are a decomposition of scene.actions.
   * They must never introduce a third/fourth independent
   * physical action for the same 5-second beat.
   *
   * Prefer the character's own actions that best correspond
   * to the authoritative beat-level actions.
   */
  const ranked =
    uniqueRawActions
      .map((action, index) => {
        let bestScore = 0;

        for (const sceneAction of sceneActions) {
          bestScore = Math.max(
            bestScore,
            actionSimilarityScore(
              action,
              sceneAction,
            ),
          );
        }

        return {
          action,
          index,
          score: bestScore,
        };
      })
      .sort(
        (left, right) =>
          right.score -
          left.score ||
          left.index -
          right.index,
      );

  const selected =
    ranked
      .slice(0, 2)
      .map(
        (item) =>
          item.action,
      );

  return uniqueStrings(
    selected,
  ).slice(
    0,
    2,
  );
};

const normalizeCharacterPlans = (
  value: unknown,
  visibleCharacterIds: string[],
  characters: StoryCharacter[],
  actions: string[],
  startState: string,
  endState: string,
): StoryCharacterScenePlan[] => {
  const rawPlans =
    Array.isArray(value)
      ? value
      : [];

  const knownCharacterIds =
    new Set(
      characters.map(
        (character) =>
          character.id,
      ),
    );

  const normalizedSceneActions =
    uniqueStrings(actions).slice(
      0,
      2,
    );

  return visibleCharacterIds.map(
    (characterId) => {
      const rawPlan =
        rawPlans.find(
          (item) =>
            isObject(item) &&
            item.characterId ===
              characterId,
        );

      const plan =
        isObject(rawPlan)
          ? rawPlan
          : {};

      const rawPlanActions =
        uniqueStrings(
          toStringArray(
            plan.actions,
          ),
        );

      const planActions =
        selectCharacterPlanActions(
          rawPlanActions,
          normalizedSceneActions,
        );

      const bodyLanguage =
        uniqueStrings(
          toStringArray(
            plan.bodyLanguage,
          ),
        );

      return {
        characterId:
          knownCharacterIds.has(
            characterId,
          )
            ? characterId
            : visibleCharacterIds[0],

        actions:
          planActions,

        emotion:
          toNonEmptyString(
            plan.emotion,
            "neutral",
          ),

        expression:
          toNonEmptyString(
            plan.expression,
            "natural",
          ),

        bodyLanguage:
          bodyLanguage.length > 0
            ? bodyLanguage
            : [],

        startState:
          toNonEmptyString(
            plan.startState,
            startState,
          ),

        endState:
          toNonEmptyString(
            plan.endState,
            endState,
          ),
      };
    },
  );
};


const normalizeContinuity = (
  value: unknown,
  sceneNumber: number,
  location: string,
): StoryContinuity => {
  const continuity =
    isObject(value)
      ? value
      : {};

  const previousSceneNumber =
    sceneNumber === 1
      ? undefined
      : sceneNumber - 1;

  const inheritedStates =
    isObject(
      continuity.inheritedCharacterStates,
    )
      ? continuity.inheritedCharacterStates
      : {};

  const inheritedCharacterStates:
    Record<string, string> = {};

  for (
    const [
      characterId,
      state,
    ] of Object.entries(
      inheritedStates,
    )
  ) {
    if (
      typeof state === "string" &&
      state.trim()
    ) {
      inheritedCharacterStates[
        characterId
      ] = state.trim();
    }
  }

  const requiredContinuity =
    uniqueStrings(
      toStringArray(
        continuity.requiredContinuity,
      ),
    );

  return {
    previousSceneNumber,
    inheritedCharacterStates,
    locationContinues:
      typeof continuity.locationContinues ===
      "boolean"
        ? continuity.locationContinues
        : sceneNumber > 1,

    requiredContinuity:
      requiredContinuity.length > 0
        ? requiredContinuity
        : location
          ? [
              `Maintain visual consistency with the established location: ${location}.`,
            ]
          : [],
  };
};

const normalizeScene = (
  value: unknown,
  index: number,
  characters: StoryCharacter[],
): StoryScene => {
  const scene =
    isObject(value)
      ? value
      : {};

  const sceneNumber =
    index + 1;

  const description =
    toNonEmptyString(
      scene.description,
      "A cinematic scene that advances the story.",
    );

  const location =
    toNonEmptyString(
      scene.location,
      "A suitable story location.",
    );

  const startState =
    toNonEmptyString(
      scene.startState,
      "The scene begins naturally.",
    );

  const endState =
    toNonEmptyString(
      scene.endState,
      "The scene ends in a clear story state.",
    );

  const actions =
    uniqueStrings(
      toStringArray(
        scene.actions,
      ),
    );

  const eventIds =
    uniqueStrings(
      toStringArray(
        scene.eventIds,
      ),
    );

  const normalizedActions = actions.slice(0, 2);

  const knownCharacterIds =
    new Set(
      characters.map(
        (character) =>
          character.id,
      ),
    );

  const visibleCharacterIds =
    uniqueStrings(
      toStringArray(
        scene.visibleCharacterIds,
      ).filter((id) =>
        knownCharacterIds.has(
          id,
        ),
      ),
    );

  const normalizedVisibleCharacters =
    visibleCharacterIds.length > 0
      ? visibleCharacterIds
      : characters.length > 0
        ? [characters[0].id]
        : [];

  return {
    sceneNumber,

    id:
      toNonEmptyString(
        scene.id,
        `scene-${sceneNumber}`,
      ),

    title:
      toNonEmptyString(
        scene.title,
        `Scene ${sceneNumber}`,
      ),

    description,

    narration:
      toNonEmptyString(
        scene.narration,
        "",
      ),

    dialogue:
      normalizeDialogue(
        scene.dialogue,
        knownCharacterIds,
      ),

    durationSeconds:
      toDuration(
        scene.durationSeconds,
      ),

    location,

    eventIds,

    visibleCharacterIds:
      normalizedVisibleCharacters,

    actions:
      normalizedActions,

    characterPlans:
      normalizeCharacterPlans(
        scene.characterPlans,
        normalizedVisibleCharacters,
        characters,
        normalizedActions,
        startState,
        endState,
      ),

    startState,

    endState,

    continuity:
      normalizeContinuity(
        scene.continuity,
        sceneNumber,
        location,
      ),
  };
};

const rebalanceDurations = (
  scenes: StoryScene[],
  target: 15 | 30 | 60,
): StoryScene[] => {
  if (scenes.length === 0) {
    return scenes;
  }

  const result =
    scenes.map((scene) => ({
      ...scene,
      durationSeconds:
        toDuration(
          scene.durationSeconds,
        ),
    }));

  /*
   * The AI should do the real pacing.
   * This pass only fixes small rounding differences.
   */

  let total =
    result.reduce(
      (sum, scene) =>
        sum +
        scene.durationSeconds,
      0,
    );

  while (total < target) {
    const scene =
      result.find(
        (item) =>
          item.durationSeconds <
          MAX_SCENE_DURATION,
      );

    if (!scene) {
      break;
    }

    scene.durationSeconds += 1;
    total += 1;
  }

  while (total > target) {
    const scene =
      [...result]
        .reverse()
        .find(
          (item) =>
            item.durationSeconds >
            MIN_SCENE_DURATION,
        );

    if (!scene) {
      break;
    }

    scene.durationSeconds -= 1;
    total -= 1;
  }

  return result;
};


const requiredBeatCount = (
  target: 15 | 30 | 60,
): number => target / 5;

const getCanonicalStoryEvents = (
  analysis: StoryAnalysisResult,
): StoryEvent[] => {
  if (!Array.isArray(analysis.storyEvents)) {
    return [];
  }

  return analysis.storyEvents
    .filter((event): event is StoryEvent =>
      isObject(event) &&
      typeof event.id === "string" &&
      event.id.trim().length > 0 &&
      typeof event.sequence === "number" &&
      Number.isFinite(event.sequence) &&
      typeof event.actorCharacterId === "string" &&
      event.actorCharacterId.trim().length > 0,
    )
    .sort((a, b) => a.sequence - b.sequence);
};

const validateCanonicalStoryEvents = (
  analysis: StoryAnalysisResult,
): string[] => {
  const errors: string[] = [];
  const events = getCanonicalStoryEvents(analysis);

  if (events.length === 0) {
    errors.push(
      "Story analysis contains no canonical storyEvents. Step 2 requires semantic story events before beat planning.",
    );
    return errors;
  }

  const eventIds = events.map((event) => event.id);
  const uniqueIds = new Set(eventIds);

  if (uniqueIds.size !== eventIds.length) {
    errors.push("Story analysis contains duplicate canonical storyEvent IDs.");
  }

  const characterIds = new Set(
    analysis.characters.map((character) => character.id),
  );

  for (const event of events) {
    if (!characterIds.has(event.actorCharacterId)) {
      errors.push(
        `Story event ${event.id} references unknown actor character ${event.actorCharacterId}.`,
      );
    }

    if (
      event.targetCharacterId &&
      !characterIds.has(event.targetCharacterId)
    ) {
      errors.push(
        `Story event ${event.id} references unknown target character ${event.targetCharacterId}.`,
      );
    }
  }

  return errors;
};

const getEventById = (
  events: StoryEvent[],
): Map<string, StoryEvent> =>
  new Map(events.map((event) => [event.id, event]));

const buildEventAssignmentErrors = (
  analysis: StoryAnalysisResult,
  scenes: StoryScene[],
): string[] => {
  const errors: string[] = [];
  const events = getCanonicalStoryEvents(analysis);
  const eventsById = getEventById(events);
  const assignmentCounts = new Map<string, number>();

  for (let beatIndex = 0; beatIndex < scenes.length; beatIndex += 1) {
    const scene = scenes[beatIndex];
    const eventIds = scene.eventIds ?? [];
    const seenInBeat = new Set<string>();

    if (eventIds.length === 0) {
      errors.push(
        `Beat ${beatIndex + 1} has no eventIds. Every optimized beat must be grounded in at least one canonical story event.`,
      );
      continue;
    }

    for (const eventId of eventIds) {
      if (seenInBeat.has(eventId)) {
        errors.push(
          `Beat ${beatIndex + 1} references story event ${eventId} more than once.`,
        );
        continue;
      }

      seenInBeat.add(eventId);

      const event = eventsById.get(eventId);
      if (!event) {
        errors.push(
          `Beat ${beatIndex + 1} references unknown story event ${eventId}.`,
        );
        continue;
      }

      assignmentCounts.set(
        eventId,
        (assignmentCounts.get(eventId) ?? 0) + 1,
      );

      if (!scene.visibleCharacterIds.includes(event.actorCharacterId)) {
        errors.push(
          `Beat ${beatIndex + 1} assigns event ${eventId}, but its actor ${event.actorCharacterId} is not visible in that beat.`,
        );
      }

      if (
        event.targetCharacterId &&
        !scene.visibleCharacterIds.includes(event.targetCharacterId)
      ) {
        errors.push(
          `Beat ${beatIndex + 1} assigns event ${eventId}, but its target ${event.targetCharacterId} is not visible in that beat.`,
        );
      }
    }
  }

  for (const event of events) {
    const count = assignmentCounts.get(event.id) ?? 0;

    if (count === 0) {
      errors.push(
        `Canonical story event ${event.id} (sequence ${event.sequence}) was not assigned to any optimized beat: ${event.action}`,
      );
    } else if (count > 1) {
      errors.push(
        `Canonical story event ${event.id} was assigned to ${count} optimized beats. Each event must have exactly one beat assignment.`,
      );
    }
  }

  return errors;
};

const isExplicitVisualBehavior = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const genericValues = new Set([
    "neutral",
    "natural",
    "normal",
    "natural movement",
    "natural body movement",
    "none",
  ]);

  return !genericValues.has(normalized);
};

const validateClipSizedStoryboard = (
  scenes: StoryScene[],
  target: 15 | 30 | 60,
): string[] => {
  const errors: string[] = [];
  const expectedCount = requiredBeatCount(target);

  if (scenes.length !== expectedCount) {
    errors.push(
      `Target ${target}s requires exactly ${expectedCount} story beats, but ${scenes.length} were returned.`,
    );
  }

  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const actions = scene.actions.filter(Boolean);
    const planActions = scene.characterPlans.flatMap((plan) =>
      plan.actions.filter(Boolean),
    );
    const choreographyText = [
      ...actions,
      ...scene.characterPlans.flatMap((plan) => [
        ...plan.actions,
        plan.emotion,
        plan.expression,
        ...plan.bodyLanguage,
      ]),
    ].join(" ").toLowerCase();

    if (scene.durationSeconds !== 5) {
      errors.push(
        `Beat ${index + 1} must be exactly 5s; received ${scene.durationSeconds}s.`,
      );
    }

    if (actions.length === 0) {
      errors.push(
        `Beat ${index + 1} has no concrete visible action.`,
      );
    }

    if (actions.length > 2) {
      errors.push(
        `Beat ${index + 1} has ${actions.length} scene actions; maximum is 2 atomic physical actions for one 5s clip.`,
      );
    }

    for (const plan of scene.characterPlans) {
      if (plan.actions.length > 2) {
        errors.push(
          `Beat ${index + 1} character ${plan.characterId} has ${plan.actions.length} physical plan actions; maximum is 2 per character for one 5s clip.`,
        );
      }

      if (
        plan.actions.length === 0 &&
        !isExplicitVisualBehavior(plan.emotion) &&
        !isExplicitVisualBehavior(plan.expression) &&
        plan.bodyLanguage.every(
          (item) => !isExplicitVisualBehavior(item),
        )
      ) {
        errors.push(
          `Beat ${index + 1} character ${plan.characterId} has no concrete action, gesture, expression, emotion, or body-language instruction.`,
        );
      }
    }

    const hasEntrance = /\b(enter|enters|entered|walks? in|comes? inside|arrives?)\b/.test(choreographyText);
    const hasExit = /\b(exit|exits|leave|leaves|walks? out|goes? outside|steps? outside)\b/.test(choreographyText);
    if (hasEntrance && hasExit) {
      errors.push(
        `Beat ${index + 1} mixes entrance and exit/departure choreography.`,
      );
    }

    const hasRefusal = /\b(refuse|refuses|refused|decline|declines|declined|shake(?:s)? (?:his|her|their) head|says? no|raises? (?:one|his|her|their) (?:open )?hand)\b/.test(choreographyText);
    const hasAcceptance = /\b(accept|accepts|accepted|take|takes|took|receive|receives|received|grab|grabs|pick(?:s|ed)? up|accept(?:s|ed)? the)\b/.test(choreographyText);
    if (hasRefusal && hasAcceptance) {
      errors.push(
        `Beat ${index + 1} mixes refusal with object acceptance/holding.`,
      );
    }

    const hasOffer = /\b(offer|offers|offered|ask(?:s|ed)? if|propose|proposes|proposed)\b/.test(choreographyText);
    const hasTransfer = /\b(hand(?:s|ed)? over|give(?:s|ing|en)?|pass(?:es|ed)? to|transfer(?:s|red)?|place(?:s|d)? .* into .* hand)\b/.test(choreographyText);
    if (hasOffer && hasTransfer && !hasAcceptance) {
      errors.push(
        `Beat ${index + 1} mixes an offer/proposal with a completed transfer.`,
      );
    }
  }

  return errors;
};

const rebuildNormalizedStoryboard = (
  rawStoryBeats: unknown[],
  characters: StoryCharacter[],
): StoryScene[] =>
  rawStoryBeats
    .map((scene, index) =>
      normalizeScene(
        scene,
        index,
        characters,
      ),
    )
    .map((scene) => ({
      ...scene,
      durationSeconds: 5,
      description: sanitizeVisualText(scene.description),
      location: sanitizeVisualText(scene.location),
      actions: scene.actions.map(sanitizeVisualText),
      characterPlans: scene.characterPlans.map((plan) => ({
        ...plan,
        actions: plan.actions.map(sanitizeVisualText),
        startState: sanitizeVisualText(plan.startState),
        endState: sanitizeVisualText(plan.endState),
      })),
      startState: sanitizeVisualText(scene.startState),
      endState: sanitizeVisualText(scene.endState),
      continuity: {
        ...scene.continuity,
        inheritedCharacterStates:
          Object.fromEntries(
            Object.entries(
              scene.continuity.inheritedCharacterStates,
            ).map(([id, state]) => [
              id,
              sanitizeVisualText(state),
            ]),
          ),
        requiredContinuity:
          scene.continuity.requiredContinuity.map(
            sanitizeVisualText,
          ),
      },
    }));

const buildFixedBeatStrategy = (target: 15 | 30 | 60): string[] => {
  const beatCount = requiredBeatCount(target);

  if (target === 15) {
    return [
      "Use exactly 3 beats.",
      "Beat 1 MUST contain the earliest essential story events: setup, entry, first request/order, or initial interaction.",
      "Beat 2 MUST contain the next chronological middle event(s): offer, question, reaction, refusal, conflict, or other central interaction.",
      "Beat 3 MUST contain the remaining latest chronological events: transfer, payment, resolution, thank-you, departure, or final story outcome.",
      "Preserve the chronological order of canonical storyEvents. Never move a later event into an earlier beat merely to make the beat fit.",
      "Do not place an object transfer, acceptance, payment, or departure into the same beat as an earlier refusal/rejection event unless the canonical storyEvents explicitly define them as the same atomic moment.",
      "When a refusal/rejection event is followed by a transfer/acceptance event, keep the refusal in the earlier beat and assign the transfer/acceptance to the next chronological beat.",
      "When multiple events must share one beat, they must be tightly coupled and sequentially compatible. Never combine mutually exclusive physical states in one 5-second beat.",
      "At most two beat-level physical actions per beat.",
      "Do not create a fourth beat.",
    ];
  }

  if (target === 30) {
    return [
      `Use exactly ${beatCount} beats. Arrange them as a continuous beginning-to-ending sequence.`,
      "Distribute the most important source events across the fixed beats; do not create extra beats to accommodate smaller details.",
    ];
  }

  return [
    `Use exactly ${beatCount} beats. Arrange them as a continuous beginning-to-ending sequence.`,
    "Distribute the most important source events across the fixed beats; do not create extra beats to accommodate smaller details.",
  ];
};

const repairStoryboardForClipSizing = async (
  client: OpenAI,
  story: string,
  analysis: StoryAnalysisResult,
  scenes: StoryScene[],
  options: StoryAnalysisOptions,
  errors: string[],
): Promise<StoryScene[]> => {
  if (!options.requestedDurationSeconds) {
    throw new Error("requestedDurationSeconds is required for storyboard repair.");
  }

  const targetDurationSeconds: 15 | 30 | 60 =
    options.requestedDurationSeconds;

  const repairPrompt = [
    "REPAIR THIS STORYBOARD BEFORE VIDEO GENERATION.",
    `Target duration: ${targetDurationSeconds}s.`,
    `Required beats: exactly ${requiredBeatCount(targetDurationSeconds)}.`,
    "The beat count is IMMUTABLE during repair. Never return more or fewer beats than required. If the current storyboard is overloaded, compress or combine choreography inside the existing fixed beats; NEVER solve the problem by adding another beat.",
    "Each beat MUST contain eventIds referencing the canonical storyEvents. Every canonical event must appear in exactly one beat, and event IDs must not be invented, deleted, duplicated, or reordered.",
    "Do not rewrite the canonical storyEvents. They are supplied separately as immutable semantic data.",
    "Every beat is exactly 5 seconds.",
    ...buildFixedBeatStrategy(targetDurationSeconds),
    "Maximum two beat-level physical actions per beat. characterPlans may describe the individual character contributions to those same actions; do not count those descriptions again as extra beat-level actions.",
    "Each beat must represent one coherent clip-sized moment.",
    "Do not combine entrance and departure in one beat.",
    "Do not combine refusal with acceptance/holding of an object in one beat.",
    "Do not combine an offer with a completed object transfer unless the transfer is explicitly required as the same atomic moment.",
    "Keep object ownership and character positions physically consistent between adjacent beats.",
    "When the story contains a reaction, emotion, refusal, happiness, sadness, crying, laughter, surprise, anger, fear, or hesitation, make it visually observable: use a concrete facial expression and/or physical gesture/body-language instruction, not only an abstract emotion word.",
    "A character plan may have no physical action only when the character is intentionally stationary, but it must then contain an explicit expression or body-language cue that is visible on camera.",
    "Do not use generic filler such as 'natural body movement' to satisfy a missing gesture or emotion.",
    "Do not pack preparation, transfer, payment, and departure into one 5-second beat. Preserve at most two meaningful physical actions and use the remaining time to hold the resulting state.",
    "Preserve the important beginning, middle/conflict, and ending from the original story.",
    "Every concrete story event from the ORIGINAL ANALYSIS must remain visually represented in at least one optimized beat. Do not silently omit an action, interaction, or plot-important dialogue event.",
    "Do not invent unrelated events.",
    "Return the FULL storyboard JSON object, not only changed scenes.",
    "VALIDATION ERRORS",
    ...errors.map((error) => `- ${error}`),
    "REPAIR PRIORITY: first fix the fixed beat count, then reduce each beat to at most two scene.actions, then ensure characterPlans only decompose those actions, then preserve required story events and visible reactions.",
    "A repaired storyboard that changes the required beat count is invalid even if its actions are otherwise good.",
    "ORIGINAL STORY",
    story,
    "CANONICAL STORY EVENTS (IMMUTABLE)",
    JSON.stringify(analysis.storyEvents, null, 2),
    "ORIGINAL ANALYSIS",
    JSON.stringify(analysis, null, 2),
    "CURRENT STORYBOARD",
    JSON.stringify(scenes, null, 2),
  ].join("\n");

  const response = await client.chat.completions.create({
    model: STORY_OPTIMIZATION_MODEL,
    messages: [
      {
        role: "system",
        content: systemInstruction,
      },
      {
        role: "user",
        content: repairPrompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Storyboard repair returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Storyboard repair returned invalid JSON.");
  }

  if (!isObject(parsed)) {
    throw new Error("Storyboard repair returned an invalid storyboard object.");
  }

  const rawStoryBeats = Array.isArray(parsed.storyBeats)
    ? parsed.storyBeats
    : Array.isArray(parsed.scenes)
      ? parsed.scenes
      : [];

  if (rawStoryBeats.length === 0) {
    throw new Error("Storyboard repair returned no story beats.");
  }

  return rebuildNormalizedStoryboard(
    rawStoryBeats,
    analysis.characters,
  );
};

const buildOptimizationPrompt = (
  story: string,
  analysis: StoryAnalysisResult,
  options: StoryAnalysisOptions,
): string => {
  if (!options.requestedDurationSeconds) {
    throw new Error("requestedDurationSeconds is required for storyboard optimization.");
  }

  const targetDurationSeconds: 15 | 30 | 60 =
    options.requestedDurationSeconds;

  return [
    "TARGET VIDEO SETTINGS",
    `Duration: ${targetDurationSeconds} seconds`,
    `Language: ${options.language}`,

    "",

    "ORIGINAL USER STORY",
    story,

    "",

    "EXISTING STORY ANALYSIS",
    JSON.stringify(
      analysis,
      null,
      2,
    ),

    "",

    "CANONICAL STORY EVENTS (IMMUTABLE SOURCE OF TRUTH)",
    JSON.stringify(analysis.storyEvents, null, 2),

    "",

    "TASK",
    `Re-plan the existing storyboard for the ${targetDurationSeconds}-second target as closely as possible.`,
    `The total storyBeat durationSeconds should be approximately ${targetDurationSeconds} seconds.`,
    `Narration and dialogue must be written in ${options.language}.`,
    "Preserve character IDs and story meaning.",
    "Preserve important story events.",
    "Treat analysis.storyEvents as the canonical semantic source of truth. Do not invent, delete, reorder, or rewrite those events; carry them into the final manifest unchanged.",
    "For every optimized beat, include eventIds containing the exact canonical storyEvent IDs represented in that beat.",
    "Every canonical storyEvent must be assigned to exactly one optimized beat. No canonical event may be omitted, duplicated across beats, or assigned to a beat whose visible characters cannot perform it.",
    "Use eventIds to preserve chronological meaning; event sequence is immutable even when multiple events are packed into a single coherent beat.",
    "Derive scene.actions and characterPlans from the assigned eventIds. Do not use beat prose as a substitute for event assignment.",
    "Treat character gender, ageGroup, personality, and voiceProfile from the existing analysis as canonical character intelligence. Preserve them through optimization unless the analysis is clearly invalid.",
    "Plan the storyboard specifically for 5-second image-to-video clips. Prefer one meaningful visual action per story beat and make the action sequence physically explicit.",
    "Rewrite vague actions into concrete on-screen choreography. Name who moves, what they move, how they move, and the resulting visible state.",
    "For object interactions, explicitly describe who holds the object at the start, what visible movement occurs, and who holds it at the end. Do not imply an exchange when no exchange should happen.",
    "For reactions and refusals, describe a visible gesture such as a head shake, raised palm, step backward, turn away, or clear facial expression rather than only the abstract reaction word.",
    "For smile, crying, laughter, sadness, anger, surprise, fear, or hesitation, explicitly encode the visible facial expression and the supporting body language inside the characterPlan.",
    "For every important visual reaction, prefer one concrete gesture or expression that can be recognized from a muted video frame.",
    "Every storyBeat must have a single stable startState and endState that are compatible with the neighboring beat. Do not end a beat in a state that contradicts its own story action.",
    "scene.actions is the authoritative list of beat-level physical actions. characterPlans.actions are per-character decompositions of those same scene actions, not additional actions. Never duplicate or multiply the choreography merely because multiple characters participate in one shared interaction.",
    "Every visible character must have a characterPlan whose actions include ONLY that character's physical contribution to the scene.actions. characterPlans must decompose existing scene actions rather than introducing extra choreography.",
    `For ${targetDurationSeconds}s, output exactly ${targetDurationSeconds / 5} five-second story beats. This is mandatory. Never output a different number of beats.`,
    "The fixed beat slots are more important than preserving the original scene count. Recompose the source story into the exact required number of beats rather than copying or lightly compressing its original scenes.",
    "For a 15-second story: Beat 1 carries the setup/entry/order or first essential event; Beat 2 carries the central interaction/conflict/reaction; Beat 3 carries the resolution/final essential event and a clean ending. Never create a fourth beat.",
    "When a beat would otherwise exceed two beat-level physical actions, merge tightly coupled micro-actions into one continuous visible action or move a non-critical micro-detail into the next existing beat's stable state. Do not add another beat.",
    "Do not turn an action into a long chain such as prepare -> handoff -> receive -> pay -> thank -> leave inside one beat. Select the two most story-critical visible actions for that beat and make the endState carry the resolved state.",
    "For visual-generation fields, avoid exact franchise names, logos, emblems, trademarked costume names, and other branded identifiers. Replace them with concise generic visual descriptions while preserving the intended role and appearance traits.",
    "Do not put the exact branded character identity into imagePrompt or other visual-generation fields.",
    "Before returning JSON, mentally verify every beat: exactly one primary visual action, at most one supporting physical action, explicit object ownership when relevant, concrete visible reaction gestures, character-specific actions, and a stable endState that can become the next beat's startState.",
    "For short targets such as 15 seconds, distribute the story's beginning, conflict or interaction, and resolution across the fixed number of beats instead of compressing the ending into a single overloaded beat.",
    "When a final beat includes an object handoff plus payment or departure, choose the most story-critical two visible actions and make the final state clearly resolved; never list a long chain of micro-actions.",
    "Return only the optimized JSON manifest.",
  ].join("\n");
};

const generateOptimizationWithRetry =
  async (
    client: OpenAI,
    story: string,
    analysis: StoryAnalysisResult,
    options: StoryAnalysisOptions,
  ) => {
    let lastError: unknown;

    if (!options.requestedDurationSeconds) {
      throw new Error("requestedDurationSeconds is required for storyboard optimization.");
    }

    const targetDurationSeconds: 15 | 30 | 60 =
      options.requestedDurationSeconds;

    const prompt =
      buildOptimizationPrompt(
        story,
        analysis,
        options,
      );

    for (
      let attempt = 1;
      attempt <= MAX_RETRIES;
      attempt += 1
    ) {
      try {
        console.log(
          `[StoryOptimizationProvider] Attempt ${attempt}/${MAX_RETRIES}`,
        );

        console.log(
          "[StoryOptimizationProvider] Target settings:",
          {
            requestedDurationSeconds:
              targetDurationSeconds,
            language:
              options.language,
          },
        );

        return await client.chat.completions.create(
          {
            model:
              STORY_OPTIMIZATION_MODEL,

            messages: [
              {
                role: "system",
                content:
                  systemInstruction,
              },
              {
                role: "user",
                content:
                  prompt,
              },
            ],

            response_format: {
              type: "json_object",
            },
          },
        );
      } catch (error) {
        lastError = error;

        const retryable =
          isRetryableOpenAIError(
            error,
          );

        console.warn(
          "[StoryOptimizationProvider] Optimization attempt failed.",
        );

        console.warn(
          "[StoryOptimizationProvider] Error:",
          error,
        );

        if (
          !retryable ||
          attempt >= MAX_RETRIES
        ) {
          throw error;
        }

        const delay =
          RETRY_DELAYS_MS[
            attempt - 1
          ] ?? 8_000;

        console.warn(
          `[StoryOptimizationProvider] Retrying in ${delay / 1000}s...`,
        );

        await sleep(delay);
      }
    }

    throw (
      lastError ??
      new Error(
        "Story optimization failed.",
      )
    );
  };

export class OpenAIStoryOptimizationProvider {
  async optimizeStory(
    story: string,
    analysis: StoryAnalysisResult,
    options: StoryAnalysisOptions,
  ): Promise<StoryAnalysisResult> {
    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured.",
      );
    }

    if (!options.requestedDurationSeconds) {
      throw new Error(
        "requestedDurationSeconds is required.",
      );
    }

    const targetDurationSeconds: 15 | 30 | 60 =
      options.requestedDurationSeconds;

    if (!options.language) {
      throw new Error(
        "language is required.",
      );
    }

    const cleanStory =
      story.trim();

    if (!cleanStory) {
      throw new Error(
        "Story is required.",
      );
    }

    if (
      !analysis ||
      !Array.isArray(
        analysis.characters,
      ) ||
      !Array.isArray(
        analysis.storyBeats,
      ) ||
      !Array.isArray(
        analysis.storyEvents,
      )
    ) {
      throw new Error(
        "A valid story analysis is required.",
      );
    }

    const client =
      new OpenAI({
        apiKey,
      });

    console.log(
      "[StoryOptimizationProvider] Optimizing storyboard...",
    );

    console.log(
      `[StoryOptimizationProvider] Target duration: ${targetDurationSeconds}s`,
    );

    console.log(
      `[StoryOptimizationProvider] Target language: ${options.language}`,
    );

    const response =
      await generateOptimizationWithRetry(
        client,
        cleanStory,
        analysis,
        options,
      );

    const raw =
      response.choices[0]
        ?.message
        ?.content
        ?.trim();

    if (!raw) {
      throw new Error(
        "OpenAI returned an empty optimized storyboard.",
      );
    }

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(raw);
    } catch {
      throw new Error(
        "OpenAI returned invalid optimized storyboard JSON.",
      );
    }

    if (!isObject(parsed)) {
      throw new Error(
        "OpenAI returned an invalid optimized storyboard object.",
      );
    }

    const rawCharacters =
      Array.isArray(
        parsed.characters,
      )
        ? parsed.characters
        : analysis.characters;

    const characters =
      rawCharacters
        .filter(isObject)
        .map(
          (character, index) => {
            const fallback =
              analysis.characters[
                index
              ];

            const normalizedName =
              toNonEmptyString(
                character.name,
                fallback?.name ??
                  `Character ${index + 1}`,
              );

            const normalizedVisualDescription =
              toNonEmptyString(
                character.visualDescription,
                fallback?.visualDescription ??
                  "A consistent story character.",
              );

            const normalizedImagePrompt =
              toNonEmptyString(
                character.imagePrompt,
                fallback?.imagePrompt ??
                  "A full-body original fictional character reference with consistent clothing, facial features, body proportions, and role-appropriate styling on a simple neutral background.",
              );

            const fallbackCharacter =
              getFallbackCharacter(
                analysis.characters,
                index,
              );

            const gender =
              normalizeCharacterGender(
                character.gender,
                fallbackCharacter?.gender ??
                  "unknown",
              );

            const ageGroup =
              normalizeCharacterAgeGroup(
                character.ageGroup,
                fallbackCharacter?.ageGroup ??
                  "unknown",
              );

            const personality =
              toNonEmptyString(
                character.personality,
                fallbackCharacter?.personality ??
                  "Consistent personality appropriate to the story.",
              );

            const fallbackVoiceProfile =
              fallbackCharacter?.voiceProfile ?? {
                gender:
                  gender === "male" ||
                  gender === "female"
                    ? gender
                    : "neutral",
                ageGroup,
                category:
                  gender === "male" && ageGroup === "child"
                    ? "male_child"
                    : gender === "female" && ageGroup === "child"
                      ? "female_child"
                      : gender === "male" && ageGroup === "teen"
                        ? "male_teen"
                        : gender === "female" && ageGroup === "teen"
                          ? "female_teen"
                          : gender === "male" && ageGroup === "adult"
                            ? "male_adult"
                            : gender === "female" && ageGroup === "adult"
                              ? "female_adult"
                              : gender === "male" && ageGroup === "elderly"
                                ? "male_elderly"
                                : gender === "female" && ageGroup === "elderly"
                                  ? "female_elderly"
                                  : gender === "unknown"
                                    ? "unknown"
                                    : "neutral",
              };

            return {
              id:
                toNonEmptyString(
                  character.id,
                  fallback?.id ??
                    `character-${index + 1}`,
                ),

              name:
                normalizedName,

              role:
                toNonEmptyString(
                  character.role,
                  fallback?.role ??
                    `Character ${index + 1}`,
                ),

              gender,

              ageGroup,

              personality,

              voiceProfile:
                normalizeVoiceProfile(
                  character.voiceProfile,
                  {
                    ...fallbackVoiceProfile,
                    gender:
                      gender === "male" ||
                      gender === "female"
                        ? gender
                        : fallbackVoiceProfile.gender,
                    ageGroup,
                  },
                ),

              visualDescription:
                sanitizeVisualText(
                  normalizedVisualDescription,
                ),

              imagePrompt:
                sanitizeVisualText(
                  normalizedImagePrompt,
                ),

              imageUrl:
                typeof character.imageUrl ===
                "string"
                  ? character.imageUrl
                  : fallback?.imageUrl,

              reference:
                fallback?.reference,
            };
          },
        );

    if (
      characters.length === 0
    ) {
      throw new Error(
        "Optimized storyboard contains no characters.",
      );
    }

    const rawStoryBeats =
      Array.isArray(
        parsed.storyBeats,
      )
        ? parsed.storyBeats
        : Array.isArray(
            parsed.scenes,
          )
          ? parsed.scenes
          : [];

    if (
      rawStoryBeats.length === 0
    ) {
      throw new Error(
        "Optimized storyboard contains no story beats.",
      );
    }

    const storyBeats =
      rawStoryBeats.map(
        (scene, index) =>
          normalizeScene(
            scene,
            index,
            characters,
          ),
      ).map((scene) => ({
        ...scene,
        description:
          sanitizeVisualText(scene.description),
        location:
          sanitizeVisualText(scene.location),
        actions:
          scene.actions.map(sanitizeVisualText),
        characterPlans:
          scene.characterPlans.map((plan) => ({
            ...plan,
            actions:
              plan.actions.map(sanitizeVisualText),
            startState:
              sanitizeVisualText(plan.startState),
            endState:
              sanitizeVisualText(plan.endState),
          })),
        startState:
          sanitizeVisualText(scene.startState),
        endState:
          sanitizeVisualText(scene.endState),
        continuity: {
          ...scene.continuity,
          inheritedCharacterStates:
            Object.fromEntries(
              Object.entries(
                scene.continuity.inheritedCharacterStates,
              ).map(([id, state]) => [
                id,
                sanitizeVisualText(state),
              ]),
            ),
          requiredContinuity:
            scene.continuity.requiredContinuity.map(
              sanitizeVisualText,
            ),
        },
      }));

    let balanced =
      rebalanceDurations(
        storyBeats,
        targetDurationSeconds,
      );

    console.log(
      "[StoryOptimizationProvider] PRE-VALIDATION BEATS:",
      balanced.map((scene, index) => ({
        beat: index + 1,
        title: scene.title,
        description: scene.description,
        actions: scene.actions,
        eventIds: scene.eventIds ?? [],
        characterPlans: scene.characterPlans.map((plan) => ({
          characterId: plan.characterId,
          actions: plan.actions,
          emotion: plan.emotion,
          expression: plan.expression,
          bodyLanguage: plan.bodyLanguage,
          startState: plan.startState,
          endState: plan.endState,
        })),
      })),
    );

    let choreographyErrors = [
      ...validateCanonicalStoryEvents(analysis),
      ...validateClipSizedStoryboard(
        balanced,
        targetDurationSeconds,
      ),
      ...buildEventAssignmentErrors(
        analysis,
        balanced,
      ),
    ];

    for (
      let repairAttempt = 1;
      choreographyErrors.length > 0 && repairAttempt <= MAX_CHOREOGRAPHY_REPAIRS;
      repairAttempt += 1
    ) {
      console.warn(
        `[StoryOptimizationProvider] Deterministic choreography validation failed before generation (repair ${repairAttempt}/2):`,
        choreographyErrors,
      );

      const repairedCandidate =
        await repairStoryboardForClipSizing(
          client,
          cleanStory,
          analysis,
          balanced,
          options,
          choreographyErrors,
        );

      const candidateErrors = [
        ...validateCanonicalStoryEvents(analysis),
        ...validateClipSizedStoryboard(
          repairedCandidate,
          targetDurationSeconds,
        ),
        ...buildEventAssignmentErrors(
          analysis,
          repairedCandidate,
        ),
      ];

      const candidateHasCorrectBeatCount =
        repairedCandidate.length ===
        requiredBeatCount(targetDurationSeconds);

      if (!candidateHasCorrectBeatCount) {
        console.warn(
          `[StoryOptimizationProvider] Repair ${repairAttempt} rejected because it changed the required beat count from ${requiredBeatCount(targetDurationSeconds)} to ${repairedCandidate.length}. Keeping the previous candidate.`,
        );
      } else if (
        candidateErrors.length < choreographyErrors.length
      ) {
        balanced = repairedCandidate;
        choreographyErrors = candidateErrors;
      } else {
        console.warn(
          `[StoryOptimizationProvider] Repair ${repairAttempt} did not improve deterministic validation (${candidateErrors.length} errors vs ${choreographyErrors.length}). Keeping the previous candidate.`,
        );
      }
    }

    if (choreographyErrors.length > 0) {
      throw new Error(
        `Optimized storyboard is not safe for ${targetDurationSeconds}s clip generation: ${choreographyErrors.join(" | ")}`,
      );
    }

    const totalDuration =
      balanced.reduce(
        (sum, scene) =>
          sum +
          scene.durationSeconds,
        0,
      );

    if (
      totalDuration !==
      targetDurationSeconds
    ) {
      throw new Error(
        `Optimized storyboard duration mismatch: expected ${targetDurationSeconds}s, received ${totalDuration}s.`,
      );
    }

    console.log(
      `[StoryOptimizationProvider] Deterministic choreography validation passed: ${balanced.length} exact 5s beats with required story-event coverage.`,
    );

    console.log(
      `[StoryOptimizationProvider] Optimized scenes: ${balanced.length}`,
    );

    console.log(
      `[StoryOptimizationProvider] Final planned duration: ${totalDuration}s`,
    );

    console.log(
      "[StoryOptimizationProvider] Beat budgets:",
      balanced.map((scene, index) => ({
        beat: index + 1,
        actions: scene.actions.length,
        actionText: scene.actions,
        eventIds: scene.eventIds ?? [],
        characterPlanActions: scene.characterPlans.reduce(
          (sum, plan) => sum + plan.actions.length,
          0,
        ),
      })),
    );

    return {
      version: 1,

      title:
        toNonEmptyString(
          parsed.title,
          analysis.title,
        ),

      summary:
        toNonEmptyString(
          parsed.summary,
          analysis.summary,
        ),

      requestedDurationSeconds:
        targetDurationSeconds,

      characters,

      storyEvents:
        analysis.storyEvents,

      storyBeats:
        balanced,
    };
  }
}