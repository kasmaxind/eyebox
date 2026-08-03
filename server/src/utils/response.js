export function ok(res, data = null, meta = undefined) {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.json(body);
}

export function fail(res, status, message, details = undefined) {
  const body = { success: false, error: message };
  if (details !== undefined) body.details = details;
  return res.status(status).json(body);
}

export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
