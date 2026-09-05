import OpenAI from "openai";

import type {
  StoryAction,
  StoryAgeGroup,
  StoryAnalysisOptions,
  StoryAnalysisProvider,
  StoryAnalysisResult,
  StoryBodyLanguage,
  StoryCharacter,
  StoryCharacterScenePlan,
  StoryContinuity,
  StoryDialogueLine,
  StoryEvent,
  StoryEventImportance,
  StoryGender,
  StoryScene,
  StoryVoiceCategory,
  StoryVoiceGender,
  StoryVoiceProfile,
} from "./storyAnalysisProvider.js";

const STORY_ANALYSIS_MODEL =
  process.env.OPENAI_STORY_MODEL ||
  "gpt-4.1-mini";

const MAX_RETRIES = 3;

const RETRY_DELAYS_MS = [
  2_000,
  4_000,
  8_000,
];

const MIN_SCENE_DURATION = 3;
const MAX_SCENE_DURATION = 10;

const systemInstruction = `
You are the semantic story-understanding and visual planning engine for an AI video generator.

Your primary job is to UNDERSTAND the user's story accurately before deciding how it should be shown.
Treat the user's story like a human creative brief: understand meaning, intent, relationships, chronology,
actions, reactions, emotions, gestures, dialogue ownership, objects, locations, and state changes.

The user's story may be written in English, Hindi, Hinglish, Punjabi, mixed/code-switched language, or another
natural language. Understand the meaning in the language it was written in. Do not require the story to be
translated to English first. Language of understanding and language of output are separate concerns.

Return ONLY valid JSON.

OUTPUT SHAPE:

{
  "title": "string",
  "summary": "string",

  "characters": [
    {
      "id": "character-1",
      "name": "string",
      "role": "string",

      "gender": "male|female|unknown",
      "ageGroup": "child|teen|adult|elderly|unknown",
      "personality": "string",

      "voiceProfile": {
        "gender": "male|female|neutral",
        "ageGroup": "child|teen|adult|elderly|unknown",
        "category": "male_child|female_child|male_teen|female_teen|male_adult|female_adult|male_elderly|female_elderly|neutral|unknown|none"
      },

      "visualDescription": "string",
      "imagePrompt": "string"
    }
  ],

  "storyEvents": [
    {
      "id": "event-1",
      "sequence": 1,
      "actorCharacterId": "character-1",
      "action": "string",
      "targetCharacterId": "character-2",
      "object": "string",
      "emotion": "string",
      "expression": "string",
      "bodyLanguage": ["string"],
      "beforeState": "string",
      "afterState": "string",
      "dialogueIds": ["dialogue-1"],
      "location": "string",
      "importance": "essential|supporting"
    }
  ],

  "storyBeats": [
    {
      "sceneNumber": 1,
      "id": "scene-1",
      "title": "string",
      "description": "string",
      "narration": "string",

      "dialogue": [
        {
          "id": "dialogue-1",
          "characterId": "character-1",
          "text": "string",
          "emotion": "string",
          "delivery": "string"
        }
      ],

      "durationSeconds": 5,
      "location": "string",
      "visibleCharacterIds": ["character-1"],
      "actions": ["string"],

      "characterPlans": [
        {
          "characterId": "character-1",
          "actions": ["string"],
          "emotion": "string",
          "expression": "string",
          "bodyLanguage": ["string"],
          "startState": "string",
          "endState": "string"
        }
      ],

      "startState": "string",
      "endState": "string",

      "continuity": {
        "previousSceneNumber": 0,
        "inheritedCharacterStates": {},
        "locationContinues": false,
        "requiredContinuity": []
      }
    }
  ]
}

CORE SEMANTIC RULES

- Understand the complete story before planning scenes.
- Preserve the user's intent, causal relationships, chronology, and ending.
- Do NOT translate the user's story into English first internally and then reason from a translation.
- Interpret natural language directly, including Hinglish, Punjabi, code-switching, idioms, colloquial speech,
  indirect wording, and culturally normal expressions.
- Distinguish what the story explicitly says from what it strongly implies.
- Do not invent material facts, events, relationships, dialogue, objects, or character traits that are not
  supported by the story.
- When a fact is genuinely unknown, use "unknown" instead of guessing.
- Minor visual details may be designed for production only when they do not change story identity or intent.
- Preserve the order in which meaningful story events occur.
- Do not create filler events.
- Do not remove an important event merely because a duration target exists.
- A semantic story event represents something that materially happens, is said, or meaningfully changes.
- Do not split one atomic event into multiple fake events merely to increase event count.
- Do not merge distinct consequential events merely to simplify planning.
- Every story event must have one primary actor.
- If another character is affected, use targetCharacterId.
- If an object materially participates, use object.
- Use concrete observable actions rather than vague labels.
- Emotion, expression, and bodyLanguage must describe how the event is physically/visually expressed.
- BeforeState and afterState must describe the visible state change caused by the event.
- Dialogue must be associated with the semantic event(s) it belongs to through dialogueIds.
- A spoken line by itself is an event when it materially advances the story or communicates an important decision.
- Character IDs and dialogue IDs must be stable within the returned manifest.

CHARACTER UNDERSTANDING

- Identify every distinct character who acts, reacts, speaks, is cared for, or is important to the plot.
- Include plot-important animals.
- Do not create separate characters for generic crowds or irrelevant extras.
- Keep one stable identity for the same character across the entire story.
- Use stable IDs: character-1, character-2, character-3, etc.
- "role" explains the character's function in the story.
- "visualDescription" is a persistent visual identity: age/species, body, face, hair/fur, clothing, colors,
  accessories, and other details that should remain consistent across scenes.
- "imagePrompt" describes ONE character only and asks for a full-body neutral reference on a simple background.
- Do not mention other characters in imagePrompt.
- Do not create character images or save characters in this step.
- Do not return image URLs or invented saved-character references.

GENDER, AGE, AND VOICE

- Determine gender only from explicit story information or a strong, reliable contextual signal.
- Determine ageGroup only from explicit information or a strong contextual signal such as "child", "kid", "boy",
  "girl", "teen", "elderly", or clearly described age.
- Never turn uncertainty into a confident gender or age.
- "unknown" is valid and preferred over an unsupported guess.

Voice selection is character-based, not scene-based:
- The later TTS system must be able to automatically choose a consistent voice for each character.
- For an adult male: category "male_adult".
- For an adult female: category "female_adult".
- For a male child: category "male_child".
- For a female child: category "female_child".
- For a male teen: category "male_teen".
- For a female teen: category "female_teen".
- For an elderly male: category "male_elderly".
- For an elderly female: category "female_elderly".
- If gender or age is unknown, use the most honest category available, usually "unknown".
- Do not fabricate a provider-specific voiceId. voiceId is assigned later by the TTS layer.
- "personality" should only contain traits supported by the story or strongly implied by repeated behavior.

EVENT EXTRACTION

Build storyEvents as the canonical chronological understanding of the story.

For each material event:
- identify the actor;
- identify the concrete action;
- identify target and object when applicable;
- identify emotion;
- identify expression;
- identify at least one meaningful physical/visual bodyLanguage item when the event is observable;
- describe beforeState and afterState;
- attach the relevant dialogueIds;
- preserve location when it matters;
- mark importance as "essential" for events required to understand the story or outcome, otherwise "supporting".

Examples:
- "refuses the fries" is a semantic event.
- The visible expression/gesture can be "shakes head" and "raises one hand politely".
- "gets angry" is not enough as an action; describe what the character visibly does.
- "pays for the burger" is separate from "receives the burger" when both are meaningful story events.
- Do not invent "smiles", "waves", or other gestures unless supported by the story or a natural visual interpretation
  that does not alter meaning.

SCENE / STORYBEAT RULES

storyBeats are PROVISIONAL visual planning, retained for backward compatibility.
They are NOT the final exact 5-second clip plan.

- Every meaningful scene should correspond to one or more storyEvents.
- Do not create filler scenes.
- Scene numbering starts at 1 and is sequential.
- Every scene has a stable id such as "scene-1".
- Every visible character has exactly one character plan.
- Character plans reference only visible characters.
- Actions are concrete and observable.
- startState and endState describe visible states.
- Continuity describes what carries over from the previous scene.
- Keep dialogue concise enough to plausibly fit its provisional scene.
- Prefer visual storytelling over unnecessary narration.
- Do not force a fixed number of scenes based only on duration.
- Do not assume that 15 seconds means "3 scenes" at this stage. The later Beat Planner will perform exact 5-second
  planning.
- Do not use scene duration to delete or invent semantic events.

DIALOGUE

- Preserve the intended meaning.
- Use only known characters.
- Do not invent dialogue for silent characters.
- Give every dialogue line a stable id such as "dialogue-1".
- Keep lines concise and natural.
- emotion describes the speaker's emotional state.
- delivery describes how the line is spoken.
- Do not translate character names or IDs.
- When a target language is supplied, dialogue.text MUST be written in that target language.

LANGUAGE OUTPUT

When a target language is supplied:
- narration MUST use the target language.
- dialogue.text MUST use the target language.
- title and summary may use the target language when natural.
- character IDs remain unchanged.
- Character names remain natural and consistent with the user's story.
- visualDescription, imagePrompt, action, state, emotion, expression, and bodyLanguage should normally remain in
  stable production English so downstream visual generation is consistent.
- story semantics must remain faithful regardless of the input language.

DURATION

When a target duration is supplied:
- Treat it as a project constraint, not as a reason to distort story meaning.
- Do not force exact clip count here.
- Do not invent filler events.
- Do not remove essential events solely to hit the duration.
- Keep provisional scene durations realistic between 3 and 10 seconds.
- The later Beat Planner owns the exact mapping:
  15s = 3 clips x 5s
  30s = 6 clips x 5s
  60s = 12 clips x 5s

FINAL SAFETY / CONSISTENCY CHECK BEFORE RETURNING JSON

Verify:
1. Every character has a stable id.
2. Every character has gender, ageGroup, personality, and voiceProfile.
3. Every voice category matches the character gender + age where known.
4. Every dialogue characterId exists.
5. Every dialogue id is unique.
6. Every story event id is unique.
7. Every story event actorCharacterId exists.
8. Every event targetCharacterId exists when supplied.
9. Every event dialogueId points to an existing dialogue line.
10. Story events are in chronological order.
11. No event is filler.
12. Story meaning and ending are preserved.
13. Every visible scene character has exactly one character plan.
14. No saved character references or image URLs are invented.
15. Return JSON only.

GENERAL RULES

- No markdown.
- No code fences.
- No commentary.
- JSON only.
`;

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, milliseconds),
  );

