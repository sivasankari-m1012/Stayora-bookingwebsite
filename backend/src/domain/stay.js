// Pure booking rules: dates, guest limits, pricing. No DB, no HTTP -> trivial to unit test.
// Dates are "YYYY-MM-DD" strings everywhere, so there are no timezone surprises.
import { badRequest } from "./errors.js";

const DAY = 86_400_000;
export const MAX_NIGHTS = 30;

const parse = (s) => Date.parse(`${s}T00:00:00Z`);                 // midnight UTC of that calendar day
export const toISO = (t) => new Date(t).toISOString().slice(0, 10);

export function isRealDate(s) {
  const t = parse(s);
  return !Number.isNaN(t) && toISO(t) === s;                        // rejects 2026-02-30
}

// "Today" in the property's timezone (not the server's), e.g. "Asia/Kolkata".
export const todayISO = (now, timeZone) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

export const nightsBetween = (checkIn, checkOut) => Math.round((parse(checkOut) - parse(checkIn)) / DAY);

// Every night slept: check-in included, check-out excluded.
export function eachNight(checkIn, checkOut) {
  const out = [];
  for (let t = parse(checkIn); t < parse(checkOut); t += DAY) out.push(toISO(t));
  return out;
}

export const firstOfMonthAfter = (monthStart, months) => {
  const d = new Date(parse(monthStart));
  return toISO(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
};

export function assertStay({ checkIn, checkOut }, today) {
  if (checkIn < today) throw badRequest("checkIn cannot be in the past");
  if (checkOut <= checkIn) throw badRequest("checkOut must be after checkIn");
  const nights = nightsBetween(checkIn, checkOut);
  if (nights > MAX_NIGHTS) throw badRequest(`Stays are limited to ${MAX_NIGHTS} nights`);
  return nights;
}

export function assertGuests(guests, capacity) {
  const { adults, children, infants, pets } = guests;
  if (adults + children > capacity.guests) {
    throw badRequest(`This place sleeps at most ${capacity.guests} guests, not including infants`);
  }
  if (infants > capacity.maxInfants) throw badRequest(`At most ${capacity.maxInfants} infants allowed`);
  if (pets > capacity.maxPets) throw badRequest(`At most ${capacity.maxPets} pet(s) allowed`);
  return guests;
}

// Same rounding as the frontend's stayTotal(): Math.round(nights * nightlyRate).
export function priceStay(nights, nightlyRate, currency = "INR") {
  const total = Math.round(nights * nightlyRate);
  return {
    currency,
    nights,
    nightlyRate,
    lines: [{ label: `${nights} night${nights === 1 ? "" : "s"} x ${nightlyRate}`, amount: total }],
    total,
  };
}
