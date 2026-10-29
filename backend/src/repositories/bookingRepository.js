export function createBookingRepository(db) {
  const q = {
    blocked: db.prepare("SELECT date FROM blocked_dates WHERE date >= ? AND date < ?"),
    overlapping: db.prepare(
      "SELECT check_in, check_out FROM bookings WHERE status = 'confirmed' AND check_in < ? AND check_out > ?"
    ),
    byReference: db.prepare("SELECT * FROM bookings WHERE reference = ?"),
    byKey: db.prepare("SELECT * FROM bookings WHERE idempotency_key = ?"),
    all: db.prepare("SELECT * FROM bookings ORDER BY id DESC"),
    insert: db.prepare(
      `INSERT INTO bookings (reference, idempotency_key, request_hash, check_in, check_out, nights, adults, children,
                             infants, pets, nightly_rate, total, guest_name, guest_email, created_at)
       VALUES (@reference, @idempotencyKey, @requestHash, @checkIn, @checkOut, @nights, @adults, @children,
               @infants, @pets, @nightlyRate, @total, @guestName, @guestEmail, @createdAt)`
    ),
    cancel: db.prepare("UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE id = ?"),
  };
  return {
    blockedDates: (from, to) => q.blocked.all(from, to).map((r) => r.date),
    confirmedOverlapping: (from, to) => q.overlapping.all(to, from),   // bookings touching [from, to)
    findByReference: (ref) => q.byReference.get(ref),
    findByIdempotencyKey: (key) => q.byKey.get(key),
    list: () => q.all.all(),
    insert: (row) => q.insert.run({ idempotencyKey: null, requestHash: null, ...row }),
    markCancelled: (id, at) => q.cancel.run(at, id),
  };
}
