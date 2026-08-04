import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  VENDOR_API_TOKEN: z.string().optional(),
  DEFAULT_LICENSE_DAYS: z.coerce.number().int().positive().default(365)
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
