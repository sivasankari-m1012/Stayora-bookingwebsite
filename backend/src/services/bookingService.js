import { createHash, randomBytes } from "node:crypto";
import { withTransaction } from "../db/connection.js";
import { conflict, notFound } from "../domain/errors.js";
import { assertGuests, assertStay, priceStay } from "../domain/stay.js";

// Crockford base32 (no I, L, O, U). 10 random chars = 50 bits: unguessable, easy to read out loud.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const REFERENCE_PATTERN = /^BK[0-9A-HJKMNP-TV-Z]{10}$/;
const newReference = () => "BK" + Array.from(randomBytes(10), (b) => ALPHABET[b % 32]).join("");

const fingerprint = (input) => createHash("sha256").update(JSON.stringify(input)).digest("hex");

export const toBookingView = (r) => ({
  reference: r.reference,
  status: r.status,
  checkIn: r.check_in,
  checkOut: r.check_out,
  nights: r.nights,
  guests: { adults: r.adults, children: r.children, infants: r.infants, pets: r.pets },
  price: { currency: "INR", nightlyRate: r.nightly_rate, total: r.total },
  guest: { name: r.guest_name, email: r.guest_email },
  createdAt: r.created_at,
  cancelledAt: r.cancelled_at,
});

export function createBookingService({ db, content, bookings, availability, clock }) {
  function create(input, idempotencyKey) {
    const listing = content.listing();
    const nights = assertStay(input, clock.today());
    const guests = assertGuests(
      { adults: input.adults, children: input.children, infants: input.infants, pets: input.pets },
      listing.capacity
    );
    const price = priceStay(nights, listing.pricing.nightlyRate, listing.pricing.currency);
    const requestHash = fingerprint({ ...input, ...guests });

    // Everything that decides the outcome happens inside ONE write transaction.
    return withTransaction(db, () => {
      if (idempotencyKey) {
        const prev = bookings.findByIdempotencyKey(idempotencyKey);
        if (prev) {
          if (prev.request_hash !== requestHash) {
            throw conflict("idempotency_key_reused", "This Idempotency-Key was already used with a different request");
          }
          return { booking: toBookingView(prev), replay: true };
        }
      }
      if (!availability.isRangeFree(input.checkIn, input.checkOut)) {
        throw conflict("dates_unavailable", "Those dates are no longer available");
      }
      const reference = newReference();
      bookings.insert({
        reference, idempotencyKey: idempotencyKey ?? null, requestHash,
        checkIn: input.checkIn, checkOut: input.checkOut, nights, ...guests,
        nightlyRate: listing.pricing.nightlyRate, total: price.total,
        guestName: input.guestName, guestEmail: input.guestEmail, createdAt: clock.now().toISOString(),
      });
      return { booking: toBookingView(bookings.findByReference(reference)), replay: false };
    });
  }

  function get(reference) {
    const row = REFERENCE_PATTERN.test(reference) ? bookings.findByReference(reference) : undefined;
    if (!row) throw notFound("Booking not found");
    return toBookingView(row);
  }

  const list = () => bookings.list().map(toBookingView);

  function cancel(reference) {
    const row = REFERENCE_PATTERN.test(reference) ? bookings.findByReference(reference) : undefined;
    if (!row) throw notFound("Booking not found");
    return withTransaction(db, () => {
      const fresh = bookings.findByReference(reference);
      if (fresh.status === "cancelled") return toBookingView(fresh);            // idempotent
      if (fresh.check_in <= clock.today()) throw conflict("cannot_cancel", "Stays that have started cannot be cancelled");
      bookings.markCancelled(fresh.id, clock.now().toISOString());
      return toBookingView(bookings.findByReference(reference));
    });
  }

  return { create, get, list, cancel };
}
