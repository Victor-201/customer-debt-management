import Joi from "joi";

const createCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(50).optional(),
  address: Joi.string().max(1000).optional(),
  paymentTerm: Joi.string().valid("NET_7", "NET_15", "NET_30").required(),
  creditLimit: Joi.number().min(0).required(),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(50).optional(),
  address: Joi.string().max(1000).optional(),
  paymentTerm: Joi.string().valid("NET_7", "NET_15", "NET_30").optional(),
  creditLimit: Joi.number().min(0).optional(),
  riskLevel: Joi.string().valid("NORMAL", "WARNING", "HIGH_RISK").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
});

const updateCustomerStatusSchema = Joi.object({
  status: Joi.string()
    .valid("ACTIVE", "INACTIVE")
    .required(),
});

export {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
};
