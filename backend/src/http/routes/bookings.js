import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { limiter, methodNotAllowed } from "../middleware/http.js";
import { validate } from "../middleware/validate.js";
import { createBookingBody, idempotencyKeyHeader } from "../schemas.js";

export function bookingRoutes({ bookings, config }) {
  const r = Router();
  const writeLimit = limiter(config.bookingRateLimitPerMin);

  r.route("/bookings")
    // Listing every booking exposes guest names and emails -> admin only.
    .get(requireAdmin(config), (_req, res) => res.json({ items: bookings.list() }))
    .post(writeLimit, validate({ headers: idempotencyKeyHeader, body: createBookingBody }), (req, res) => {
      const { booking, replay } = bookings.create(req.valid.body, req.valid.headers["idempotency-key"]);
      res.status(replay ? 200 : 201).json(booking);   // 201 first time, 200 for a safe retry
    })
    .all(methodNotAllowed("GET", "POST"));

  // The reference is a 50-bit random secret the guest received at booking time, so holding it is the
  // authorisation to view / cancel that one booking.
  r.route("/bookings/:ref")
    .get((req, res) => res.json(bookings.get(req.params.ref)))
    .delete(writeLimit, (req, res) => res.json(bookings.cancel(req.params.ref)))
    .all(methodNotAllowed("GET", "DELETE"));
  return r;
}
