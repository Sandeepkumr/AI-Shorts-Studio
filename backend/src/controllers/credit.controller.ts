import type { Request, Response } from "express";

import { creditService } from "../services/credit.service.js";

export const getCredits = async (_request: Request, response: Response) => {
  const result = await creditService.getRemainingCredits();

  response.status(200).json(result);
};
