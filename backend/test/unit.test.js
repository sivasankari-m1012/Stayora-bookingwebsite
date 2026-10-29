import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { loadConfig } from "../src/config/index.js";
import { runMigrations } from "../src/db/migrate.js";
import { assertGuests, assertStay, eachNight, firstOfMonthAfter, isRealDate, nightsBetween, priceStay, todayISO } from "../src/domain/stay.js";

test("stay rules (pure functions)", () => {
  assert.equal(nightsBetween("2026-10-18", "2026-10-23"), 5);
  assert.deepEqual(eachNight("2026-10-30", "2026-11-02"), ["2026-10-30", "2026-10-31", "2026-11-01"]);   // check-out night excluded
  assert.equal(isRealDate("2026-02-30"), false);
  assert.equal(isRealDate("2028-02-29"), true);
  assert.equal(firstOfMonthAfter("2026-11-01", 2), "2027-01-01");
  assert.equal(firstOfMonthAfter("2026-12-01", 1), "2027-01-01");
  assert.equal(assertStay({ checkIn: "2026-10-18", checkOut: "2026-10-23" }, "2026-10-01"), 5);
  assert.throws(() => assertStay({ checkIn: "2026-10-18", checkOut: "2026-10-18" }, "2026-10-01"), /after checkIn/);
  assert.equal(priceStay(5, 5699.8).total, 28499);
  assert.equal(priceStay(1, 5699.8).total, 5700);
  const cap = { guests: 3, maxInfants: 5, maxPets: 1 };
  assert.doesNotThrow(() => assertGuests({ adults: 2, children: 1, infants: 5, pets: 1 }, cap));
  assert.throws(() => assertGuests({ adults: 2, children: 2, infants: 0, pets: 0 }, cap), /at most 3/);
});

test("todayISO uses the given timezone", () => {
  const instant = new Date("2026-10-01T20:00:00Z");           // 1 Oct 20:00 UTC = 2 Oct 01:30 IST
  assert.equal(todayISO(instant, "UTC"), "2026-10-01");
  assert.equal(todayISO(instant, "Asia/Kolkata"), "2026-10-02");
});

test("config: defaults, validation errors, production needs ADMIN_TOKEN", () => {
  assert.equal(loadConfig({}).port, 4000);
  assert.deepEqual(loadConfig({ CORS_ORIGIN: "http://a.com, http://b.com" }).corsOrigins, ["http://a.com", "http://b.com"]);
  assert.throws(() => loadConfig({ PORT: "nope" }), /PORT/);
  assert.throws(() => loadConfig({ NODE_ENV: "production" }), /ADMIN_TOKEN is required/);
  assert.equal(loadConfig({ NODE_ENV: "production", ADMIN_TOKEN: "x".repeat(16) }).isProduction, true);
});

test("migrations: idempotent, and they upgrade a database made by the v1 backend", () => {
  const fresh = new DatabaseSync(":memory:");
  assert.equal(runMigrations(fresh).length, 2);
  assert.equal(runMigrations(fresh).length, 0);                // second run: nothing to do

  const legacy = new DatabaseSync(":memory:");                  // v1 schema: bookings WITHOUT request_hash
  legacy.exec(`CREATE TABLE bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL UNIQUE, idempotency_key TEXT UNIQUE,
    check_in TEXT NOT NULL, check_out TEXT NOT NULL, nights INTEGER NOT NULL, adults INTEGER NOT NULL, children INTEGER NOT NULL DEFAULT 0,
    infants INTEGER NOT NULL DEFAULT 0, pets INTEGER NOT NULL DEFAULT 0, nightly_rate REAL NOT NULL, total INTEGER NOT NULL,
    guest_name TEXT NOT NULL, guest_email TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL, cancelled_at TEXT)`);
  legacy.exec("INSERT INTO bookings (reference, check_in, check_out, nights, adults, nightly_rate, total, guest_name, guest_email, created_at) VALUES ('OLD1','2026-10-01','2026-10-02',1,1,5699.8,5700,'Old','o@x.com','2026-09-01')");
  runMigrations(legacy);
  const cols = legacy.prepare("PRAGMA table_info(bookings)").all().map((c) => c.name);
  assert.ok(cols.includes("request_hash"));
  assert.equal(legacy.prepare("SELECT COUNT(*) AS n FROM bookings").get().n, 1);   // old data survives
});
