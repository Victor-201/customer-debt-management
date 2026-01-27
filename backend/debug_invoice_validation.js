
import Joi from 'joi';

const INVOICE_STATUS = ["DRAFT", "PENDING", "OVERDUE", "PAID", "CANCELLED"];
const uuid = Joi.string().guid({ version: "uuidv4" });

// Invoice Item schema for validation
const invoiceItemSchema = Joi.object({
    id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
    description: Joi.string().min(1).max(255).required(),
    quantity: Joi.number().integer().min(1).required(),
    unitPrice: Joi.number().precision(2).min(0).required()
});

const createInvoiceSchema = Joi.object({

    customerId: uuid.required(),

    invoiceNumber: Joi.string().min(1).max(50).optional(),

    issueDate: Joi.date().iso().required(),
    dueDate: Joi.date().iso().required(),

    totalAmount: Joi.number().precision(2).greater(0).required(),
    paidAmount: Joi.number().precision(2).min(0).default(0),

    // optional: nếu không gửi thì backend/entity tự tính
    balanceAmount: Joi.number().precision(2).min(0).optional(),

    status: Joi.string().valid(...INVOICE_STATUS).required(),

    // Invoice line items
    items: Joi.array().items(invoiceItemSchema).optional()

})
    // due_date >= issue_date
    .custom((value, helpers) => {
        if (!value.issueDate || !value.dueDate) return value;
        const issue = new Date(value.issueDate);
        const due = new Date(value.dueDate);
        if (due < issue) {
            return helpers.error("any.custom", { message: "dueDate cannot be earlier than issueDate" });
        }
        return value;
    })
    // paid_amount <= total_amount
    .custom((value, helpers) => {
        if (!value.totalAmount) return value;
        const total = Number(value.totalAmount);
        const paid = Number(value.paidAmount ?? 0);
        if (paid > total) {
            return helpers.error("any.custom", { message: "paidAmount cannot exceed totalAmount" });
        }
        return value;
    })
    // balance rule
    .custom((value, helpers) => {
        if (value.balanceAmount === undefined) return value;

        const total = Number(value.totalAmount);
        const paid = Number(value.paidAmount ?? 0);
        const computed = Number((total - paid).toFixed(2));
        const provided = Number(Number(value.balanceAmount).toFixed(2));

        if (provided !== computed) {
            return helpers.error("any.custom", {
                message: `balanceAmount must equal totalAmount - paidAmount (${computed})`,
            });
        }
        return value;
    });

// Mock Payload from Frontend
const payload = {
    customerId: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Valid UUID
    issueDate: "2026-01-27",
    dueDate: "2026-02-11",
    totalAmount: 16500000,
    paidAmount: 0,
    status: "PENDING",
    items: [
        {
            id: 1,
            description: "FE",
            quantity: 3,
            unitPrice: 5000000
        }
    ]
};

const result = createInvoiceSchema.validate(payload, { abortEarly: false, stripUnknown: true });

if (result.error) {
    console.error("VALIDATION ERROR:", JSON.stringify(result.error.details, null, 2));
} else {
    console.log("VALIDATION SUCCESS:", result.value);
}
