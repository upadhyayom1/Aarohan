import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const details = {};
    err.errors.forEach(e => {
      const field = e.path.join('.');
      details[field] = e.message;
    });

    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    });
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  if (statusCode === 500) {
    console.error('Unhandled server error:', err);
  }

  return res.status(statusCode).json({
    code,
    message,
    details: err.details || {},
  });
}

