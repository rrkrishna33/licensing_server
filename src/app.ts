import express from "express";
import { healthRouter } from "./routes/health.js";
import { customersRouter } from "./routes/customers.js";
import { licensesRouter } from "./routes/licenses.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));

  app.use("/", healthRouter);
  app.use("/api", customersRouter);
  app.use("/api", licensesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
