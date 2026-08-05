export type ProjectStatus = "Images Generated" | "Rendering (68%)" | "Draft Saved";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  editedAt: string;
  action: string;
  artwork: "travel" | "space" | "product";
  accent: "primary" | "success" | "warning";
};

export type SaveProjectInput = Pick<Project, "title"> &
  Partial<Pick<Project, "status" | "artwork" | "accent">>;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const projects: Project[] = [
  {
    id: "travel-vlog",
    title: "Travel Vlog",
    status: "Images Generated",
    editedAt: "Last edited 2 hours ago",
    action: "Continue",
    artwork: "travel",
    accent: "success",
  },
  {
    id: "space-adventure",
    title: "Space Adventure",
    status: "Rendering (68%)",
    editedAt: "Last edited 5 hours ago",
    action: "View Progress",
    artwork: "space",
    accent: "primary",
  },
  {
    id: "product-commercial",
    title: "Product Commercial",
    status: "Draft Saved",
    editedAt: "Last edited 1 day ago",
    action: "Continue",
    artwork: "product",
    accent: "warning",
  },
];

export const projectService = {
  async saveProject(input: SaveProjectInput): Promise<Project> {
    await wait(180);

    const project: Project = {
      id: `mock-project-${projects.length + 1}`,
      title: input.title,
      status: input.status ?? "Draft Saved",
      editedAt: "Last edited just now",
      action: "Continue",
      artwork: input.artwork ?? "product",
      accent: input.accent ?? "warning",
    };

    projects.unshift(project);
    return project;
  },

  async getProjects(): Promise<Project[]> {
    await wait(120);
    return projects;
  },
};
