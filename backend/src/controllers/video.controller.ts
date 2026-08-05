import type { Request, Response } from "express";

import { videoService } from "../services/video.service.js";
import type { ApiSuccess } from "../types/api.types.js";

export const generateVideo = async (request: Request, response: Response) => {
  const result = await videoService.generateVideo(request.body);
  const payload: ApiSuccess<typeof result> = { success: true, ...result };

  response.status(200).json(payload);
};
