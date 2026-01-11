class ValidationError extends Error {
  constructor(message = 'Validation failed', details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export default ValidationError;