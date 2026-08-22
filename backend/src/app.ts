import express from "express";

import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { creditRouter } from "./routes/credit.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { imageRouter } from "./routes/image.routes.js";
import { jobRouter } from "./routes/job.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { promptRouter } from "./routes/prompt.routes.js";
import { videoRouter } from "./routes/video.routes.js";
import { voiceRouter } from "./routes/voice.routes.js";
import { authRouter } from "./routes/auth.routes.js";

export const app = express();

app.use(express.json());
app.use(loggerMiddleware);

app.use("/uploads", express.static("uploads"));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/prompt", promptRouter);
app.use("/images", imageRouter);
app.use("/voice", voiceRouter);
app.use("/video", videoRouter);
app.use("/projects", projectRouter);
app.use("/credits", creditRouter);
app.use("/jobs", jobRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);