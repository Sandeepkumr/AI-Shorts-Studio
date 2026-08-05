import { Router } from "express";

import { createJob, getJob } from "../controllers/job.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const jobRouter = Router();

jobRouter.post("/", asyncHandler(createJob));
jobRouter.get("/:id", asyncHandler(getJob));
