import { randomUUID } from "node:crypto";

export const jobTypes = ["prompt", "image", "voice", "video"] as const;
export const jobStatuses = ["queued", "processing", "completed", "failed"] as const;

export type JobType = (typeof jobTypes)[number];
export type JobStatus = (typeof jobStatuses)[number];

export type JobResult =
  | { enhancedPrompt: string }
  | { images: string[] }
  | { audio: string }
  | { video: string };

export type Job = {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  result: JobResult | null;
  error: string | null;
};

const progressStages = [10, 20, 40, 60, 80, 100];
const jobs = new Map<string, Job>();
const activeTimers = new Map<string, ReturnType<typeof setInterval>>();

const getMockResult = (type: JobType): JobResult => {
  switch (type) {
    case "prompt":
      return { enhancedPrompt: "Mock enhanced prompt for Shivora." };
    case "image":
      return { images: ["mock-image-01.jpg", "mock-image-02.jpg"] };
    case "voice":
      return { audio: "mock.mp3" };
    case "video":
      return { video: "mock.mp4" };
  }
};

const updateJob = (job: Job, updates: Partial<Job>) => {
  const updatedJob: Job = {
    ...job,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  jobs.set(updatedJob.id, updatedJob);
  return updatedJob;
};

const processJob = (jobId: string) => {
  let stageIndex = 0;

  const timer = setInterval(() => {
    const job = jobs.get(jobId);

    if (!job) {
      clearInterval(timer);
      activeTimers.delete(jobId);
      return;
    }

    const progress = progressStages[stageIndex];
    stageIndex += 1;

    if (progress === 100) {
      updateJob(job, {
        progress,
        result: getMockResult(job.type),
        status: "completed",
      });
      clearInterval(timer);
      activeTimers.delete(jobId);
      return;
    }

    updateJob(job, { progress, status: "processing" });
  }, 1000);

  activeTimers.set(jobId, timer);
};

export const isJobType = (value: unknown): value is JobType =>
  typeof value === "string" && jobTypes.includes(value as JobType);

export const jobManager = {
  async createJob(type: JobType): Promise<Job> {
    const timestamp = new Date().toISOString();
    const job: Job = {
      id: randomUUID(),
      type,
      status: "queued",
      progress: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      result: null,
      error: null,
    };

    jobs.set(job.id, job);
    processJob(job.id);

    return job;
  },

  async getJob(jobId: string): Promise<Job | undefined> {
    return jobs.get(jobId);
  },
};
