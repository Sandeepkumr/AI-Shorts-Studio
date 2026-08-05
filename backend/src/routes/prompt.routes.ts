import { Router } from "express";

import { enhancePrompt } from "../controllers/prompt.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const promptRouter = Router();

promptRouter.post("/enhance", asyncHandler(enhancePrompt));
