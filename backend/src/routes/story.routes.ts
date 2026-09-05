import { Router } from "express";

import {
  analyzeStory,
  optimizeStory,
} from "../controllers/story.controller.js";

import { asyncHandler } from "../utils/async-handler.js";

export const storyRouter =
  Router();

storyRouter.post(
  "/analyze",
  asyncHandler(analyzeStory),
);

storyRouter.post(
  "/optimize",
  asyncHandler(optimizeStory),
);