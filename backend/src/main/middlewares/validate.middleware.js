import ValidationError from '../../shared/errors/ValidationError.js';

const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true  // Remove unknown fields instead of rejecting them
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace req.body with validated/sanitized value
    req.body = value;
    next();
  };
};

export default validateMiddleware;

