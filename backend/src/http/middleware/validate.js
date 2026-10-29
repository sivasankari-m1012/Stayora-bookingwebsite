import { badRequest } from "../../domain/errors.js";

// validate({ query, body, headers }) -> parsed values land in req.valid.{query,body,headers}.
// (Express 5 makes req.query read-only, so we never overwrite the originals.)
export const validate = (schemas) => (req, _res, next) => {
  req.valid = {};
  for (const part of ["headers", "query", "body"]) {
    const schema = schemas[part];
    if (!schema) continue;
    const input = req[part];
    if (part === "body" && (input === null || typeof input !== "object" || Array.isArray(input))) {
      return next(badRequest("JSON body required"));
    }
    const result = schema.safeParse(input);
    if (!result.success) {
      const issues = result.error.issues;
      return next(badRequest(issues[0].message, issues.map((i) => ({ path: i.path.join("."), message: i.message }))));
    }
    req.valid[part] = result.data;
  }
  next();
};
