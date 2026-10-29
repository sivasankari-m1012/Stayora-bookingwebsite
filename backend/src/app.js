import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { errorHandler, notFoundHandler } from "./http/middleware/errorHandler.js";
import { limiter, noStore } from "./http/middleware/http.js";
import { bookingRoutes } from "./http/routes/bookings.js";
import { contentRoutes } from "./http/routes/content.js";
import { stayRoutes } from "./http/routes/stays.js";
import { systemRoutes } from "./http/routes/system.js";

// Builds the Express app. No listening, no DB opening: everything arrives through arguments,
// so tests can create as many isolated apps as they like.
export function createApp({ config, logger, container }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  // 1. Every request gets an id (or reuses the caller's), echoed in the response, the logs and error bodies.
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const given = req.headers["x-request-id"];
        const id = typeof given === "string" && /^[\w.-]{1,64}$/.test(given) ? given : randomUUID();
        res.setHeader("X-Request-Id", id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url === "/api/health" },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
    })
  );

  // 2. Security headers, CORS allow-list, global rate limit, small JSON body limit.
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Idempotency-Key", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id", "RateLimit", "RateLimit-Policy"],
      maxAge: 600,
    })
  );
  app.use(limiter(config.rateLimitPerMin, { skip: (req) => req.path === "/api/health" }));
  app.use(express.json({ limit: "16kb" }));
  app.use(noStore);

  // 3. Routes
  app.use(systemRoutes(container));
  app.use("/api", contentRoutes(container), stayRoutes(container), bookingRoutes({ ...container, config }));

  // 4. Anything unmatched, then the single error formatter.
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
