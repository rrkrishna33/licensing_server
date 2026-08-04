import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

export function requireVendorAuth(req: Request, _res: Response, next: NextFunction) {
  const token = String(req.header("x-vendor-token") || "").trim();
  if (!token || token !== env.VENDOR_API_TOKEN) {
    next(new HttpError(401, "Unauthorized vendor token"));
    return;
  }

  req.vendorAuth = { authorized: true };
  next();
}
