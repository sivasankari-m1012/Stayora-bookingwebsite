import { readFileSync } from "node:fs";
import { Router } from "express";
import { fileURLToPath } from "node:url";
import { adminAppJs, adminCss, adminPage } from "../admin.js";

const OPENAPI = readFileSync(fileURLToPath(new URL("../../../openapi.yaml", import.meta.url)), "utf8");

export function systemRoutes({ db }) {
  const r = Router();
  // Liveness: "is the process up?"  Readiness: "can it actually serve traffic (DB reachable)?"
  r.get("/api/health", (_req, res) => res.json({ ok: true }));
  r.get("/api/ready", (_req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });
  r.get("/api/openapi.yaml", (_req, res) => res.type("text/yaml").send(OPENAPI));

  // Admin UI: static files only (CSP-friendly). Its data call to /api/bookings carries the admin token.
  const strictCsp = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'";
  r.get("/admin", (_req, res) => res.setHeader("Content-Security-Policy", strictCsp).type("html").send(adminPage));
  r.get("/admin/app.js", (_req, res) => res.type("js").send(adminAppJs));
  r.get("/admin/app.css", (_req, res) => res.type("css").send(adminCss));

  r.get("/", (_req, res) =>
    res.json({
      name: "Stayora API",
      docs: "/api/openapi.yaml",
      try: ["/api/health", "/api/ready", "/api/listing", "/api/photos", "/api/amenities", "/api/reviews", "/api/nearby",
            "/api/availability?months=2", "/api/quote?checkIn=2026-10-18&checkOut=2026-10-23&adults=2", "/admin"],
    })
  );
  return r;
}
