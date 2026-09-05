import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { characters } from "../db/schema.js";

export type CharacterRole =
  | "Main Character"
  | "Supporting";

export type Character = {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCharacterInput = {
  name: string;
  role: CharacterRole;
  description: string;
  imageUrl: string;
};

export type UpdateCharacterInput = {
  name?: string;
  role?: CharacterRole;
  description?: string;
  imageUrl?: string;
};

export type SaveGeneratedCharacterInput = {
  name: string;
  role?: string;
  description: string;
  imageUrl: string;
};

const normalizeName = (
  value: string,
): string =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizeRole = (
  role?: string,
): CharacterRole =>
  role?.trim().toLowerCase() ===
  "main character"
    ? "Main Character"
    : "Supporting";

const mapCharacter = (
  character: typeof characters.$inferSelect,
): Character => ({
  id: character.id,
  name: character.name,
  role:
    character.role === "Main Character"
      ? "Main Character"
      : "Supporting",
  description: character.description,
  imageUrl: character.imageUrl,
  createdAt: character.createdAt,
  updatedAt: character.updatedAt,
});

export const characterService = {
  async getCharacters(): Promise<Character[]> {
    const result = await db
      .select()
      .from(characters)
      .orderBy(characters.createdAt);

    return result.map(mapCharacter);
  },

  async getCharacterById(
    id: string,
  ): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);

    const character = result[0];

    return character
      ? mapCharacter(character)
      : null;
  },

  async findCharacterByName(
    name: string,
  ): Promise<Character | null> {
    const cleanName =
      name.trim();

    if (!cleanName) {
      return null;
    }

    const allCharacters =
      await db
        .select()
        .from(characters)
        .orderBy(characters.createdAt);

    const normalizedTarget =
      normalizeName(cleanName);

    const match =
      allCharacters.find(
        (character) =>
          normalizeName(
            character.name,
          ) === normalizedTarget,
      );

    return match
      ? mapCharacter(match)
      : null;
  },

  async createCharacter(
    input: CreateCharacterInput,
  ): Promise<Character> {
    const cleanName =
      input.name.trim();

    const cleanDescription =
      input.description.trim();

    const cleanImageUrl =
      input.imageUrl.trim();

    if (!cleanName) {
      throw new Error(
        "Character name is required.",
      );
    }

    if (!cleanDescription) {
      throw new Error(
        "Character description is required.",
      );
    }

    if (!cleanImageUrl) {
      throw new Error(
        "Character imageUrl is required.",
      );
    }

    /*
     * Duplicate protection:
     * If a character with the same normalized
     * name already exists, return it instead
     * of creating another copy.
     */
    const existing =
      await this.findCharacterByName(
        cleanName,
      );

    if (existing) {
      return existing;
    }

    const result = await db
      .insert(characters)
      .values({
        name: cleanName,
        role: input.role,
        description:
          cleanDescription,
        imageUrl:
          cleanImageUrl,
      })
      .returning();

    const character = result[0];

    if (!character) {
      throw new Error(
        "Failed to create character.",
      );
    }

    return mapCharacter(character);
  },

  /*
   * Used specifically for AI-generated
   * characters discovered during story analysis.
   *
   * Existing saved character:
   *   -> return existing
   *
   * New AI-generated character:
   *   -> create and return
   */
  async saveGeneratedCharacter(
    input: SaveGeneratedCharacterInput,
  ): Promise<{
    character: Character;
    created: boolean;
  }> {
    const cleanName =
      input.name.trim();

    const cleanDescription =
      input.description.trim();

    const cleanImageUrl =
      input.imageUrl.trim();

    if (!cleanName) {
      throw new Error(
        "Generated character name is required.",
      );
    }

    if (!cleanDescription) {
      throw new Error(
        "Generated character description is required.",
      );
    }

    if (!cleanImageUrl) {
      throw new Error(
        "Generated character imageUrl is required.",
      );
    }

    /*
     * Existing character = reuse.
     * This prevents Vamika, Alex, etc. from
     * being duplicated in Character Library.
     */
    const existing =
      await this.findCharacterByName(
        cleanName,
      );

    if (existing) {
      console.log(
        `[CharacterService] Existing character reused: ${existing.name}`,
      );

      return {
        character: existing,
        created: false,
      };
    }

    const role =
      normalizeRole(input.role);

    const result = await db
      .insert(characters)
      .values({
        name: cleanName,
        role,
        description:
          cleanDescription,
        imageUrl:
          cleanImageUrl,
      })
      .returning();

    const character = result[0];

    if (!character) {
      throw new Error(
        "Failed to save generated character.",
      );
    }

    const mapped =
      mapCharacter(character);

    console.log(
      `[CharacterService] New AI character saved: ${mapped.name} (${mapped.id})`,
    );

    return {
      character: mapped,
      created: true,
    };
  },

  /*
   * Useful when we already know a character
   * by its saved database ID.
   */
  async getOrCreateCharacter(
    input: SaveGeneratedCharacterInput,
  ): Promise<Character> {
    const result =
      await this.saveGeneratedCharacter(
        input,
      );

    return result.character;
  },

  async updateCharacter(
    id: string,
    input: UpdateCharacterInput,
  ): Promise<Character | null> {
    /*
     * Prevent renaming one character into
     * another existing character name.
     */
    if (
      input.name !== undefined
    ) {
      const cleanName =
        input.name.trim();

      if (!cleanName) {
        throw new Error(
          "Character name cannot be empty.",
        );
      }

      const existing =
        await this.findCharacterByName(
          cleanName,
        );

      if (
        existing &&
        existing.id !== id
      ) {
        throw new Error(
          `A character named "${cleanName}" already exists.`,
        );
      }
    }

    const result = await db
      .update(characters)
      .set({
        ...(input.name !== undefined
          ? {
              name:
                input.name.trim(),
            }
          : {}),

        ...(input.role !== undefined
          ? {
              role:
                input.role,
            }
          : {}),

        ...(input.description !==
        undefined
          ? {
              description:
                input.description.trim(),
            }
          : {}),

        ...(input.imageUrl !==
        undefined
          ? {
              imageUrl:
                input.imageUrl.trim(),
            }
          : {}),

        updatedAt:
          new Date(),
      })
      .where(eq(characters.id, id))
      .returning();

    const character =
      result[0];

    return character
      ? mapCharacter(character)
      : null;
  },

  async deleteCharacter(
    id: string,
  ): Promise<boolean> {
    const result = await db
      .delete(characters)
      .where(eq(characters.id, id))
      .returning({
        id: characters.id,
      });

    return result.length > 0;
  },
};