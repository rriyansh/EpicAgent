import { createApp } from "./app";
import { logger } from "./config/logger";
import { connectDb } from "./db";

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await connectDb();

  const app = createApp();

  app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT }, `server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  logger.error({ err }, "failed to start server");
  process.exit(1);
});
