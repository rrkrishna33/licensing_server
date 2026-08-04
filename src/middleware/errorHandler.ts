import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./httpError.js";
import { logger } from "../config/logger.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Route not found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ ok: false, error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  logger.error("Unhandled API error", { message });
  res.status(500).json({ ok: false, error: message });
}
