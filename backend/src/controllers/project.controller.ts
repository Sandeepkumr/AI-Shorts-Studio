import type { Request, Response } from "express";

import { projectService } from "../services/project.service.js";
import type { ApiSuccess } from "../types/api.types.js";

export const getProjects = async (_request: Request, response: Response) => {
  const projects = await projectService.getProjects();
  const payload: ApiSuccess<{ projects: typeof projects }> = {
    success: true,
    projects,
  };

  response.status(200).json(payload);
};
