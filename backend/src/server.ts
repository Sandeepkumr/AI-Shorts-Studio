import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, "0.0.0.0", () => {
  console.info(
    `Shivora Backend is running on http://0.0.0.0:${env.port} (${env.nodeEnv}).`,
  );
});