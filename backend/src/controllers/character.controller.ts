import type { Request, Response } from "express";

import {
  characterService,
  type CharacterRole,
} from "../services/character.service.js";

const getCharacterId = (
  request: Request,
): string | null => {
  const value = request.params.id;

  if (typeof value !== "string") {
    return null;
  }

  return value;
};

export const getCharacters = async (
  _request: Request,
  response: Response,
) => {
  const characters =
    await characterService.getCharacters();

  response.status(200).json({
    success: true,
    characters,
  });
};

export const getCharacter = async (
  request: Request,
  response: Response,
) => {
  const id = getCharacterId(
    request,
  );

  if (!id) {
    response.status(400).json({
      success: false,
      error: "Invalid character ID.",
    });

    return;
  }

  const character =
    await characterService.getCharacterById(
      id,
    );

  if (!character) {
    response.status(404).json({
      success: false,
      error: "Character not found.",
    });

    return;
  }

  response.status(200).json({
    success: true,
    character,
  });
};

export const createCharacter = async (
  request: Request,
  response: Response,
) => {
  const {
    name,
    role,
    description,
    imageUrl,
  } = request.body as {
    name?: unknown;
    role?: unknown;
    description?: unknown;
    imageUrl?: unknown;
  };

  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    response.status(400).json({
      success: false,
      error: "Character name is required.",
    });

    return;
  }

  if (
    role !== "Main Character" &&
    role !== "Supporting"
  ) {
    response.status(400).json({
      success: false,
      error:
        "Character role must be Main Character or Supporting.",
    });

    return;
  }

  if (
    typeof description !== "string" ||
    !description.trim()
  ) {
    response.status(400).json({
      success: false,
      error:
        "Character description is required.",
    });

    return;
  }

  if (
    typeof imageUrl !== "string" ||
    !imageUrl.trim()
  ) {
    response.status(400).json({
      success: false,
      error:
        "Character imageUrl is required.",
    });

    return;
  }

  const character =
    await characterService.createCharacter({
      name: name.trim(),
      role: role as CharacterRole,
      description:
        description.trim(),
      imageUrl:
        imageUrl.trim(),
    });

  response.status(201).json({
    success: true,
    character,
  });
};

export const updateCharacter = async (
  request: Request,
  response: Response,
) => {
  const id = getCharacterId(
    request,
  );

  if (!id) {
    response.status(400).json({
      success: false,
      error: "Invalid character ID.",
    });

    return;
  }

  const {
    name,
    role,
    description,
    imageUrl,
  } = request.body as {
    name?: unknown;
    role?: unknown;
    description?: unknown;
    imageUrl?: unknown;
  };

  if (
    name !== undefined &&
    (typeof name !== "string" ||
      !name.trim())
  ) {
    response.status(400).json({
      success: false,
      error: "Invalid character name.",
    });

    return;
  }

  if (
    role !== undefined &&
    role !== "Main Character" &&
    role !== "Supporting"
  ) {
    response.status(400).json({
      success: false,
      error: "Invalid character role.",
    });

    return;
  }

  if (
    description !== undefined &&
    (typeof description !== "string" ||
      !description.trim())
  ) {
    response.status(400).json({
      success: false,
      error:
        "Invalid character description.",
    });

    return;
  }

  if (
    imageUrl !== undefined &&
    (typeof imageUrl !== "string" ||
      !imageUrl.trim())
  ) {
    response.status(400).json({
      success: false,
      error:
        "Invalid character imageUrl.",
    });

    return;
  }

  const character =
    await characterService.updateCharacter(
      id,
      {
        ...(name !== undefined
          ? {
              name: name.trim(),
            }
          : {}),

        ...(role !== undefined
          ? {
              role: role as CharacterRole,
            }
          : {}),

        ...(description !== undefined
          ? {
              description:
                description.trim(),
            }
          : {}),

        ...(imageUrl !== undefined
          ? {
              imageUrl:
                imageUrl.trim(),
            }
          : {}),
      },
    );

  if (!character) {
    response.status(404).json({
      success: false,
      error: "Character not found.",
    });

    return;
  }

  response.status(200).json({
    success: true,
    character,
  });
};

export const deleteCharacter = async (
  request: Request,
  response: Response,
) => {
  const id = getCharacterId(
    request,
  );

  if (!id) {
    response.status(400).json({
      success: false,
      error: "Invalid character ID.",
    });

    return;
  }

  const deleted =
    await characterService.deleteCharacter(
      id,
    );

  if (!deleted) {
    response.status(404).json({
      success: false,
      error: "Character not found.",
    });

    return;
  }

  response.status(200).json({
    success: true,
  });
};