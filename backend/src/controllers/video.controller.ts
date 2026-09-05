import type {
  Request,
  Response,
} from "express";

import {
  videoService,
} from "../services/video.service.js";

import {
  completeVideoJob,
  createVideoJob,
  failVideoJob,
  getVideoJob,
  updateVideoJob,
} from "../services/videoGenerationJob.service.js";

export const generateVideo = async (
  request: Request,
  response: Response,
) => {
  const options =
    request.body ?? {};

  const job =
    createVideoJob(
      options,
    );

  console.log(
    `[VideoController] Created video job: ${job.jobId}`,
  );

  /*
   * Return immediately.
   * Frontend will use the jobId to open the
   * generating screen and poll the status endpoint.
   */
  response.status(202).json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
  });

  /*
   * Run the actual generation in the background.
   */
  void videoService
    .generateVideo(
      options,
      (progress) => {
        updateVideoJob(
          job.jobId,
          progress,
        );
      },
    )
    .then(
      (result) => {
        completeVideoJob(
          job.jobId,
          result,
        );
      },
    )
    .catch(
      (error) => {
        failVideoJob(
          job.jobId,
          error,
        );
      },
    );
};

export const getVideoGenerationStatus =
  async (
    request: Request,
    response: Response,
  ) => {
    const rawJobId =
      request.params.jobId;

    const jobId =
      Array.isArray(rawJobId)
        ? rawJobId[0]
        : rawJobId;

    if (!jobId) {
      response.status(400).json({
        success: false,
        error:
          "Video generation job ID is required.",
      });

      return;
    }

    const job =
      getVideoJob(
        jobId,
      );

    if (!job) {
      response.status(404).json({
        success: false,
        error:
          "Video generation job not found.",
      });

      return;
    }

    response.status(200).json({
      success: true,

      jobId:
        job.jobId,

      status:
        job.status,

      stage:
        job.stage,

      progress:
        job.progress,

      currentClip:
        job.currentClip,

      totalClips:
        job.totalClips,

      durationSeconds:
        job.durationSeconds,

      aspectRatio:
        job.aspectRatio,

      style:
        job.style,

      language:
        job.language,

      voice:
        job.voice,

      video:
        job.result?.video,

      model:
        job.result?.model,

      error:
        job.error,
    });
  };