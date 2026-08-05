export type ApiSuccess<T extends object> = {
  success: true;
} & T;

export type MockProject = {
  id: string;
  title: string;
  status: "draft" | "images_ready" | "rendering";
  updatedAt: string;
};
