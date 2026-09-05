export type ClipPlannerCharacterPlan = {
  characterId: string;
  actions: string[];
  emotion: string;
  expression: string;
  bodyLanguage: string[];
  startState: string;
  endState: string;
};

export type ClipPlannerContinuity = {
  previousSceneNumber?: number;
  inheritedCharacterStates: Record<string, string>;
  locationContinues: boolean;
  requiredContinuity: string[];
};

export type ClipPlannerScenePlan = {
  sceneNumber: number;
  title: string;
  description: string;
  narration: string;
  durationSeconds: number;
  visibleCharacterIds: string[];
  actions: string[];
  startState: string;
  endState: string;
  id?: string;
  location?: string;
  characterPlans?: ClipPlannerCharacterPlan[];
  continuity?: ClipPlannerContinuity;
};

export type PlannedClip = {
  clipNumber: number;
  storyBeatNumbers: number[];
  storyBeatIds: string[];
  scenePlan: ClipPlannerScenePlan;
};

const CLIP_DURATION_SECONDS = 5;

const getBeatComplexity = (
  beat: ClipPlannerScenePlan,
): number => {
  const actionCount =
    beat.actions?.filter(Boolean).length ?? 0;
  const characterCount =
    beat.visibleCharacterIds?.filter(Boolean).length ?? 0;
  const hasMeaningfulState =
    Boolean(beat.startState?.trim()) ||
    Boolean(beat.endState?.trim());

  return (
    actionCount * 2 +
    characterCount +
    (hasMeaningfulState ? 1 : 0)
  );
};

const getTransitionCost = (
  previous: ClipPlannerScenePlan,
  current: ClipPlannerScenePlan,
): number => {
  let cost = 0;

  const previousCharacters = new Set(
    previous.visibleCharacterIds ?? [],
  );
  const currentCharacters = new Set(
    current.visibleCharacterIds ?? [],
  );

  const sharedCharacters = Array.from(
    currentCharacters,
  ).filter((id) => previousCharacters.has(id)).length;

  const previousCharacterCount = previousCharacters.size;
  const currentCharacterCount = currentCharacters.size;

  if (
    previousCharacterCount > 0 ||
    currentCharacterCount > 0
  ) {
    if (sharedCharacters === 0) {
      cost += 4;
    } else if (
      sharedCharacters <
      Math.min(
        previousCharacterCount,
        currentCharacterCount,
      )
    ) {
      cost += 2;
    }
  }

  const previousLocation = previous.location
    ?.trim()
    .toLowerCase();
  const currentLocation = current.location
    ?.trim()
    .toLowerCase();

  if (
    previousLocation &&
    currentLocation &&
    previousLocation !== currentLocation
  ) {
    cost += 5;
  }

  const currentStart =
    current.startState?.trim().toLowerCase() ?? "";

  if (
    currentStart.includes("where the previous") ||
    currentStart.includes("previous scene") ||
    currentStart.includes("previous beat") ||
    currentStart.includes("continues")
  ) {
    cost -= 2;
  }

  const previousEnd =
    previous.endState?.trim().toLowerCase() ?? "";

  if (
    previousEnd &&
    currentStart &&
    previousEnd === currentStart
  ) {
    cost -= 3;
  }

  return Math.max(0, cost);
};

const canGroupBeats = (
  previous: ClipPlannerScenePlan,
  current: ClipPlannerScenePlan,
): boolean => {
  const previousComplexity =
    getBeatComplexity(previous);
  const currentComplexity =
    getBeatComplexity(current);
  const transitionCost = getTransitionCost(
    previous,
    current,
  );

  if (
    previousComplexity >= 9 &&
    currentComplexity >= 9
  ) {
    return false;
  }

  if (transitionCost >= 6) {
    return false;
  }

  if (
    transitionCost <= 2 &&
    previousComplexity <= 8 &&
    currentComplexity <= 8
  ) {
    return true;
  }

  return (
    previousComplexity <= 5 &&
    currentComplexity <= 5 &&
    transitionCost <= 4
  );
};

const mergeBeatGroup = (
  group: ClipPlannerScenePlan[],
  clipNumber: number,
): PlannedClip => {
  const first = group[0];
  const last = group[group.length - 1];

  if (!first || !last) {
    throw new Error(
      "Cannot build a clip from an empty beat group.",
    );
  }

  const storyBeatNumbers = group.map(
    (beat) => beat.sceneNumber,
  );

  const storyBeatIds = group
    .map((beat) => beat.id)
    .filter(
      (id): id is string =>
        typeof id === "string" &&
        id.trim().length > 0,
    );

  const visibleCharacterIds = Array.from(
    new Set(
      group.flatMap(
        (beat) => beat.visibleCharacterIds ?? [],
      ),
    ),
  );

  const actions = group.flatMap(
    (beat) => beat.actions ?? [],
  );

  const narration = group
    .map((beat) => beat.narration?.trim() ?? "")
    .filter(Boolean)
    .join(" ");

  const titles = group
    .map((beat) => beat.title?.trim() ?? "")
    .filter(Boolean);

  const descriptions = group
    .map((beat) => beat.description?.trim() ?? "")
    .filter(Boolean);

  const location = group
    .map((beat) => beat.location?.trim() ?? "")
    .find(Boolean);

  const characterPlans = group.some(
    (beat) => Array.isArray(beat.characterPlans),
  )
    ? group.flatMap(
        (beat) => beat.characterPlans ?? [],
      )
    : undefined;

  const continuity =
    last.continuity ?? first.continuity;

  const mergedPlan: ClipPlannerScenePlan = {
    ...first,
    sceneNumber: first.sceneNumber,
    id: `clip-${clipNumber}`,
    title:
      titles.join(" → ") || `Clip ${clipNumber}`,
    description: descriptions.join(" "),
    narration,
    durationSeconds: CLIP_DURATION_SECONDS,
    visibleCharacterIds,
    actions,
    startState: first.startState ?? "",
    endState: last.endState ?? "",
    ...(location ? { location } : {}),
    ...(characterPlans
      ? { characterPlans }
      : {}),
    ...(continuity ? { continuity } : {}),
  };

  return {
    clipNumber,
    storyBeatNumbers,
    storyBeatIds,
    scenePlan: mergedPlan,
  };
};

