import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { customersRouter } from "./routes/customers.js";
import { licensesRouter } from "./routes/licenses.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map(o => o.trim()),
    allowedHeaders: ["Content-Type", "Authorization", "x-vendor-token"]
  }));
  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));

  // Serve admin portal static files
  app.use(express.static(path.join(__dirname, "..", "portal")));

  app.use("/", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", customersRouter);
  app.use("/api", licensesRouter);
  app.use("/api", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
