import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class MarkInvoicePaidUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(id, userId) {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        if (invoice.isPaid()) {
            return invoice; // Already paid
        }

        // Pay remaining balance
        const remaining = invoice.balance_amount.amount;
        invoice.applyPayment(remaining);

        // Track who did it? Invoice entity has updated_at but no updated_by field in constructor (only created_by).
        // The DB schema in seed/migration might have it?
        // Invoice.js has created_by only.

        return await this.invoiceRepository.save(invoice);
    }
}

export default MarkInvoicePaidUseCase;