const normalizePlans = (
  plans: ClipPlannerScenePlan[],
): ClipPlannerScenePlan[] => {
  return plans
    .filter(Boolean)
    .slice()
    .sort(
      (a, b) => a.sceneNumber - b.sceneNumber,
    )
    .map((plan, index) => ({
      ...plan,
      sceneNumber: index + 1,
      durationSeconds:
        plan.durationSeconds > 0
          ? plan.durationSeconds
          : CLIP_DURATION_SECONDS,
      visibleCharacterIds: Array.from(
        new Set(
          (plan.visibleCharacterIds ?? []).filter(
            Boolean,
          ),
        ),
      ),
      actions: (plan.actions ?? []).filter(Boolean),
    }));
};

export const planStoryBeatsIntoClips = (
  plans: ClipPlannerScenePlan[],
  totalClips: number,
): PlannedClip[] => {
  const normalized = normalizePlans(plans);

  if (
    normalized.length === 0 ||
    totalClips <= 0
  ) {
    return [];
  }

  if (totalClips >= normalized.length) {
    const result = normalized.map(
      (plan, index) =>
        mergeBeatGroup([plan], index + 1),
    );

    while (result.length < totalClips) {
      const previous =
        result[result.length - 1];

      if (!previous) {
        break;
      }

      const previousPlan = previous.scenePlan;

      const continuationPlan: ClipPlannerScenePlan = {
        ...previousPlan,
        id: `${previousPlan.id ?? "clip"}-continuation-${result.length + 1}`,
        title: `${previousPlan.title} — continuation`,
        narration: "",
        durationSeconds: CLIP_DURATION_SECONDS,
        actions: [],
        startState: previousPlan.endState,
        endState: previousPlan.endState,
      };

      result.push({
        clipNumber: result.length + 1,
        storyBeatNumbers: previous.storyBeatNumbers,
        storyBeatIds: previous.storyBeatIds,
        scenePlan: continuationPlan,
      });
    }

    return result;
  }

  const groups: ClipPlannerScenePlan[][] = [];
  let currentGroup: ClipPlannerScenePlan[] = [];

  for (const beat of normalized) {
    if (currentGroup.length === 0) {
      currentGroup = [beat];
      continue;
    }

    const previous =
      currentGroup[currentGroup.length - 1];

    if (previous && canGroupBeats(previous, beat)) {
      currentGroup.push(beat);
    } else {
      groups.push(currentGroup);
      currentGroup = [beat];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  while (groups.length > totalClips) {
    let bestIndex = -1;
    let bestCost = Number.POSITIVE_INFINITY;

    for (
      let index = 0;
      index < groups.length - 1;
      index += 1
    ) {
      const leftGroup = groups[index];
      const rightGroup = groups[index + 1];
      const left = leftGroup?.[leftGroup.length - 1];
      const right = rightGroup?.[0];

      if (!left || !right) {
        continue;
      }

      const cost =
        getTransitionCost(left, right) +
        getBeatComplexity(left) * 0.2 +
        getBeatComplexity(right) * 0.2;

      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    }

    if (bestIndex < 0) {
      break;
    }

    const merged = [
      ...groups[bestIndex],
      ...groups[bestIndex + 1],
    ];

    groups.splice(bestIndex, 2, merged);
  }

  while (groups.length < totalClips) {
    let splitIndex = -1;
    let largestSize = 1;

    for (
      let index = 0;
      index < groups.length;
      index += 1
    ) {
      const size = groups[index]?.length ?? 0;

      if (size > largestSize) {
        largestSize = size;
        splitIndex = index;
      }
    }

    if (splitIndex < 0) {
      break;
    }

    const group = groups[splitIndex];
    const midpoint = Math.ceil(group.length / 2);
    const firstHalf = group.slice(0, midpoint);
    const secondHalf = group.slice(midpoint);

    groups.splice(
      splitIndex,
      1,
      firstHalf,
      secondHalf,
    );
  }

  return groups
    .slice(0, totalClips)
    .map((group, index) =>
      mergeBeatGroup(group, index + 1),
    );
};

export const getRequiredClipCount = (
  durationSeconds: number,
): number => {
  switch (durationSeconds) {
    case 15:
      return 3;
    case 30:
      return 6;
    case 60:
      return 12;
    default:
      return Math.max(
        1,
        Math.ceil(
          durationSeconds /
            CLIP_DURATION_SECONDS,
        ),
      );
  }
};