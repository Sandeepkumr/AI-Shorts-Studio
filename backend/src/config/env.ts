import "dotenv/config";

const parsePort = (
  value: string | undefined,
): number => {
  const parsedPort = Number(
    value ?? 4000,
  );

  if (
    !Number.isInteger(parsedPort) ||
    parsedPort < 1 ||
    parsedPort > 65535
  ) {
    throw new Error(
      "PORT must be a valid TCP port number.",
    );
  }

  return parsedPort;
};

const requireEnv = (
  name: string,
): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is required but was not found in environment variables.`,
    );
  }

  return value;
};

export const env = {
  nodeEnv:
    process.env.NODE_ENV ??
    "development",

  port: parsePort(
    process.env.PORT,
  ),

  geminiApiKey:
    process.env.GEMINI_API_KEY,

  openaiApiKey:
    process.env.OPENAI_API_KEY,

  elevenLabsApiKey:
    process.env.ELEVENLABS_API_KEY,

  elevenLabsMaleVoiceId:
    process.env.ELEVENLABS_MALE_VOICE_ID,

  elevenLabsFemaleVoiceId:
    process.env.ELEVENLABS_FEMALE_VOICE_ID,

  scale8ApiKey:
    process.env.SCALE8_API_KEY,

  replicateApiToken:
    process.env.REPLICATE_API_TOKEN,

  databaseUrl:
    requireEnv("DATABASE_URL"),
};