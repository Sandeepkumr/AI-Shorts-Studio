import type { Request, Response } from "express";

export const uploadProfileImage = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const file = request.file;

  if (!file) {
    response.status(400).json({
      success: false,
      message: "Profile image is required.",
    });
    return;
  }

  response.status(200).json({
    success: true,
    imageUrl: `/uploads/profile-images/${file.filename}`,
  });
};