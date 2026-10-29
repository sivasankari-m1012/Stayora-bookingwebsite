// Writes the whole database as plain SQL (schema + INSERTs) so you can open / diff / re-import it.
//   npm run dump            -> backend/stayora-dump.sql
//   sqlite3 new.db < stayora-dump.sql
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config/index.js";
import { openDatabase } from "../db/connection.js";

export const DUMP_FILE = fileURLToPath(new URL("../../stayora-dump.sql", import.meta.url));

const lit = (v) =>
  v === null || v === undefined ? "NULL" : typeof v === "number" || typeof v === "bigint" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

export function dumpSql(db) {
  const objs = db.prepare("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY rowid").all();
  const tables = objs.filter((x) => x.type === "table");
  const out = [`-- stayora dump, ${new Date().toISOString()}`, "PRAGMA foreign_keys = OFF;", "BEGIN TRANSACTION;"];
  for (const t of tables) out.push(t.sql + ";");
  for (const t of tables) {
    const rows = db.prepare(`SELECT * FROM "${t.name}"`).all();
    if (!rows.length) continue;
    out.push(`-- ${t.name} (${rows.length} rows)`);
    for (const r of rows) {
      const cols = Object.keys(r);
      out.push(`INSERT INTO "${t.name}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map((c) => lit(r[c])).join(", ")});`);
    }
  }
  for (const o of objs.filter((x) => x.type === "index")) out.push(o.sql + ";");
  out.push("COMMIT;", "");
  return out.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(DUMP_FILE, dumpSql(openDatabase(loadConfig().dbPath)));
  console.log("Wrote", DUMP_FILE);
}
