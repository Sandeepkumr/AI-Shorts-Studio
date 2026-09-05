import type {
  VideoCharacter,
  VideoScenePlan,
} from "../providers/video/videoProvider.js";

export type StoryManifestValidationIssue = {
  code: string;
  message: string;
  sceneNumber?: number;
  characterId?: string;
};

export type StoryManifestValidationResult = {
  valid: boolean;
  issues: StoryManifestValidationIssue[];
};

const isNonEmptyString = (
  value: unknown,
): value is string =>
  typeof value === "string" &&
  value.trim().length > 0;

const uniqueStrings = (
  values: string[],
): string[] =>
  Array.from(
    new Set(
      values
        .filter(isNonEmptyString)
        .map((value) =>
          value.trim(),
        ),
    ),
  );

/**
 * Validate the structured story manifest before it
 * reaches clip planning / video generation.
 *
 * This validator is intentionally generic.
 * It does not know anything about specific stories,
 * characters, props, or actions.
 */
export const validateStoryManifest = (
  scenePlans: VideoScenePlan[],
  characters: VideoCharacter[] = [],
): StoryManifestValidationResult => {
  const issues: StoryManifestValidationIssue[] =
    [];

  if (!Array.isArray(scenePlans)) {
    issues.push({
      code: "INVALID_SCENE_PLANS",
      message:
        "Story manifest scene plans must be an array.",
    });

    return {
      valid: false,
      issues,
    };
  }

  if (scenePlans.length === 0) {
    issues.push({
      code: "EMPTY_STORY_MANIFEST",
      message:
        "Story manifest contains no story beats.",
    });

    return {
      valid: false,
      issues,
    };
  }

  const validCharacterIds =
    new Set(
      characters
        .map(
          (character) =>
            character.id,
        )
        .filter(isNonEmptyString),
    );

  const seenSceneNumbers =
    new Set<number>();

  const seenSceneIds =
    new Set<string>();

  scenePlans.forEach(
    (scene, index) => {
      const expectedSceneNumber =
        index + 1;

      /*
       * -------------------------------------------------
       * Scene numbering
       * -------------------------------------------------
       */

      if (
        scene.sceneNumber !==
        expectedSceneNumber
      ) {
        issues.push({
          code: "INVALID_SCENE_ORDER",
          message:
            `Expected sceneNumber ${expectedSceneNumber}, received ${scene.sceneNumber}.`,
          sceneNumber:
            scene.sceneNumber,
        });
      }

      if (
        seenSceneNumbers.has(
          scene.sceneNumber,
        )
      ) {
        issues.push({
          code: "DUPLICATE_SCENE_NUMBER",
          message:
            `Scene number ${scene.sceneNumber} appears more than once.`,
          sceneNumber:
            scene.sceneNumber,
        });
      }

      seenSceneNumbers.add(
        scene.sceneNumber,
      );

      /*
       * -------------------------------------------------
       * Stable beat ID
       * -------------------------------------------------
       */

      if (
        scene.id !==
          undefined &&
        !isNonEmptyString(scene.id)
      ) {
        issues.push({
          code: "INVALID_SCENE_ID",
          message:
            "Scene ID is present but empty.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      if (
        isNonEmptyString(scene.id)
      ) {
        const sceneId =
          scene.id.trim();

        if (
          seenSceneIds.has(sceneId)
        ) {
          issues.push({
            code: "DUPLICATE_SCENE_ID",
            message:
              `Scene ID "${sceneId}" is duplicated.`,
            sceneNumber:
              scene.sceneNumber,
          });
        }

        seenSceneIds.add(sceneId);
      }

      /*
       * -------------------------------------------------
       * Required scene content
       * -------------------------------------------------
       */

      if (
        !isNonEmptyString(
          scene.title,
        )
      ) {
        issues.push({
          code: "MISSING_SCENE_TITLE",
          message:
            "Scene title is missing.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      if (
        !isNonEmptyString(
          scene.description,
        )
      ) {
        issues.push({
          code: "MISSING_SCENE_DESCRIPTION",
          message:
            "Scene description is missing.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      if (
        !isNonEmptyString(
          scene.startState,
        )
      ) {
        issues.push({
          code: "MISSING_START_STATE",
          message:
            "Scene start state is missing.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      if (
        !isNonEmptyString(
          scene.endState,
        )
      ) {
        issues.push({
          code: "MISSING_END_STATE",
          message:
            "Scene end state is missing.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      /*
       * -------------------------------------------------
       * Duration sanity
       * -------------------------------------------------
       */

      if (
        !Number.isFinite(
          scene.durationSeconds,
        )
      ) {
        issues.push({
          code: "INVALID_SCENE_DURATION",
          message:
            "Scene duration must be a finite number.",
          sceneNumber:
            scene.sceneNumber,
        });
      } else if (
        scene.durationSeconds <
          1
      ) {
        issues.push({
          code: "INVALID_SCENE_DURATION",
          message:
            "Scene duration must be greater than zero.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      /*
       * -------------------------------------------------
       * Visible character validation
       * -------------------------------------------------
       */

      const visibleCharacterIds =
        uniqueStrings(
          scene.visibleCharacterIds ??
            [],
        );

      if (
        visibleCharacterIds.length ===
        0
      ) {
        issues.push({
          code: "NO_VISIBLE_CHARACTERS",
          message:
            "Scene has no visible character IDs.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      if (
        validCharacterIds.size > 0
      ) {
        for (
          const characterId of visibleCharacterIds
        ) {
          if (
            !validCharacterIds.has(
              characterId,
            )
          ) {
            issues.push({
              code: "INVALID_CHARACTER_ID",
              message:
                `Character ID "${characterId}" is not present in the character list.`,
              sceneNumber:
                scene.sceneNumber,
              characterId,
            });
          }
        }
      }

      /*
       * -------------------------------------------------
       * Scene actions
       * -------------------------------------------------
       */

      const actions =
        uniqueStrings(
          scene.actions ?? [],
        );

      if (actions.length === 0) {
        issues.push({
          code: "NO_SCENE_ACTIONS",
          message:
            "Scene contains no observable actions.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      /*
       * -------------------------------------------------
       * Per-character plans
       * -------------------------------------------------
       */

      const characterPlans =
        Array.isArray(
          scene.characterPlans,
        )
          ? scene.characterPlans
          : [];

      if (
        visibleCharacterIds.length >
          0 &&
        characterPlans.length === 0
      ) {
        issues.push({
          code: "MISSING_CHARACTER_PLANS",
          message:
            "Visible characters exist but no per-character plans were provided.",
          sceneNumber:
            scene.sceneNumber,
        });
      }

      const planCharacterIds =
        new Set<string>();

      for (
        const plan of characterPlans
      ) {
        if (
          !plan ||
          typeof plan !==
            "object"
        ) {
          issues.push({
            code: "INVALID_CHARACTER_PLAN",
            message:
              "A character plan is invalid.",
            sceneNumber:
              scene.sceneNumber,
          });

          continue;
        }

        const characterId =
          plan.characterId?.trim();

        if (!characterId) {
          issues.push({
            code: "MISSING_PLAN_CHARACTER_ID",
            message:
              "Character plan is missing characterId.",
            sceneNumber:
              scene.sceneNumber,
          });

          continue;
        }

        if (
          planCharacterIds.has(
            characterId,
          )
        ) {
          issues.push({
            code: "DUPLICATE_CHARACTER_PLAN",
            message:
              `Character "${characterId}" has more than one character plan in the same scene.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        planCharacterIds.add(
          characterId,
        );

        if (
          !visibleCharacterIds.includes(
            characterId,
          )
        ) {
          issues.push({
            code: "CHARACTER_PLAN_NOT_VISIBLE",
            message:
              `Character plan for "${characterId}" exists, but that character is not listed in visibleCharacterIds.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        if (
          validCharacterIds.size >
            0 &&
          !validCharacterIds.has(
            characterId,
          )
        ) {
          issues.push({
            code: "INVALID_PLAN_CHARACTER_ID",
            message:
              `Character plan references unknown character "${characterId}".`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        /*
         * Actions
         */

        const planActions =
          uniqueStrings(
            plan.actions ?? [],
          );

        if (
          planActions.length === 0
        ) {
          issues.push({
            code: "MISSING_CHARACTER_ACTIONS",
            message:
              `Character "${characterId}" has no actions.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        /*
         * Emotion
         */

        if (
          !isNonEmptyString(
            plan.emotion,
          )
        ) {
          issues.push({
            code: "MISSING_EMOTION",
            message:
              `Character "${characterId}" has no emotion.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        /*
         * Expression
         */

        if (
          !isNonEmptyString(
            plan.expression,
          )
        ) {
          issues.push({
            code: "MISSING_EXPRESSION",
            message:
              `Character "${characterId}" has no expression.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        /*
         * Body language
         */

        const bodyLanguage =
          uniqueStrings(
            plan.bodyLanguage ??
              [],
          );

        if (
          bodyLanguage.length === 0
        ) {
          issues.push({
            code: "MISSING_BODY_LANGUAGE",
            message:
              `Character "${characterId}" has no body-language instructions.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        /*
         * Start state
         */

        if (
          !isNonEmptyString(
            plan.startState,
          )
        ) {
          issues.push({
            code: "MISSING_CHARACTER_START_STATE",
            message:
              `Character "${characterId}" has no start state.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }

        /*
         * End state
         */

        if (
          !isNonEmptyString(
            plan.endState,
          )
        ) {
          issues.push({
            code: "MISSING_CHARACTER_END_STATE",
            message:
              `Character "${characterId}" has no end state.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }
      }

      /*
       * Every visible character must have exactly
       * one character plan.
       */

      for (
        const characterId of visibleCharacterIds
      ) {
        if (
          !planCharacterIds.has(
            characterId,
          )
        ) {
          issues.push({
            code: "MISSING_VISIBLE_CHARACTER_PLAN",
            message:
              `Visible character "${characterId}" does not have a character plan.`,
            sceneNumber:
              scene.sceneNumber,
            characterId,
          });
        }
      }

      /*
       * -------------------------------------------------
       * Continuity validation
       * -------------------------------------------------
       */

      if (
        scene.continuity
      ) {
        const previousSceneNumber =
          scene.continuity
            .previousSceneNumber;

        if (
          scene.sceneNumber === 1
        ) {
          if (
            previousSceneNumber !==
              undefined &&
            previousSceneNumber !== 0
          ) {
            issues.push({
              code: "INVALID_FIRST_SCENE_CONTINUITY",
              message:
                "The first scene cannot reference a previous scene.",
              sceneNumber:
                scene.sceneNumber,
            });
          }
        } else if (
          previousSceneNumber !==
          scene.sceneNumber - 1
        ) {
          issues.push({
            code: "BROKEN_CONTINUITY_ORDER",
            message:
              `Scene ${scene.sceneNumber} should reference scene ${scene.sceneNumber - 1} as its previous scene.`,
            sceneNumber:
              scene.sceneNumber,
          });
        }

        const inheritedStates =
          scene.continuity
            .inheritedCharacterStates ??
          {};

        for (
          const [
            characterId,
            state,
          ] of Object.entries(
            inheritedStates,
          )
        ) {
          if (
            !validCharacterIds.has(
              characterId,
            ) &&
            validCharacterIds.size >
              0
          ) {
            issues.push({
              code: "INVALID_INHERITED_CHARACTER_ID",
              message:
                `Continuity references unknown character "${characterId}".`,
              sceneNumber:
                scene.sceneNumber,
              characterId,
            });
          }

          if (
            !isNonEmptyString(state)
          ) {
            issues.push({
              code: "EMPTY_INHERITED_CHARACTER_STATE",
              message:
                `Inherited state for "${characterId}" is empty.`,
              sceneNumber:
                scene.sceneNumber,
              characterId,
            });
          }
        }

        if (
          !Array.isArray(
            scene.continuity
              .requiredContinuity,
          )
        ) {
          issues.push({
            code: "INVALID_CONTINUITY_RULES",
            message:
              "requiredContinuity must be an array.",
            sceneNumber:
              scene.sceneNumber,
          });
        }
      } else {
        issues.push({
          code: "MISSING_CONTINUITY",
          message:
            "Scene continuity information is missing.",
          sceneNumber:
            scene.sceneNumber,
        });
      }
    },
  );

  /*
   * ---------------------------------------------------
   * Global chronology check
   * ---------------------------------------------------
   */

  const sortedScenes =
    [...scenePlans].sort(
      (a, b) =>
        a.sceneNumber -
        b.sceneNumber,
    );

  for (
    let index = 1;
    index <
    sortedScenes.length;
    index += 1
  ) {
    const previous =
      sortedScenes[index - 1];

    const current =
      sortedScenes[index];

    if (
      previous &&
      current
    ) {
      if (
        current.sceneNumber !==
        previous.sceneNumber + 1
      ) {
        issues.push({
          code: "SCENE_GAP",
          message:
            `Scene sequence jumps from ${previous.sceneNumber} to ${current.sceneNumber}.`,
          sceneNumber:
            current.sceneNumber,
        });
      }

      /*
       * If the current beat explicitly says the location
       * continues, make sure a location exists on both
       * beats.
       */
      if (
        current.continuity
          ?.locationContinues
      ) {
        const previousLocation =
          previous.location?.trim();

        const currentLocation =
          current.location?.trim();

        if (
          !previousLocation ||
          !currentLocation
        ) {
          issues.push({
            code: "LOCATION_CONTINUITY_INCOMPLETE",
            message:
              `Scene ${current.sceneNumber} says the location continues, but one of the adjacent scenes has no location.`,
            sceneNumber:
              current.sceneNumber,
          });
        }
      }
    }
  }

  /*
   * ---------------------------------------------------
   * Final beat check
   * ---------------------------------------------------
   */

  const finalScene =
    sortedScenes[
      sortedScenes.length - 1
    ];

  if (finalScene) {
    if (
      !isNonEmptyString(
        finalScene.endState,
      )
    ) {
      issues.push({
        code: "FINAL_SCENE_HAS_NO_END_STATE",
        message:
          "The final story beat does not have a resolved end state.",
        sceneNumber:
          finalScene.sceneNumber,
      });
    }

    if (
      finalScene.actions.length ===
      0
    ) {
      issues.push({
        code: "FINAL_SCENE_HAS_NO_ACTIONS",
        message:
          "The final story beat has no observable action or resolved event.",
        sceneNumber:
          finalScene.sceneNumber,
      });
    }
  }

  return {
    valid:
      issues.length === 0,
    issues,
  };
};

/**
 * Throw a clear error when the manifest is not safe
 * to send to the video planning/generation pipeline.
 */
export const assertValidStoryManifest = (
  scenePlans: VideoScenePlan[],
  characters: VideoCharacter[] = [],
): void => {
  const result =
    validateStoryManifest(
      scenePlans,
      characters,
    );

  if (result.valid) {
    return;
  }

  const formattedIssues =
    result.issues
      .map(
        (issue) =>
          `[${issue.code}] ${issue.message}`,
      )
      .join("\n");

  throw new Error(
    `Story manifest validation failed:\n${formattedIssues}`,
  );
};