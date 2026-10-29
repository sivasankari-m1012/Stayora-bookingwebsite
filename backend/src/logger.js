// Structured JSON logs (one line per event). Pretty-print locally with:  npm start | npx pino-pretty
import pino from "pino";

export const createLogger = (config) =>
  pino({
    level: config.logLevel,
    redact: ["req.headers.authorization", "req.headers.cookie"], // never log secrets
  });
