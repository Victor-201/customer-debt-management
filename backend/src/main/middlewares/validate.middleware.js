import ValidationError from '../../shared/errors/ValidationError.js';

const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
};

export default validateMiddleware;