const isRetryableOpenAIError = (
  error: unknown,
): boolean => {
  const candidate = error as {
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
    message.includes("temporarily unavailable") ||
    message.includes("service unavailable") ||
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

const toOptionalString = (
  value: unknown,
): string | undefined =>
  typeof value === "string" &&
  value.trim().length > 0
    ? value.trim()
    : undefined;

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
  Array.from(new Set(values));

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

const toCharacterId = (
  value: unknown,
  fallback: string,
): string =>
  toNonEmptyString(
    value,
    fallback,
  );

const normalizeGender = (
  value: unknown,
): StoryGender => {
  const normalized =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  if (
    normalized === "male" ||
    normalized === "m"
  ) {
    return "male";
  }

  if (
    normalized === "female" ||
    normalized === "f"
  ) {
    return "female";
  }

  return "unknown";
};

const normalizeAgeGroup = (
  value: unknown,
): StoryAgeGroup => {
  const normalized =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  if (normalized === "child" || normalized === "kid") {
    return "child";
  }

  if (normalized === "teen" || normalized === "teenager") {
    return "teen";
  }

  if (normalized === "adult") {
    return "adult";
  }

  if (
    normalized === "elderly" ||
    normalized === "senior"
  ) {
    return "elderly";
  }

  return "unknown";
};

const normalizeVoiceGender = (
  value: unknown,
): StoryVoiceGender => {
  const normalized =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  if (normalized === "male" || normalized === "m") {
    return "male";
  }

  if (normalized === "female" || normalized === "f") {
    return "female";
  }

  return "neutral";
};

const normalizeVoiceCategory = (
  value: unknown,
): StoryVoiceCategory => {
  const normalized =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  const allowed = new Set<StoryVoiceCategory>([
    "male_child",
    "female_child",
    "male_teen",
    "female_teen",
    "male_adult",
    "female_adult",
    "male_elderly",
    "female_elderly",
    "neutral",
    "unknown",
    "none",
  ]);

  return allowed.has(
    normalized as StoryVoiceCategory,
  )
    ? (normalized as StoryVoiceCategory)
    : "unknown";
};

const deriveVoiceProfile = (
  gender: StoryGender,
  ageGroup: StoryAgeGroup,
  rawVoiceProfile: unknown,
): StoryVoiceProfile => {
  const raw =
    isObject(rawVoiceProfile)
      ? rawVoiceProfile
      : {};

  let voiceGender =
    normalizeVoiceGender(raw.gender);

  if (voiceGender === "neutral") {
    if (gender === "male") {
      voiceGender = "male";
    } else if (gender === "female") {
      voiceGender = "female";
    }
  }

  const voiceAgeGroup =
    normalizeAgeGroup(
      raw.ageGroup ?? ageGroup,
    );

  let category =
    normalizeVoiceCategory(
      raw.category,
    );

  if (
    gender !== "unknown" &&
    ageGroup !== "unknown"
  ) {
    category =
      `${gender}_${ageGroup}` as StoryVoiceCategory;
  } else if (
    gender !== "unknown"
  ) {
    category =
      gender === "male"
        ? "male_adult"
        : "female_adult";
  } else {
    category = "unknown";
  }

  return {
    gender:
      voiceGender,
    ageGroup:
      voiceAgeGroup,
    category,
    voiceId:
      toOptionalString(
        raw.voiceId,
      ),
  };
};

const buildUserPrompt = (
  story: string,
  options?: StoryAnalysisOptions,
): string => {
  const targetDuration =
    options?.requestedDurationSeconds;

  const language =
    options?.language;

  const constraints: string[] = [
    "First understand the user's story semantically. Do not simplify it into a generic plot.",
    "Extract the canonical chronological storyEvents before forming provisional storyBeats.",
    "The later Beat Planner will handle exact 5-second clip planning.",
  ];

  if (targetDuration) {
    constraints.push(
      `Project target duration: ${targetDuration} seconds.`,
      "Do not force exact clip count at the Story Analysis stage.",
      "Preserve all essential story events even when the duration is short.",
    );
  }

  if (language) {
    constraints.push(
      `Target spoken language: ${language}.`,
      `Write narration and dialogue text in ${language}.`,
      "Keep semantic understanding independent from the target output language.",
      "Keep character IDs and dialogue IDs stable.",
    );
  }

  return [
    "PROJECT CONSTRAINTS:",
    constraints.join("\n"),
    "",
    "USER STORY:",
    story,
  ].join("\n");
};

const generateStoryAnalysisWithRetry = async (
  client: OpenAI,
  story: string,
  options?: StoryAnalysisOptions,
) => {
  const userPrompt =
    buildUserPrompt(
      story,
      options,
    );

  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt += 1
  ) {
    try {
      console.log(
        `[OpenAIStoryAnalysisProvider] Story analysis attempt ${attempt}/${MAX_RETRIES}`,
      );

      if (
        options?.requestedDurationSeconds ||
        options?.language
      ) {
        console.log(
          "[OpenAIStoryAnalysisProvider] Constraints:",
          {
            requestedDurationSeconds:
              options?.requestedDurationSeconds,
            language:
              options?.language,
          },
        );
      }

      return await client.chat.completions.create({
        model: STORY_ANALYSIS_MODEL,
        messages: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
      });
    } catch (error) {
      lastError = error;

      const retryable =
        isRetryableOpenAIError(error);

      console.warn(
        `[OpenAIStoryAnalysisProvider] Story analysis attempt ${attempt} failed.`,
      );

      console.warn(
        "[OpenAIStoryAnalysisProvider] Error:",
        error,
      );

      if (
        !retryable ||
        attempt >= MAX_RETRIES
      ) {
        throw error;
      }

      const delay =
        RETRY_DELAYS_MS[attempt - 1] ??
        8_000;

      console.warn(
        `[OpenAIStoryAnalysisProvider] Retrying in ${delay / 1000}s...`,
      );

      await sleep(delay);
    }
  }

  throw (
    lastError ??
    new Error(
      "OpenAI story analysis failed.",
    )
  );
};

const normalizeCharacter = (
  value: unknown,
  index: number,
): StoryCharacter => {
  const character =
    isObject(value)
      ? value
      : {};

  const fallbackId =
    `character-${index + 1}`;

  const gender =
    normalizeGender(
      character.gender,
    );

  const ageGroup =
    normalizeAgeGroup(
      character.ageGroup,
    );

  const visualDescription =
    toNonEmptyString(
      character.visualDescription,
      "A distinctive character with a consistent visual design.",
    );

  return {
    id: toCharacterId(
      character.id,
      fallbackId,
    ),
    name: toNonEmptyString(
      character.name,
      `Character ${index + 1}`,
    ),
    role: toNonEmptyString(
      character.role,
      `Character ${index + 1}`,
    ),
    gender,
    ageGroup,
    personality:
      toNonEmptyString(
        character.personality,
        "No specific personality trait established by the story.",
      ),
    voiceProfile:
      deriveVoiceProfile(
        gender,
        ageGroup,
        character.voiceProfile,
      ),
    visualDescription,
    imagePrompt: toNonEmptyString(
      character.imagePrompt,
      visualDescription,
    ),
    imageUrl:
      typeof character.imageUrl === "string"
        ? character.imageUrl
        : undefined,
    reference:
      isObject(character.reference)
        ? {
            imageUrl:
              typeof character.reference.imageUrl ===
              "string"
                ? character.reference.imageUrl
                : undefined,
            imageKey:
              typeof character.reference.imageKey ===
              "string"
                ? character.reference.imageKey
                : undefined,
            source:
              typeof character.reference.source ===
              "string"
                ? character.reference.source
                : undefined,
          }
        : undefined,
  };
};

const normalizeDialogueLine = (
  value: unknown,
  characters: StoryCharacter[],
  sceneNumber: number,
  dialogueIndex: number,
): StoryDialogueLine | null => {
  if (!isObject(value)) {
    return null;
  }

  const characterIds =
    new Set(
      characters.map(
        (character) => character.id,
      ),
    );

  const characterId =
    toNonEmptyString(
      value.characterId,
      "",
    );

  if (
    !characterId ||
    !characterIds.has(characterId)
  ) {
    return null;
  }

  const text =
    toNonEmptyString(
      value.text,
      "",
    );

  if (!text) {
    return null;
  }

  return {
    id:
      toNonEmptyString(
        value.id,
        `dialogue-${sceneNumber}-${dialogueIndex + 1}`,
      ),
    characterId,
    text,
    emotion:
      toNonEmptyString(
        value.emotion,
        "neutral",
      ),
    delivery:
      toNonEmptyString(
        value.delivery,
        "natural",
      ),
  };
};

const normalizeCharacterPlan = (
  value: unknown,
  visibleCharacterIds: string[],
  characters: StoryCharacter[],
): StoryCharacterScenePlan | null => {
  if (!isObject(value)) {
    return null;
  }

  const characterId =
    toNonEmptyString(
      value.characterId,
      "",
    );

  if (
    !characterId ||
    !visibleCharacterIds.includes(
      characterId,
    )
  ) {
    return null;
  }

  const knownCharacter =
    characters.some(
      (character) =>
        character.id === characterId,
    );

  if (!knownCharacter) {
    return null;
  }

  const actions =
    uniqueStrings(
      toStringArray(
        value.actions,
      ),
    );

  const bodyLanguage =
    uniqueStrings(
      toStringArray(
        value.bodyLanguage,
      ),
    );

  return {
    characterId,
    actions:
      actions.length > 0
        ? actions
        : [
            "Maintains natural movement appropriate to the scene.",
          ],
    emotion:
      toNonEmptyString(
        value.emotion,
        "neutral",
      ),
    expression:
      toNonEmptyString(
        value.expression,
        "natural",
      ),
    bodyLanguage:
      bodyLanguage.length > 0
        ? bodyLanguage
        : ["Natural body movement"],
    startState:
      toNonEmptyString(
        value.startState,
        "Begins the scene naturally.",
      ),
    endState:
      toNonEmptyString(
        value.endState,
        "Ends the scene in a natural state.",
      ),
  };
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

  const rawPrevious =
    continuity.previousSceneNumber;

  const previousSceneNumber =
    typeof rawPrevious === "number" &&
    Number.isFinite(rawPrevious)
      ? Math.round(rawPrevious)
      : sceneNumber > 1
        ? sceneNumber - 1
        : undefined;

  const inheritedStatesRaw =
    isObject(
      continuity.inheritedCharacterStates,
    )
      ? continuity.inheritedCharacterStates
      : {};

  const inheritedCharacterStates: Record<
    string,
    string
  > = {};

  for (
    const [
      characterId,
      state,
    ] of Object.entries(
      inheritedStatesRaw,
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

  const locationContinues =
    typeof continuity.locationContinues ===
    "boolean"
      ? continuity.locationContinues
      : sceneNumber > 1;

  const requiredContinuity =
    uniqueStrings(
      toStringArray(
        continuity.requiredContinuity,
      ),
    );

  if (
    locationContinues &&
    location &&
    !requiredContinuity.some(
      (item) =>
        item
          .toLowerCase()
          .includes("location"),
    )
  ) {
    requiredContinuity.push(
      `Continue the established location: ${location}.`,
    );
  }

  return {
    previousSceneNumber:
      sceneNumber === 1
        ? undefined
        : previousSceneNumber,
    inheritedCharacterStates,
    locationContinues,
    requiredContinuity,
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

  const id =
    toNonEmptyString(
      scene.id,
      `scene-${sceneNumber}`,
    );

  const title =
    toNonEmptyString(
      scene.title,
      `Scene ${sceneNumber}`,
    );

  const description =
    toNonEmptyString(
      scene.description,
      "A cinematic scene that advances the story.",
    );

  const narration =
    toNonEmptyString(
      scene.narration,
      "",
    );

  const location =
    toNonEmptyString(
      scene.location,
      "A suitable story location.",
    );

  const visibleCharacterIds =
    uniqueStrings(
      toStringArray(
        scene.visibleCharacterIds,
      ).filter((characterId) =>
        characters.some(
          (character) =>
            character.id ===
            characterId,
        ),
      ),
    );

  const normalizedVisibleCharacterIds =
    visibleCharacterIds.length > 0
      ? visibleCharacterIds
      : characters.length > 0
        ? [characters[0].id]
        : [];

  const actions =
    uniqueStrings(
      toStringArray(
        scene.actions,
      ),
    );

  const normalizedActions =
    actions.length > 0
      ? actions
      : [
          "Characters perform the observable action described by the scene.",
        ];

  const dialogue =
    Array.isArray(scene.dialogue)
      ? scene.dialogue
          .map((line, dialogueIndex) =>
            normalizeDialogueLine(
              line,
              characters,
              sceneNumber,
              dialogueIndex,
            ),
          )
          .filter(
            (
              line,
            ): line is StoryDialogueLine =>
              line !== null,
          )
      : [];

  const rawPlans =
    Array.isArray(scene.characterPlans)
      ? scene.characterPlans
      : [];

  const normalizedPlans =
    normalizedVisibleCharacterIds
      .map((characterId) => {
        const existing =
          rawPlans.find(
            (plan) =>
              isObject(plan) &&
              plan.characterId ===
                characterId,
          );

        return (
          normalizeCharacterPlan(
            existing,
            normalizedVisibleCharacterIds,
            characters,
          ) ??
          normalizeCharacterPlan(
            {
              characterId,
              actions:
                normalizedActions,
              emotion:
                "neutral",
              expression:
                "natural",
              bodyLanguage: [
                "Natural body movement",
              ],
              startState:
                "Begins naturally in the scene.",
              endState:
                "Ends naturally in the scene.",
            },
            normalizedVisibleCharacterIds,
            characters,
          )
        );
      })
      .filter(
        (
          plan,
        ): plan is StoryCharacterScenePlan =>
          plan !== null,
      );

  return {
    sceneNumber,
    id,
    title,
    description,
    narration,
    dialogue,
    durationSeconds:
      toDuration(
        scene.durationSeconds,
      ),
    location,
    visibleCharacterIds:
      normalizedVisibleCharacterIds,
    actions:
      normalizedActions as StoryAction[],
    characterPlans:
      normalizedPlans,
    startState:
      toNonEmptyString(
        scene.startState,
        "The scene begins in the established story state.",
      ),
    endState:
      toNonEmptyString(
        scene.endState,
        "The scene ends in a clear story state.",
      ),
    continuity:
      normalizeContinuity(
        scene.continuity,
        sceneNumber,
        location,
      ),
  };
};

const normalizeEventImportance = (
  value: unknown,
): StoryEventImportance =>
  value === "essential"
    ? "essential"
    : "supporting";

const normalizeStoryEvent = (
  value: unknown,
  index: number,
  characters: StoryCharacter[],
  dialogueIds: Set<string>,
): StoryEvent => {
  if (!isObject(value)) {
    throw new Error(
      `OpenAI returned an invalid story event at index ${index}.`,
    );
  }

  const id =
    toNonEmptyString(
      value.id,
      `event-${index + 1}`,
    );

  const actorCharacterId =
    toNonEmptyString(
      value.actorCharacterId,
      "",
    );

  if (
    !actorCharacterId ||
    !characters.some(
      (character) =>
        character.id === actorCharacterId,
    )
  ) {
    throw new Error(
      `Story event ${id} references an unknown actorCharacterId.`,
    );
  }

  const action =
    toNonEmptyString(
      value.action,
      "",
    );

  if (!action) {
    throw new Error(
      `Story event ${id} has no action.`,
    );
  }

  const targetCharacterId =
    toOptionalString(
      value.targetCharacterId,
    );

  if (
    targetCharacterId &&
    !characters.some(
      (character) =>
        character.id === targetCharacterId,
    )
  ) {
    throw new Error(
      `Story event ${id} references an unknown targetCharacterId.`,
    );
  }

  const eventDialogueIds =
    uniqueStrings(
      toStringArray(
        value.dialogueIds,
      ),
    );

  for (
    const dialogueId of eventDialogueIds
  ) {
    if (
      !dialogueIds.has(
        dialogueId,
      )
    ) {
      throw new Error(
        `Story event ${id} references unknown dialogueId ${dialogueId}.`,
      );
    }
  }

  const bodyLanguage =
    uniqueStrings(
      toStringArray(
        value.bodyLanguage,
      ),
    );

  return {
    id,
    sequence:
      Math.max(
        1,
        Math.round(
          Number(value.sequence) ||
            index + 1,
        ),
      ),
    actorCharacterId,
    action,
    targetCharacterId,
    object:
      toOptionalString(
        value.object,
      ),
    emotion:
      toNonEmptyString(
        value.emotion,
        "neutral",
      ),
    expression:
      toNonEmptyString(
        value.expression,
        "natural",
      ),
    bodyLanguage:
      bodyLanguage.length > 0
        ? bodyLanguage
        : ["Natural movement appropriate to the event."],
    beforeState:
      toNonEmptyString(
        value.beforeState,
        "The character is in the established prior story state.",
      ),
    afterState:
      toNonEmptyString(
        value.afterState,
        "The event has occurred and changed the visible story state as described.",
      ),
    dialogueIds:
      eventDialogueIds,
    location:
      toOptionalString(
        value.location,
      ),
    importance:
      normalizeEventImportance(
        value.importance,
      ),
  };
};

const normalizeStoryEvents = (
  value: unknown,
  characters: StoryCharacter[],
  storyBeats: StoryScene[],
): StoryEvent[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(
      "OpenAI returned no storyEvents. Semantic event extraction is required.",
    );
  }

  const dialogueIds =
    new Set<string>();

  for (
    const scene of storyBeats
  ) {
    for (
      const dialogue of scene.dialogue
    ) {
      if (dialogue.id) {
        if (
          dialogueIds.has(
            dialogue.id,
          )
        ) {
          throw new Error(
            `Duplicate dialogue id detected: ${dialogue.id}`,
          );
        }

        dialogueIds.add(
          dialogue.id,
        );
      }
    }
  }

  const events =
    value.map(
      (event, index) =>
        normalizeStoryEvent(
          event,
          index,
          characters,
          dialogueIds,
        ),
    );

  const eventIds =
    new Set<string>();

  for (
    const event of events
  ) {
    if (
      eventIds.has(
        event.id,
      )
    ) {
      throw new Error(
        `Duplicate story event id detected: ${event.id}`,
      );
    }

    eventIds.add(
      event.id,
    );
  }

  return [...events].sort(
    (a, b) =>
      a.sequence -
      b.sequence,
  );
};

const validateDialogueCoverage = (
  events: StoryEvent[],
  storyBeats: StoryScene[],
): void => {
  const dialogueIds =
    storyBeats.flatMap(
      (scene) =>
        scene.dialogue
          .map(
            (dialogue) =>
              dialogue.id,
          )
          .filter(
            (
              id,
            ): id is string =>
              Boolean(id),
          ),
    );

  if (
    dialogueIds.length === 0
  ) {
    return;
  }

  const eventDialogueIds =
    new Set(
      events.flatMap(
        (event) =>
          event.dialogueIds,
      ),
    );

  const unlinked =
    dialogueIds.filter(
      (dialogueId) =>
        !eventDialogueIds.has(
          dialogueId,
        ),
    );

  if (
    unlinked.length > 0
  ) {
    throw new Error(
      `OpenAI returned dialogue that is not linked to any story event: ${unlinked.join(", ")}.`,
    );
  }
};

const normalizeManifest = (
  parsed: Record<string, unknown>,
  cleanStory: string,
  options?: StoryAnalysisOptions,
): StoryAnalysisResult => {
  const rawCharacters =
    Array.isArray(
      parsed.characters,
    )
      ? parsed.characters
      : [];

  const characters =
    rawCharacters.map(
      normalizeCharacter,
    );

  if (characters.length === 0) {
    throw new Error(
      "OpenAI returned no characters.",
    );
  }

  const characterIds =
    new Set<string>();

  for (
    const character of characters
  ) {
    if (
      characterIds.has(
        character.id,
      )
    ) {
      throw new Error(
        `Duplicate character id detected: ${character.id}`,
      );
    }

    characterIds.add(
      character.id,
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
      "OpenAI returned no story beats.",
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
    );

  const storyEvents =
    normalizeStoryEvents(
      parsed.storyEvents,
      characters,
      storyBeats,
    );

  validateDialogueCoverage(
    storyEvents,
    storyBeats,
  );

  return {
    version: 1,
    title:
      toNonEmptyString(
        parsed.title,
        "Untitled Story",
      ),
    summary:
      toNonEmptyString(
        parsed.summary,
        cleanStory,
      ),
    requestedDurationSeconds:
      options?.requestedDurationSeconds,
    characters,
    storyEvents,
    storyBeats,
  };
};

export class OpenAIStoryAnalysisProvider
  implements StoryAnalysisProvider
{
  async analyzeStory(
    story: string,
    options?: StoryAnalysisOptions,
  ): Promise<StoryAnalysisResult> {
    const apiKey =
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured.",
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
      options?.requestedDurationSeconds !==
        undefined &&
      options.requestedDurationSeconds !==
        15 &&
      options.requestedDurationSeconds !==
        30 &&
      options.requestedDurationSeconds !==
        60
    ) {
      throw new Error(
        "requestedDurationSeconds must be 15, 30, or 60.",
      );
    }

    const client =
      new OpenAI({
        apiKey,
      });

    console.log(
      "[OpenAIStoryAnalysisProvider] Analyzing story semantically...",
    );

    const response =
      await generateStoryAnalysisWithRetry(
        client,
        cleanStory,
        options,
      );

    const raw =
      response.choices[0]
        ?.message
        ?.content
        ?.trim();

    if (!raw) {
      throw new Error(
        "OpenAI returned an empty story analysis.",
      );
    }

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(raw);
    } catch {
      throw new Error(
        "OpenAI returned invalid story analysis JSON.",
      );
    }

    if (!isObject(parsed)) {
      throw new Error(
        "OpenAI returned an invalid story analysis object.",
      );
    }

    const result =
      normalizeManifest(
        parsed,
        cleanStory,
        options,
      );

    const totalDuration =
      result.storyBeats.reduce(
        (sum, scene) =>
          sum + scene.durationSeconds,
        0,
      );

    console.log(
      "[OpenAIStoryAnalysisProvider] Story analysis completed.",
    );

    console.log(
      `[OpenAIStoryAnalysisProvider] Characters: ${result.characters.length}`,
    );

    console.log(
      `[OpenAIStoryAnalysisProvider] Story events: ${result.storyEvents.length}`,
    );

    console.log(
      `[OpenAIStoryAnalysisProvider] Provisional scenes: ${result.storyBeats.length}`,
    );

    console.log(
      `[OpenAIStoryAnalysisProvider] Provisional storyboard duration: ${totalDuration}s`,
    );

    if (
      options?.requestedDurationSeconds
    ) {
      console.log(
        `[OpenAIStoryAnalysisProvider] Target duration: ${options.requestedDurationSeconds}s`,
      );
    }

    if (options?.language) {
      console.log(
        `[OpenAIStoryAnalysisProvider] Target language: ${options.language}`,
      );
    }

    return result;
  }
}

// Backward-compatible export so existing
// imports do not break.
export const GeminiStoryAnalysisProvider =
  OpenAIStoryAnalysisProvider;
