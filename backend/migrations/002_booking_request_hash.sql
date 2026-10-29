-- Fingerprint of the request that created a booking. Lets the API tell a genuine retry
-- (same Idempotency-Key + same payload) from a client bug (same key, different payload).
ALTER TABLE bookings ADD COLUMN request_hash TEXT;
