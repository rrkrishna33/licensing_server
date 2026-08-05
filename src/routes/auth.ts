import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/httpError.js";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const authRouter = Router();

authRouter.post("/auth/login", validateBody(loginSchema), (req, res, next) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      throw new HttpError(401, "Invalid credentials");
    }
    const token = jwt.sign({ sub: username, role: "admin" }, env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ ok: true, token });
  } catch (error) {
    next(error);
  }
});
