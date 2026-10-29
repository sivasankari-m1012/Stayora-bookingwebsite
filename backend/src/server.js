// Process entry point: config -> DB -> migrations -> (seed) -> HTTP server -> graceful shutdown.
import { createApp } from "./app.js";
import { loadConfig } from "./config/index.js";
import { createContainer } from "./container.js";
import { openDatabase } from "./db/connection.js";
import { runMigrations } from "./db/migrate.js";
import { createLogger } from "./logger.js";
import { seed } from "./seed/index.js";

const config = loadConfig();                       // throws a readable message if the environment is wrong
const logger = createLogger(config);

const db = openDatabase(config.dbPath);
const applied = runMigrations(db);
if (applied.length) logger.info({ applied }, "migrations applied");

const container = createContainer({ db, config });
if (config.autoSeed && !container.content.hasListing()) {
  seed(db);
  logger.info("empty database: content seeded");
}
if (!config.adminToken) logger.warn("ADMIN_TOKEN not set: /api/bookings and /admin are open (development only)");

const server = createApp({ config, logger, container }).listen(config.port, () => {
  logger.info({ port: config.port, env: config.env, db: config.dbPath }, "API listening");
});

// Graceful shutdown: stop accepting connections, let in-flight requests finish, close the DB.
let closing = false;
function shutdown(signal) {
  if (closing) return;
  closing = true;
  logger.info({ signal }, "shutting down");
  const force = setTimeout(() => process.exit(1), 10_000).unref();   // never hang forever
  server.close(() => {
    db.close();
    clearTimeout(force);
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => { logger.fatal({ err }, "unhandled rejection"); shutdown("unhandledRejection"); });
