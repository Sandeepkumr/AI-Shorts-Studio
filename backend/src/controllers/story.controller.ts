import type {
  Request,
  Response,
} from "express";

import type { ApiSuccess } from "../types/api.types.js";

import {
  storyAnalysisService,
} from "../services/storyAnalysis.service.js";

import {
  storyOptimizationService,
} from "../services/storyOptimization.service.js";

import type {
  StoryAnalysisOptions,
  StoryAnalysisResult,
} from "../providers/story/storyAnalysisProvider.js";

export const analyzeStory = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const body =
    request.body as {
      story?: string;
      requestedDurationSeconds?:
        | 15
        | 30
        | 60;
      language?: StoryAnalysisOptions["language"];
    };

  const options:
    StoryAnalysisOptions = {
    requestedDurationSeconds:
      body.requestedDurationSeconds,
    language:
      body.language,
  };

  const result =
    await storyAnalysisService.analyzeStory(
      body.story,
      options,
    );

  const payload:
    ApiSuccess<typeof result> = {
    success: true,
    ...result,
  };

  response
    .status(200)
    .json(payload);
};

export const optimizeStory = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const body =
    request.body as {
      story?: string;
      analysis?: StoryAnalysisResult;
      requestedDurationSeconds?:
        | 15
        | 30
        | 60;
      language?: StoryAnalysisOptions["language"];
    };

  const options:
    StoryAnalysisOptions = {
    requestedDurationSeconds:
      body.requestedDurationSeconds,
    language:
      body.language,
  };

  /*
   * ============================================================
   * SAFE RUNTIME CONTRACT DEBUG
   *
   * Do not log the full story or full analysis.
   * We only need to verify the shape reaching the backend.
   * ============================================================
   */
  console.log(
    "[STORY OPTIMIZE] received analysis contract:",
    {
      analysisType:
        typeof body.analysis,

      analysisKeys:
        body.analysis &&
        typeof body.analysis === "object"
          ? Object.keys(body.analysis)
          : [],

      charactersIsArray:
        Array.isArray(
          body.analysis?.characters,
        ),

      charactersCount:
        Array.isArray(
          body.analysis?.characters,
        )
          ? body.analysis.characters.length
          : null,

      storyBeatsIsArray:
        Array.isArray(
          body.analysis?.storyBeats,
        ),

      storyBeatsCount:
        Array.isArray(
          body.analysis?.storyBeats,
        )
          ? body.analysis.storyBeats.length
          : null,

      storyEventsIsArray:
        Array.isArray(
          body.analysis?.storyEvents,
        ),

      storyEventsCount:
        Array.isArray(
          body.analysis?.storyEvents,
        )
          ? body.analysis.storyEvents.length
          : null,

      requestedDurationSeconds:
        body.requestedDurationSeconds,

      language:
        body.language,
    },
  );

  const result =
    await storyOptimizationService.optimizeStory(
      body.story,
      body.analysis,
      options,
    );

  const payload:
    ApiSuccess<typeof result> = {
    success: true,
    ...result,
  };

  response
    .status(200)
    .json(payload);
};