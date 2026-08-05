import type { Request, Response } from "express";

import { promptService } from "../services/prompt.service.js";
import type { ApiSuccess } from "../types/api.types.js";

export const enhancePrompt = async (request: Request, response: Response) => {
  const body = request.body as { prompt?: string } | undefined;
  const result = await promptService.enhancePrompt(body?.prompt);
  const payload: ApiSuccess<typeof result> = { success: true, ...result };

  response.status(200).json(payload);
};
