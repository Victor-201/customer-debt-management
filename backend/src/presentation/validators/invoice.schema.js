import Joi from "joi";

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
        const issue = new Date(value.issueDate);
        const due = new Date(value.dueDate);
        if (due < issue) {
            return helpers.error("any.custom", { message: "dueDate cannot be earlier than issueDate" });
        }
        return value;
    })
    // paid_amount <= total_amount
    .custom((value, helpers) => {
        const total = Number(value.totalAmount);
        const paid = Number(value.paidAmount ?? 0);
        if (paid > total) {
            return helpers.error("any.custom", { message: "paidAmount cannot exceed totalAmount" });
        }
        return value;
    })
    // balance rule: balance = total - paid (nếu client có gửi balanceAmount)
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

// ---- UPDATE (partial) ----
const updateInvoiceSchema = Joi.object({
    invoiceNumber: Joi.string().min(1).max(50).optional(),

    issueDate: Joi.date().iso().optional(),
    dueDate: Joi.date().iso().optional(),

    totalAmount: Joi.number().precision(2).greater(0).optional(),
    paidAmount: Joi.number().precision(2).min(0).optional(),
    balanceAmount: Joi.number().precision(2).min(0).optional(),

    status: Joi.string().valid(...INVOICE_STATUS).optional(),

    // Invoice line items (optional for partial updates)
    items: Joi.array().items(invoiceItemSchema).optional()
})
    // nếu có đủ dữ liệu ngày thì check due >= issue
    .custom((value, helpers) => {
        if (!value.issueDate || !value.dueDate) return value;
        const issue = new Date(value.issueDate);
        const due = new Date(value.dueDate);
        if (due < issue) {
            return helpers.error("any.custom", { message: "dueDate cannot be earlier than issueDate" });
        }
        return value;
    })
    // nếu update cả total & paid thì check paid <= total
    .custom((value, helpers) => {
        if (value.totalAmount === undefined || value.paidAmount === undefined) return value;
        const total = Number(value.totalAmount);
        const paid = Number(value.paidAmount);
        if (paid > total) {
            return helpers.error("any.custom", { message: "paidAmount cannot exceed totalAmount" });
        }
        return value;
    })
    // nếu client gửi balance thì phải khớp total-paid (khi đủ dữ liệu)
    .custom((value, helpers) => {
        if (value.balanceAmount === undefined) return value;

        // Chỉ validate rule khi update có đủ total & paid để tính
        if (value.totalAmount === undefined || value.paidAmount === undefined) return value;

        const computed = Number((Number(value.totalAmount) - Number(value.paidAmount)).toFixed(2));
        const provided = Number(Number(value.balanceAmount).toFixed(2));
        if (provided !== computed) {
            return helpers.error("any.custom", {
                message: `balanceAmount must equal totalAmount - paidAmount (${computed})`,
            });
        }
        return value;
    });

// ---- UPDATE STATUS ONLY ----
const updateInvoiceStatusSchema = Joi.object({
    status: Joi.string().valid(...INVOICE_STATUS).required(),
});

export {
    createInvoiceSchema,
    updateInvoiceSchema,
    updateInvoiceStatusSchema,
};
