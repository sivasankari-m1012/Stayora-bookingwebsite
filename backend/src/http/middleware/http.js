import rateLimit from "express-rate-limit";
import { AppError } from "../../domain/errors.js";

// Default for every response; the read-only content routes opt in to caching on success.
export const noStore = (_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); };

// Answers 405 + Allow header for a known path hit with the wrong method.
export const methodNotAllowed = (...allowed) => (_req, res, next) => {
  res.setHeader("Allow", allowed.join(", "));
  next(new AppError(405, "method_not_allowed", "Method not allowed"));
};

export const limiter = (limitPerMinute, { skip } = {}) =>
  rateLimit({
    windowMs: 60_000,
    limit: limitPerMinute,
    standardHeaders: "draft-7",     // RateLimit-* headers so clients can back off politely
    legacyHeaders: false,
    skip,
    handler: (_req, _res, next) => next(new AppError(429, "rate_limited", "Too many requests, slow down")),
  });
