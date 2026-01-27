import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class CancelInvoiceUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(id) {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        if (invoice.status === "CANCELLED") {
            return invoice;
        }

        if (invoice.status === "PAID") {
            throw new BusinessRuleError(
                "Cannot cancel a paid invoice"
            );
        }

        if (invoice.paidAmount > 0) {
            throw new BusinessRuleError(
                "Cannot cancel invoice with existing payments. Balance must be zero."
            );
        }

        return await this.invoiceRepository.update(id, {
            status: "CANCELLED"
        });
    }
}

export default CancelInvoiceUseCase;
