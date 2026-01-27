import Joi from "joi";

const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "REVERSAL",
];

const uuid = Joi.string().guid({ version: "uuidv4" });

const createPaymentSchema = Joi.object({
  invoiceId: uuid.required(),

  paymentDate: Joi.date().iso().required(),

  amount: Joi.number()
    .precision(2)
    .greater(0)
    .required(),

  method: Joi.string()
    .valid(...PAYMENT_METHODS.filter(m => m !== "REVERSAL"))
    .required(),

  reference: Joi.string().max(255).optional(),
});

const reversePaymentSchema = Joi.object({
  reason: Joi.string().min(3).max(255).optional(),
});

export {
  createPaymentSchema,
  reversePaymentSchema
};