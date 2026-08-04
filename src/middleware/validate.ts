import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "./httpError.js";

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join("; ");
      next(new HttpError(400, message || "Invalid request body"));
      return;
    }

    req.body = parsed.data;
    next();
  };
}
