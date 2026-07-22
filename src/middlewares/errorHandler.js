export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: { message: err.message, details: err.details } });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: { message: err.message } });
  }
  console.error(err.stack);
  return res.status(500).json({ error: { message: 'Internal server error' } });
}
