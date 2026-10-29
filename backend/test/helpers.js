import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config/index.js";
import { createContainer } from "../src/container.js";
import { openDatabase } from "../src/db/connection.js";
import { runMigrations } from "../src/db/migrate.js";
import { createLogger } from "../src/logger.js";
import { seed } from "../src/seed/index.js";

export const NOW = new Date("2026-10-01T06:00:00Z");          // pinned "today": 1 Oct 2026 (IST)

// A fully isolated app: in-memory DB, fixed clock, silent logs, random port.
export async function startTestApp(env = {}) {
  const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent", RATE_LIMIT_PER_MIN: "10000", BOOKING_RATE_LIMIT_PER_MIN: "10000", ...env });
  const db = openDatabase(":memory:");
  runMigrations(db);
  seed(db);
  const container = createContainer({ db, config, now: () => NOW });
  const server = createApp({ config, logger: createLogger(config), container }).listen(0);
  await new Promise((r) => server.once("listening", r));
  const base = `http://localhost:${server.address().port}`;

  const call = async (path, init) => {
    const res = await fetch(base + path, init);
    const text = await res.text();
    let body; try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, body, headers: res.headers };
  };
  const book = (over = {}, headers = {}) =>
    call("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ checkIn: "2026-10-18", checkOut: "2026-10-23", adults: 2, guestName: "Sivasankari", guestEmail: "s@example.com", ...over }),
    });
  return { call, book, db, base, close: () => { server.close(); db.close(); } };
}
