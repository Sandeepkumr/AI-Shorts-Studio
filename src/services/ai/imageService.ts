export type ImageGenerationStep =
  | "Analyzing your story..."
  | "Enhancing your prompt..."
  | "Creating cinematic concepts..."
  | "Generating AI images...";

export type GeneratedImage = {
  id: string;
  title: string;
  resolution: string;
  accent: "primary" | "secondary";
};

export type ImageGenerationResult = {
  prompt: string;
  images: GeneratedImage[];
};

type GenerateImagesOptions = {
  prompt?: string;
  onProgress?: (stepIndex: number) => void;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const generationSteps: ImageGenerationStep[] = [
  "Analyzing your story...",
  "Enhancing your prompt...",
  "Creating cinematic concepts...",
  "Generating AI images...",
];

const generatedImages: GeneratedImage[] = [
  {
    id: "concept-a",
    title: "Cinematic Concept 01",
    resolution: "1024 × 1792",
    accent: "primary",
  },
  {
    id: "concept-b",
    title: "Cinematic Concept 02",
    resolution: "1024 × 1792",
    accent: "secondary",
  },
];

export const imageService = {
  async getGenerationSteps(): Promise<ImageGenerationStep[]> {
    return generationSteps;
  },

  async generateImages({
    prompt = "",
    onProgress,
  }: GenerateImagesOptions = {}): Promise<ImageGenerationResult> {
    onProgress?.(0);

    for (let stepIndex = 1; stepIndex < generationSteps.length; stepIndex += 1) {
      await wait(650);
      onProgress?.(stepIndex);
    }

    await wait(1050);

    return {
      prompt,
      images: generatedImages,
    };
  },

  async getGeneratedImages(): Promise<GeneratedImage[]> {
    await wait(120);
    return generatedImages;
  },
};
