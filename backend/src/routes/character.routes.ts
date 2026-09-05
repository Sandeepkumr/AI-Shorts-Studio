import { Router } from "express";

import {
  createCharacter,
  deleteCharacter,
  getCharacter,
  getCharacters,
  updateCharacter,
} from "../controllers/character.controller.js";

import { asyncHandler } from "../utils/async-handler.js";

export const characterRouter = Router();

characterRouter.get(
  "/",
  asyncHandler(getCharacters),
);

characterRouter.get(
  "/:id",
  asyncHandler(getCharacter),
);

characterRouter.post(
  "/",
  asyncHandler(createCharacter),
);

characterRouter.put(
  "/:id",
  asyncHandler(updateCharacter),
);

characterRouter.delete(
  "/:id",
  asyncHandler(deleteCharacter),
);