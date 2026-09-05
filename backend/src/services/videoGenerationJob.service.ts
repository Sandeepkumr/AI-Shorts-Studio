import { randomUUID } from "node:crypto";

import type {
  VideoGenerationOptions,
  VideoGenerationResult,
} from "../providers/video/videoProvider.js";

export type VideoJobStage =
  | "preparing"
  | "clips"
  | "joining"
  | "audio"
  | "finalizing"
  | "completed"
  | "failed";

export type VideoJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type VideoJobProgress = {
  status?: VideoJobStatus;
  stage?: VideoJobStage;
  progress?: number;
  currentClip?: number;
  totalClips?: number;
};

export type VideoJob = {
  jobId: string;
  status: VideoJobStatus;
  stage: VideoJobStage;
  progress: number;
  currentClip: number;
  totalClips: number;
  durationSeconds?: number;
  aspectRatio?: string;
  style?: string;
  language?: string;
  voice?: string;
  result?: VideoGenerationResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

const jobs = new Map<string, VideoJob>();

const clampProgress = (
  value: number,
): number =>
  Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );

export const createVideoJob = (
  options?: VideoGenerationOptions,
): VideoJob => {
  const duration =
    options?.durationSeconds === 15 ||
    options?.durationSeconds === 30 ||
    options?.durationSeconds === 60
      ? options.durationSeconds
      : 30;

  const totalClips =
    duration / 5;

  const now =
    new Date().toISOString();

  const job: VideoJob = {
    jobId: randomUUID(),
    status: "queued",
    stage: "preparing",
    progress: 0,
    currentClip: 0,
    totalClips,
    durationSeconds: duration,
    aspectRatio:
      options?.aspectRatio || "9:16",
    style: options?.style,
    language: options?.language,
    voice: options?.voice,
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(
    job.jobId,
    job,
  );

  console.log(
    `[VideoJob] Created: ${job.jobId}`,
  );

  return job;
};

export const getVideoJob = (
  jobId: string,
): VideoJob | undefined =>
  jobs.get(jobId);

export const updateVideoJob = (
  jobId: string,
  patch: VideoJobProgress,
): VideoJob | undefined => {
  const current =
    jobs.get(jobId);

  if (!current) {
    console.warn(
      `[VideoJob] Job not found: ${jobId}`,
    );

    return undefined;
  }

  const updated: VideoJob = {
    ...current,

    status:
      patch.status ??
      current.status,

    stage:
      patch.stage ??
      current.stage,

    progress:
      typeof patch.progress ===
      "number"
        ? clampProgress(
            patch.progress,
          )
        : current.progress,

    currentClip:
      typeof patch.currentClip ===
      "number"
        ? patch.currentClip
        : current.currentClip,

    totalClips:
      typeof patch.totalClips ===
      "number"
        ? patch.totalClips
        : current.totalClips,

    updatedAt:
      new Date().toISOString(),
  };

  jobs.set(
    jobId,
    updated,
  );

  return updated;
};

export const completeVideoJob = (
  jobId: string,
  result: VideoGenerationResult,
): VideoJob | undefined => {
  const current =
    jobs.get(jobId);

  if (!current) {
    return undefined;
  }

  const completed: VideoJob = {
    ...current,

    status: "completed",

    stage: "completed",

    progress: 100,

    result,

    updatedAt:
      new Date().toISOString(),
  };

  jobs.set(
    jobId,
    completed,
  );

  console.log(
    `[VideoJob] Completed: ${jobId}`,
  );

  return completed;
};

export const failVideoJob = (
  jobId: string,
  error: unknown,
): VideoJob | undefined => {
  const current =
    jobs.get(jobId);

  if (!current) {
    return undefined;
  }

  const message =
    error instanceof Error
      ? error.message
      : "Video generation failed.";

  const failed: VideoJob = {
    ...current,

    status: "failed",

    stage: "failed",

    error: message,

    updatedAt:
      new Date().toISOString(),
  };

  jobs.set(
    jobId,
    failed,
  );

  console.error(
    `[VideoJob] Failed: ${jobId}`,
    message,
  );

  return failed;
};