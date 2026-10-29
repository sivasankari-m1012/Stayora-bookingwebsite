// All environment variables are read and validated HERE, once, at startup.
// The rest of the code receives a plain frozen object, never process.env.
import { fileURLToPath } from "node:url";
import { z } from "zod";

const bool = (fallback) =>
  z.enum(["true", "false"]).default(fallback).transform((v) => v === "true");

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DB_PATH: z.string().min(1).default(fileURLToPath(new URL("../../stayora.db", import.meta.url))),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),          // comma separated allow-list
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    ADMIN_TOKEN: z.string().min(16, "ADMIN_TOKEN must be at least 16 characters").optional(),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),            // number of reverse-proxy hops
    RATE_LIMIT_PER_MIN: z.coerce.number().int().min(1).default(120),   // every route, per IP
    BOOKING_RATE_LIMIT_PER_MIN: z.coerce.number().int().min(1).default(20), // POST/DELETE bookings, per IP
    TIMEZONE: z.string().default("Asia/Kolkata"),                      // the property's timezone: decides what "today" is
    AUTO_SEED: bool("true"),                                           // seed content tables on first start
  })
  .refine((e) => e.NODE_ENV !== "production" || e.ADMIN_TOKEN, {
    path: ["ADMIN_TOKEN"],
    message: "ADMIN_TOKEN is required when NODE_ENV=production",
  });

export function loadConfig(env = process.env) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "env"}: ${i.message}`);
    throw new Error(`Invalid configuration:\n${lines.join("\n")}`);
  }
  const e = parsed.data;
  return Object.freeze({
    env: e.NODE_ENV,
    isProduction: e.NODE_ENV === "production",
    port: e.PORT,
    dbPath: e.DB_PATH,
    corsOrigins: e.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean),
    logLevel: e.LOG_LEVEL,
    adminToken: e.ADMIN_TOKEN,
    trustProxy: e.TRUST_PROXY,
    rateLimitPerMin: e.RATE_LIMIT_PER_MIN,
    bookingRateLimitPerMin: e.BOOKING_RATE_LIMIT_PER_MIN,
    timezone: e.TIMEZONE,
    autoSeed: e.AUTO_SEED,
  });
}
