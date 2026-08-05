import { Router } from "express";

import { getCredits } from "../controllers/credit.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const creditRouter = Router();

creditRouter.get("/", asyncHandler(getCredits));
