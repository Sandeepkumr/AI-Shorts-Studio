import { Router } from "express";

import { getProjects } from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const projectRouter = Router();

projectRouter.get("/", asyncHandler(getProjects));
