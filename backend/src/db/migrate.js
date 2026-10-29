// Tiny forward-only migration runner: applies migrations/NNN_name.sql files once, in order.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openDatabase, withTransaction } from "./connection.js";
import { loadConfig } from "../config/index.js";

const DIR = fileURLToPath(new URL("../../migrations/", import.meta.url));

export function runMigrations(db, dir = DIR) {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const done = new Set(db.prepare("SELECT version FROM schema_migrations").all().map((r) => r.version));
  const applied = [];
  for (const file of readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort()) {
    if (done.has(file)) continue;
    const sql = readFileSync(dir + file, "utf8");
    withTransaction(db, () => {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(file, new Date().toISOString());
    });
    applied.push(file);
  }
  return applied;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDatabase(loadConfig().dbPath);
  const applied = runMigrations(db);
  console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date.");
}
