import { Router } from "express";
import { methodNotAllowed } from "../middleware/http.js";
import { validate } from "../middleware/validate.js";
import { reviewsQuery } from "../schemas.js";

// Read-only content: safe to cache for a minute at the browser / CDN.
export function contentRoutes({ contentService }) {
  const r = Router();
  const get = (path, handler, schemas = {}) =>
    r.route(path).get(validate(schemas), (req, res) => res.set("Cache-Control", "public, max-age=60").json(handler(req))).all(methodNotAllowed("GET"));

  get("/listing", () => contentService.listing());
  get("/photos", () => contentService.photos());
  get("/amenities", () => contentService.amenities());
  get("/nearby", () => contentService.nearby());
  get("/reviews", (req) => contentService.reviews(req.valid.query), { query: reviewsQuery });
  return r;
}
