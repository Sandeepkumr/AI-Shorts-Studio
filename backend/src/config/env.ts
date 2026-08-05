const parsePort = (value: string | undefined): number => {
  const parsedPort = Number(value ?? 4000);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("PORT must be a valid TCP port number.");
  }

  return parsedPort;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  geminiApiKey: process.env.GEMINI_API_KEY,
};
import "dotenv/config";
