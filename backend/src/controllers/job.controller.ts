import type { Request, Response } from "express";

import { isJobType, jobManager } from "../jobs/jobManager.js";

export const createJob = async (request: Request, response: Response) => {
  const body = request.body as { type?: unknown } | undefined;

  if (!isJobType(body?.type)) {
    response.status(400).json({
      success: false,
      error: "type must be one of: prompt, image, voice, video.",
    });
    return;
  }

  const job = await jobManager.createJob(body.type);

  response.status(202).json({ jobId: job.id });
};

export const getJob = async (request: Request, response: Response) => {
  const jobId = request.params.id;
  const job =
    typeof jobId === "string" ? await jobManager.getJob(jobId) : undefined;

  if (!job) {
    response.status(404).json({
      success: false,
      error: "Job not found.",
    });
    return;
  }

  response.status(200).json(job);
};
