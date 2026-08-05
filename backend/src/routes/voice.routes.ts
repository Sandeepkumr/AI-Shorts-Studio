import { Router } from "express";

import { generateVoice } from "../controllers/voice.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const voiceRouter = Router();

voiceRouter.post("/generate", asyncHandler(generateVoice));
