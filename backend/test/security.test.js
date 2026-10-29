import { test } from "node:test";
import assert from "node:assert/strict";
import { startTestApp } from "./helpers.js";

test("GET /api/bookings is admin-only when ADMIN_TOKEN is set", async () => {
  const t = await startTestApp({ ADMIN_TOKEN: "a-long-secret-token-1234" });
  try {
    const b = await t.book();
    assert.equal(b.status, 201);

    const none = await t.call("/api/bookings");
    assert.equal(none.status, 401);
    assert.equal(none.headers.get("www-authenticate"), 'Bearer realm="admin"');
    assert.equal((await t.call("/api/bookings", { headers: { Authorization: "Bearer wrong" } })).status, 401);

    const ok = await t.call("/api/bookings", { headers: { Authorization: "Bearer a-long-secret-token-1234" } });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.items.length, 1);

    // A guest holding the reference can still view their own booking.
    assert.equal((await t.call(`/api/bookings/${b.body.reference}`)).status, 200);
  } finally { t.close(); }
});

test("rate limiting returns 429 with the standard error shape", async () => {
  const t = await startTestApp({ BOOKING_RATE_LIMIT_PER_MIN: "3" });
  try {
    const codes = [];
    for (let i = 0; i < 5; i++) codes.push((await t.book({ guestEmail: "bad" })).status);   // 400s still count
    assert.deepEqual(codes, [400, 400, 400, 429, 429]);
    const limited = await t.book();
    assert.equal(limited.body.error.code, "rate_limited");
    assert.ok(limited.headers.get("ratelimit"));
  } finally { t.close(); }
});

test("CORS: allow-listed origin gets headers, others do not", async () => {
  const t = await startTestApp({ CORS_ORIGIN: "http://localhost:5173" });
  try {
    const ok = await t.call("/api/health", { headers: { Origin: "http://localhost:5173" } });
    assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:5173");
    const evil = await t.call("/api/health", { headers: { Origin: "https://evil.example" } });
    assert.equal(evil.headers.get("access-control-allow-origin"), null);
    const pre = await fetch(t.base + "/api/bookings", { method: "OPTIONS", headers: { Origin: "http://localhost:5173", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "idempotency-key,content-type" } });
    assert.equal(pre.status, 204);
    assert.match(pre.headers.get("access-control-allow-headers"), /Idempotency-Key/i);
  } finally { t.close(); }
});
