import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

import {
  completeProfile,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";

import {
  uploadProfileImage,
} from "../controllers/profile.controller.js";

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, "uploads/profile-images");
  },

  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const filename = `${crypto.randomUUID()}${extension}`;

    callback(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image files are allowed."));
  },
});

export const authRouter = Router();

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.put("/profile", completeProfile);

authRouter.post(
  "/profile-image",
  upload.single("image"),
  uploadProfileImage,
);