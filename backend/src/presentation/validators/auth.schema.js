import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'ACCOUNTANT').required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
};
