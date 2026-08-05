import { Router } from "express";
import { z } from "zod";
import { requireAdminAuth } from "../middleware/adminAuth.js";
import { validateBody } from "../middleware/validate.js";
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  listLicenses,
  getLicenseWithActivations,
  generateLicense,
  updateLicenseStatus,
  getDashboardStats
} from "../services/licenseService.js";
import { env } from "../config/env.js";

const createCustomerSchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(5).optional()
});

const generateLicenseSchema = z.object({
  customerId: z.number().int().positive(),
  productName: z.string().min(2),
  maxMachines: z.number().int().positive().max(50).default(1),
  validDays: z.number().int().positive().max(3650).default(env.DEFAULT_LICENSE_DAYS)
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "suspended", "cancelled"])
});

export const adminRouter = Router();

adminRouter.use("/admin", requireAdminAuth);

adminRouter.get("/admin/stats", async (_req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({ ok: true, stats });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/admin/customers", async (_req, res, next) => {
  try {
    const customers = await listCustomers();
    res.json({ ok: true, customers });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/admin/customers", validateBody(createCustomerSchema), async (req, res, next) => {
  try {
    const customer = await createCustomer(req.body.name, req.body.contactEmail, req.body.contactPhone);
    res.status(201).json({ ok: true, customer });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/admin/customers/:id", async (req, res, next) => {
  try {
    const customer = await getCustomerById(Number(req.params.id));
    if (!customer) { res.status(404).json({ ok: false, message: "Customer not found" }); return; }
    res.json({ ok: true, customer });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/admin/licenses", async (_req, res, next) => {
  try {
    const licenses = await listLicenses();
    res.json({ ok: true, licenses });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/admin/licenses", validateBody(generateLicenseSchema), async (req, res, next) => {
  try {
    const license = await generateLicense(req.body);
    res.status(201).json({ ok: true, license });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/admin/licenses/:id", async (req, res, next) => {
  try {
    const license = await getLicenseWithActivations(Number(req.params.id));
    if (!license) { res.status(404).json({ ok: false, message: "License not found" }); return; }
    res.json({ ok: true, license });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/admin/licenses/:id/status", validateBody(updateStatusSchema), async (req, res, next) => {
  try {
    const license = await updateLicenseStatus(Number(req.params.id), req.body.status as string);
    res.json({ ok: true, license });
  } catch (error) {
    next(error);
  }
});
