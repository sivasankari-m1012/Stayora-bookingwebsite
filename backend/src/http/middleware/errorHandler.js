import { AppError, notFound } from "../../domain/errors.js";

export const notFoundHandler = (_req, _res, next) => next(notFound("Route not found"));

// Every error leaves the API in the same shape: { error: { code, message, details?, requestId } }
// eslint-disable-next-line no-unused-vars -- Express recognises error middleware by its 4 parameters
export function errorHandler(err, req, res, _next) {
  let status = 500, code = "internal", message = "Something went wrong", details;

  if (err instanceof AppError) {
    ({ status, code, message, details } = err);
  } else if (err?.type === "entity.parse.failed") {
    [status, code, message] = [400, "validation_error", "Body is not valid JSON"];
  } else if (err?.type === "entity.too.large") {
    [status, code, message] = [413, "payload_too_large", "Body too large"];
  }

  if (status >= 500) req.log.error({ err }, "unhandled error");     // bugs are logged with a stack, never sent to clients
  if (res.headersSent) return;
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json({ error: { code, message, ...(details && { details }), requestId: req.id } });
}
