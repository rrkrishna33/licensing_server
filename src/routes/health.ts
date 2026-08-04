import { Router } from "express";
import { pool } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gellsoft-licensing-server", timestamp: new Date().toISOString() });
});

healthRouter.get("/health/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "reachable" });
  } catch {
    res.status(503).json({ ok: false, database: "unreachable" });
  }
});
