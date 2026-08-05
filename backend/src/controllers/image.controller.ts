import type { Request, Response } from "express";

import { imageService } from "../services/image.service.js";
import type { ApiSuccess } from "../types/api.types.js";

export const generateImages = async (request: Request, response: Response) => {
  const body = request.body as { prompt?: string } | undefined;
  const result = await imageService.generateImages(body?.prompt);
  const payload: ApiSuccess<typeof result> = { success: true, ...result };

  response.status(200).json(payload);
};
