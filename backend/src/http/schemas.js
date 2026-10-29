// Request SHAPE validation (types, formats, ranges) with zod. Business rules ("not in the past",
// "max 3 guests") live in domain/stay.js, because they depend on data, not just on the request.
import { z } from "zod";
import { isRealDate } from "../domain/stay.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const INT_TEXT = /^\d+$/;

const isoDate = (field) =>
  z.unknown().optional().transform((v, ctx) => {
    if (typeof v !== "string" || !ISO_DATE.test(v)) {
      ctx.addIssue({ code: "custom", message: `${field} must be YYYY-MM-DD` });
      return z.NEVER;
    }
    if (!isRealDate(v)) {
      ctx.addIssue({ code: "custom", message: `${field} is not a real date` });
      return z.NEVER;
    }
    return v;
  });

// Query strings arrive as text ("2"), JSON bodies as numbers (2): accept both, reject everything else.
const int = (field, { min, max, fallback }) =>
  z.unknown().optional().transform((v, ctx) => {
    const isEmpty = v === undefined || v === "";
    const ok = isEmpty || typeof v === "number" || (typeof v === "string" && INT_TEXT.test(v));
    const n = isEmpty ? fallback : Number(v);
    if (!ok || !Number.isInteger(n) || n < min || n > max) {
      ctx.addIssue({ code: "custom", message: `${field} must be an integer between ${min} and ${max}` });
      return z.NEVER;
    }
    return n;
  });

const text = (field, { min, max, fallback }) =>
  z.unknown().optional().transform((v, ctx) => {
    const s = v === undefined && fallback !== undefined ? fallback : typeof v === "string" ? v.trim() : null;
    if (s === null || s.length < min || s.length > max) {
      ctx.addIssue({ code: "custom", message: `${field} must be ${min}-${max} characters` });
      return z.NEVER;
    }
    return s;
  });

const email = z.unknown().optional().transform((v, ctx) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.length > 120) {
    ctx.addIssue({ code: "custom", message: "guestEmail is not valid" });
    return z.NEVER;
  }
  return s;
});

const guests = {
  adults: int("adults", { min: 1, max: 20, fallback: 1 }),
  children: int("children", { min: 0, max: 20, fallback: 0 }),
  infants: int("infants", { min: 0, max: 20, fallback: 0 }),
  pets: int("pets", { min: 0, max: 20, fallback: 0 }),
};

export const quoteQuery = z.object({ checkIn: isoDate("checkIn"), checkOut: isoDate("checkOut"), ...guests });

export const availabilityQuery = z.object({
  from: z.unknown().optional().transform((v, ctx) => {
    if (v === undefined) return undefined;
    if (typeof v !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) {
      ctx.addIssue({ code: "custom", message: "from must be YYYY-MM" });
      return z.NEVER;
    }
    return v;
  }),
  months: int("months", { min: 1, max: 12, fallback: 2 }),
});

export const reviewsQuery = z.object({
  limit: int("limit", { min: 1, max: 50, fallback: 6 }),
  offset: int("offset", { min: 0, max: 100000, fallback: 0 }),
  q: text("q", { min: 0, max: 100, fallback: "" }),
});

export const createBookingBody = z.object({
  checkIn: isoDate("checkIn"),
  checkOut: isoDate("checkOut"),
  ...guests,
  guestName: text("guestName", { min: 2, max: 80 }),
  guestEmail: email,
});

export const idempotencyKeyHeader = z.object({
  "idempotency-key": z
    .string()
    .regex(/^[\w.:-]{1,128}$/, "Idempotency-Key must be 1-128 chars: letters, digits, _ . : -")
    .optional(),
});
