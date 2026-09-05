import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedProject = {
  id: string;
  title: string;
  type: "Text to Video" | "Image to Video";
  duration: string;
  date: string;
  status: "Completed";
  favorite: boolean;
  videoUrl: string;
  ratio?: string;
  style?: string;
  language?: string;
  voice?: string;
  resolution?: string;
};

const STORAGE_KEY = "@shivora/projects";

const normalizeProject = (
  project: SavedProject,
): SavedProject => ({
  id: project.id,
  title:
    project.title.trim() ||
    "Your Video",

  type:
    project.type,

  duration:
    project.duration ||
    "0 sec",

  date:
    project.date ||
    "Just now",

  status:
    "Completed",

  favorite:
    Boolean(project.favorite),

  videoUrl:
    project.videoUrl,

  ratio:
    project.ratio,

  style:
    project.style,

  language:
    project.language,

  voice:
    project.voice,

  resolution:
    project.resolution,
});

export const projectStore = {
  async getProjects(): Promise<
    SavedProject[]
  > {
    try {
      const raw =
        await AsyncStorage.getItem(
          STORAGE_KEY,
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      if (
        !Array.isArray(
          parsed,
        )
      ) {
        return [];
      }

      return parsed
        .filter(
          (project) =>
            project &&
            typeof project ===
              "object" &&
            typeof project.id ===
              "string" &&
            typeof project.title ===
              "string" &&
            typeof project.videoUrl ===
              "string",
        )
        .map(
          (project) =>
            normalizeProject(
              project as SavedProject,
            ),
        );
    } catch (error) {
      console.error(
        "[ProjectStore] Failed to read projects:",
        error,
      );

      return [];
    }
  },

  async saveProject(
    project: SavedProject,
  ): Promise<SavedProject> {
    const normalized =
      normalizeProject(
        project,
      );

    const current =
      await this.getProjects();

    const withoutDuplicate =
      current.filter(
        (item) =>
          item.id !==
            normalized.id &&
          item.videoUrl !==
            normalized.videoUrl,
      );

    const next = [
      normalized,
      ...withoutDuplicate,
    ];

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );

    console.log(
      "[ProjectStore] Project saved:",
      normalized.title,
    );

    return normalized;
  },

  async deleteProject(
    projectId: string,
  ): Promise<void> {
    const current =
      await this.getProjects();

    const next =
      current.filter(
        (item) =>
          item.id !==
          projectId,
      );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );

    console.log(
      "[ProjectStore] Project deleted:",
      projectId,
    );
  },

  async toggleFavorite(
    projectId: string,
  ): Promise<
    SavedProject[]
  > {
    const current =
      await this.getProjects();

    const next =
      current.map(
        (item) =>
          item.id ===
          projectId
            ? {
                ...item,
                favorite:
                  !item.favorite,
              }
            : item,
      );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );

    return next;
  },

  async clearProjects(): Promise<void> {
    await AsyncStorage.removeItem(
      STORAGE_KEY,
    );
  },
};

export const getSavedProjects =
  async (): Promise<
    SavedProject[]
  > => {
    return projectStore.getProjects();
  };

export const saveProject =
  async (
    project: SavedProject,
  ): Promise<SavedProject> => {
    return projectStore.saveProject(
      project,
    );
  };