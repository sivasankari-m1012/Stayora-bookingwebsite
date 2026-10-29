// One error type for every "expected" failure. The HTTP layer turns it into a JSON response;
// anything that is NOT an AppError is a bug and becomes a generic 500.
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, "validation_error", message, details);
export const unauthorized = (message = "Authentication required") => new AppError(401, "unauthorized", message);
export const notFound = (message = "Not found") => new AppError(404, "not_found", message);
export const conflict = (code, message) => new AppError(409, code, message);
