import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestApp } from "./helpers.js";

let t;
before(async () => { t = await startTestApp(); });
after(() => t.close());

test("content endpoints mirror the frontend data", async () => {
  assert.equal((await t.call("/api/photos")).body.total, 43);
  assert.equal((await t.call("/api/photos")).body.hero.length, 5);
  assert.equal((await t.call("/api/nearby")).body.items.length, 8);
  const r = (await t.call("/api/reviews?limit=2")).body;
  assert.equal(r.items.length, 2);
  assert.equal(r.stats.total, 19);
  assert.equal((await t.call("/api/amenities")).body.featured.length, 10);
  assert.equal((await t.call("/api/listing")).body.capacity.guests, 3);
});

test("content is cacheable, everything else is no-store", async () => {
  assert.equal((await t.call("/api/listing")).headers.get("cache-control"), "public, max-age=60");
  assert.equal((await t.call("/api/availability")).headers.get("cache-control"), "no-store");
  assert.equal((await t.call("/api/nope")).headers.get("cache-control"), "no-store");
});

test("reviews: paging, search, and LIKE wildcards are treated as plain text", async () => {
  const all = (await t.call("/api/reviews?limit=50")).body;
  assert.equal(all.page.total, 6);                      // 6 review rows are seeded (stats.total=19 is the headline count)
  assert.equal(all.items.length, 6);
  const page2 = (await t.call("/api/reviews?limit=2&offset=2")).body;
  assert.equal(page2.items[0].id, all.items[2].id);
  assert.equal(page2.items.length, 2);
  assert.equal((await t.call("/api/reviews?q=%25")).body.page.total, 0);     // "%" must not match everything
  assert.equal((await t.call("/api/reviews?limit=0")).status, 400);
  assert.equal((await t.call("/api/reviews?limit=999")).status, 400);
});

test("quote matches the frontend headline price (5 nights = 28,499)", async () => {
  const { status, body } = await t.call("/api/quote?checkIn=2026-10-18&checkOut=2026-10-23&adults=2");
  assert.equal(status, 200);
  assert.equal(body.price.total, 28499);
  assert.equal(body.available, true);
});

test("validation: bad input is a 400 with a precise message", async () => {
  const bad = async (qs) => (await t.call(`/api/quote?${qs}`));
  assert.equal((await bad("checkIn=2026-09-01&checkOut=2026-09-03")).status, 400);                    // past
  assert.equal((await bad("checkIn=2026-10-20&checkOut=2026-10-20")).status, 400);                    // zero nights
  assert.equal((await bad("checkIn=2026-02-30&checkOut=2026-03-03")).body.error.message, "checkIn is not a real date");
  assert.equal((await bad("checkIn=2026-10-20&checkOut=2026-10-22&adults=2&children=2")).status, 400); // 4 > 3
  assert.equal((await bad("checkIn=2026-10-20&checkOut=2026-10-22&pets=2")).status, 400);
  assert.equal((await bad("checkIn=2026-10-20&checkOut=2026-10-22&adults=abc")).status, 400);
  assert.equal((await bad("checkIn=2026-10-01&checkOut=2026-11-15")).status, 400);                    // > 30 nights
  assert.equal((await bad("checkIn=2026-10-20")).body.error.details[0].path, "checkOut");
  assert.equal((await t.call("/api/availability?from=2026-13")).status, 400);
  assert.equal((await t.book({ guestEmail: "nope" })).status, 400);
  assert.equal((await t.book({ guestName: "A" })).status, 400);
});

test("'today' is decided in the property's timezone, not the server's", async () => {
  // NOW is 2026-10-01T06:00Z = 11:30 IST on 1 Oct, so 1 Oct is bookable and 30 Sep is not.
  assert.equal((await t.call("/api/quote?checkIn=2026-10-01&checkOut=2026-10-02")).status, 200);
  assert.equal((await t.call("/api/quote?checkIn=2026-09-30&checkOut=2026-10-02")).status, 400);
});

