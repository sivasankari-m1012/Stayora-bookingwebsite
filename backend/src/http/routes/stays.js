import { Router } from "express";
import { methodNotAllowed } from "../middleware/http.js";
import { validate } from "../middleware/validate.js";
import { availabilityQuery, quoteQuery } from "../schemas.js";

export function stayRoutes({ availability }) {
  const r = Router();
  r.route("/availability")
    .get(validate({ query: availabilityQuery }), (req, res) => res.json(availability.availability(req.valid.query)))
    .all(methodNotAllowed("GET"));
  r.route("/quote")
    .get(validate({ query: quoteQuery }), (req, res) => res.json(availability.quote(req.valid.query)))
    .all(methodNotAllowed("GET"));
  return r;
}
