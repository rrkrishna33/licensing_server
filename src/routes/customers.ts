import { Router } from "express";
import { z } from "zod";
import { createCustomer } from "../services/licenseService.js";
import { validateBody } from "../middleware/validate.js";
import { requireVendorAuth } from "../middleware/vendorAuth.js";

const createCustomerSchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(5).optional()
});

export const customersRouter = Router();

customersRouter.post("/customers", requireVendorAuth, validateBody(createCustomerSchema), async (req, res, next) => {
  try {
    const customer = await createCustomer(req.body.name, req.body.contactEmail, req.body.contactPhone);
    res.status(201).json({ ok: true, customer });
  } catch (error) {
    next(error);
  }
});