test("booking lifecycle: create, replay, key reuse, overlap, back-to-back, cancel", async () => {
  const a = await t.book({ checkIn: "2026-11-10", checkOut: "2026-11-13" }, { "Idempotency-Key": "k1" });
  assert.equal(a.status, 201);
  assert.match(a.body.reference, /^BK[0-9A-Z]{10}$/);
  assert.equal(a.body.price.total, Math.round(3 * 5699.8));

  const replay = await t.book({ checkIn: "2026-11-10", checkOut: "2026-11-13" }, { "Idempotency-Key": "k1" });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.reference, a.body.reference);

  const reused = await t.book({ checkIn: "2026-11-20", checkOut: "2026-11-22" }, { "Idempotency-Key": "k1" });
  assert.equal(reused.status, 409);
  assert.equal(reused.body.error.code, "idempotency_key_reused");

  const overlap = await t.book({ checkIn: "2026-11-12", checkOut: "2026-11-15" });
  assert.equal(overlap.status, 409);
  assert.equal(overlap.body.error.code, "dates_unavailable");

  assert.equal((await t.book({ checkIn: "2026-11-13", checkOut: "2026-11-15" })).status, 201);   // checkout day == next check-in

  const av = (await t.call("/api/availability?from=2026-11&months=1")).body;
  assert.deepEqual(av.unavailable.slice(0, 3), ["2026-11-10", "2026-11-11", "2026-11-12"]);

  const del = await t.call(`/api/bookings/${a.body.reference}`, { method: "DELETE" });
  assert.equal(del.body.status, "cancelled");
  assert.equal((await t.call(`/api/bookings/${a.body.reference}`, { method: "DELETE" })).status, 200);   // idempotent
  assert.equal((await t.book({ checkIn: "2026-11-11", checkOut: "2026-11-12" })).status, 201);           // nights freed
  assert.equal((await t.call("/api/bookings/NOPE")).status, 404);
  assert.equal((await t.call("/api/bookings/BK0000000000")).status, 404);
});

test("a stay that already started cannot be cancelled", async () => {
  const b = await t.book({ checkIn: "2026-10-01", checkOut: "2026-10-03" });
  assert.equal(b.status, 201);
  const del = await t.call(`/api/bookings/${b.body.reference}`, { method: "DELETE" });
  assert.equal(del.status, 409);
  assert.equal(del.body.error.code, "cannot_cancel");
});

test("8 parallel requests for the same dates produce exactly one booking", async () => {
  const results = await Promise.all(Array.from({ length: 8 }, () => t.book({ checkIn: "2026-12-01", checkOut: "2026-12-04" })));
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 7);
});

test("bad idempotency key, malformed JSON, oversized body, missing body", async () => {
  assert.equal((await t.book({}, { "Idempotency-Key": "has spaces!" })).status, 400);
  const json = { "Content-Type": "application/json" };
  const bad = await t.call("/api/bookings", { method: "POST", headers: json, body: "{oops" });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.message, "Body is not valid JSON");
  assert.equal((await t.call("/api/bookings", { method: "POST", headers: json, body: JSON.stringify({ x: "y".repeat(20000) }) })).status, 413);
  assert.equal((await t.call("/api/bookings", { method: "POST" })).status, 400);
});

test("errors carry a request id; callers may supply their own", async () => {
  const res = await t.call("/api/nope", { headers: { "X-Request-Id": "trace-123" } });
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("x-request-id"), "trace-123");
  assert.equal(res.body.error.requestId, "trace-123");
  const auto = await t.call("/api/nope");
  assert.match(auto.body.error.requestId, /^[0-9a-f-]{36}$/);
});

test("unknown route 404, wrong method 405 with Allow header", async () => {
  assert.equal((await t.call("/api/nope")).status, 404);
  const r = await t.call("/api/listing", { method: "POST" });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get("allow"), "GET");
});

test("security headers, probes, OpenAPI document", async () => {
  const h = await t.call("/api/health");
  assert.equal(h.headers.get("x-content-type-options"), "nosniff");
  assert.equal(h.headers.get("x-powered-by"), null);
  assert.equal((await t.call("/api/ready")).body.ok, true);
  const spec = await t.call("/api/openapi.yaml");
  assert.equal(spec.status, 200);
  assert.match(spec.body, /\/api\/bookings\/\{ref\}/);
});

test("admin page ships with a strict CSP and no inline script", async () => {
  const res = await fetch(t.base + "/admin");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-security-policy"), /script-src 'self'/);
  assert.doesNotMatch(await res.text(), /<script>(?!<)/);
});
