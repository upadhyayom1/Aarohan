export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const details = {};
      error.errors.forEach((err) => {
        const field = err.path.join('.') || 'body';
        details[field] = err.message;
      });

      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Missing or invalid fields',
        details,
      });
    }

    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: {},
    });
  }
};

