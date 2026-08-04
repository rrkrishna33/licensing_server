import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import {
  generateLicense,
  getLicenseStatus,
  validateActivation
} from "../services/licenseService.js";
import { requireVendorAuth } from "../middleware/vendorAuth.js";
import { validateBody } from "../middleware/validate.js";

const generateLicenseSchema = z.object({
  customerId: z.number().int().positive(),
  productName: z.string().min(2),
  maxMachines: z.number().int().positive().max(50).default(1),
  validDays: z.number().int().positive().max(3650).default(env.DEFAULT_LICENSE_DAYS)
});

const activationValidateSchema = z.object({
  licenseKey: z.string().min(5),
  machineId: z.string().min(5),
  appVersion: z.string().optional()
});

const licenseStatusSchema = z.object({
  licenseKey: z.string().min(5)
});

export const licensesRouter = Router();

licensesRouter.post(
  "/licenses/generate",
  requireVendorAuth,
  validateBody(generateLicenseSchema),
  async (req, res, next) => {
    try {
      const license = await generateLicense(req.body);
      res.status(201).json({ ok: true, license });
    } catch (error) {
      next(error);
    }
  }
);

licensesRouter.post(
  "/licenses/activate-validate",
  validateBody(activationValidateSchema),
  async (req, res, next) => {
    try {
      const decision = await validateActivation(req.body);
      res.json(decision);
    } catch (error) {
      next(error);
    }
  }
);

licensesRouter.post(
  "/licenses/status",
  requireVendorAuth,
  validateBody(licenseStatusSchema),
  async (req, res, next) => {
    try {
      const status = await getLicenseStatus(req.body.licenseKey);
      res.json({ ok: true, status });
    } catch (error) {
      next(error);
    }
  }
);
