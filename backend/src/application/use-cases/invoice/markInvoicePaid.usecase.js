import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class MarkInvoicePaidUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(id) {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        if (invoice.isPaid()) {
            return invoice;
        }

        // Track balance
        if (invoice.balance_amount.amount > 0) {
            throw new BusinessRuleError(
                "Cannot mark invoice as PAID while balance is greater than zero"
            );
        }

        invoice.status = InvoiceStatus.PAID;

        return await this.invoiceRepository.save(invoice);
    }
}

export default MarkInvoicePaidUseCase;
