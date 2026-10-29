import { timingSafeEqual } from "node:crypto";
import { unauthorized } from "../../domain/errors.js";

const safeEqual = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);   // constant-time compare: no timing side channel
};

// Guards admin-only routes with `Authorization: Bearer <ADMIN_TOKEN>`.
// No token configured (development only; production refuses to start without one) => open.
export const requireAdmin = (config) => (req, res, next) => {
  if (!config.adminToken) return next();
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme === "Bearer" && token && safeEqual(token, config.adminToken)) return next();
  res.setHeader("WWW-Authenticate", 'Bearer realm="admin"');
  next(unauthorized("Valid admin token required"));
};
