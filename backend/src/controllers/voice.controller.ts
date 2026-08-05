import type { Request, Response } from "express";

import { voiceService } from "../services/voice.service.js";
import type { ApiSuccess } from "../types/api.types.js";

export const generateVoice = async (request: Request, response: Response) => {
  const body = request.body as { script?: string; voice?: string } | undefined;
  const result = await voiceService.generateVoice(body?.script, body?.voice);
  const payload: ApiSuccess<typeof result> = { success: true, ...result };

  response.status(200).json(payload);
};
