import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

export function requireAdminAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = String(req.header("authorization") || "").trim();
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    next(new HttpError(401, "Missing admin token"));
    return;
  }
  try {
    jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired admin token"));
  }
}
