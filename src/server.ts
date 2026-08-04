import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/pool.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info("Licensing server started", { port: env.PORT });
});

const shutdown = async (signal: string) => {
  logger.warn("Shutdown signal received", { signal });
  server.close(async () => {
    await pool.end();
    logger.info("Server shutdown completed");
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    logger.error("Shutdown failure", { message: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    logger.error("Shutdown failure", { message: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  });
});
