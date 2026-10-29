import { DatabaseSync } from "node:sqlite";

export function openDatabase(path) {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;     -- readers don't block the writer
    PRAGMA synchronous = NORMAL;   -- safe with WAL, much faster than FULL
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;    -- wait up to 5s for a lock instead of failing at once
  `);
  return db;
}

// BEGIN IMMEDIATE takes the write lock up front, so two bookings for the same dates
// cannot both pass the "is it free?" check (even across processes sharing the file).
export function withTransaction(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
