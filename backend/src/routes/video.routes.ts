import { Router } from "express";

import {
  generateVideo,
  getVideoGenerationStatus,
} from "../controllers/video.controller.js";

import {
  asyncHandler,
} from "../utils/async-handler.js";

export const videoRouter =
  Router();

videoRouter.post(
  "/generate",
  asyncHandler(
    generateVideo,
  ),
);

videoRouter.get(
  "/status/:jobId",
  asyncHandler(
    getVideoGenerationStatus,
  ),
);