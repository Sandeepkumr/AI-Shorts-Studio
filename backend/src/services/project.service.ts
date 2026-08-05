import type { MockProject } from "../types/api.types.js";

const mockProjects: MockProject[] = [
  {
    id: "project-travel-vlog",
    title: "Travel Vlog",
    status: "images_ready",
    updatedAt: "2026-08-03T08:30:00.000Z",
  },
  {
    id: "project-space-adventure",
    title: "Space Adventure",
    status: "rendering",
    updatedAt: "2026-08-03T06:15:00.000Z",
  },
];

export const projectService = {
  async getProjects(): Promise<MockProject[]> {
    return mockProjects;
  },
};
