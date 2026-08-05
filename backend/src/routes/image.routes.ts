import { Router } from "express";

import { generateImages } from "../controllers/image.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const imageRouter = Router();

imageRouter.post("/generate", asyncHandler(generateImages));
