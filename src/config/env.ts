import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  VENDOR_API_TOKEN: z.string().optional(),
  DEFAULT_LICENSE_DAYS: z.coerce.number().int().positive().default(365),
  ADMIN_USERNAME: z.string().min(1, "ADMIN_USERNAME is required"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  CORS_ORIGIN: z.string().optional().default("*")
});

const parsed = envSchema.parse(process.env);

if (parsed.NODE_ENV === "production" && !parsed.VENDOR_API_TOKEN?.trim()) {
  throw new Error("VENDOR_API_TOKEN is required in production.");
}

const vendorToken = parsed.VENDOR_API_TOKEN?.trim() || "dev-vendor-token";

if (!parsed.VENDOR_API_TOKEN?.trim() && parsed.NODE_ENV !== "production") {
  console.warn("VENDOR_API_TOKEN is missing; using local development fallback token.");
}

export const env = {
  ...parsed,
  VENDOR_API_TOKEN: vendorToken
};
