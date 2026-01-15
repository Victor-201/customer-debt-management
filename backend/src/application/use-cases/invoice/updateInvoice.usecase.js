import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";
import { Money } from "../../../domain/value-objects/Money.js";

class UpdateInvoiceUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(id, data, updatedBy) {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        if (data.invoiceNumber) invoice.invoice_number = data.invoiceNumber;
        if (data.issueDate) invoice.issue_date = data.issueDate;
        if (data.dueDate) invoice.due_date = data.dueDate;

        if (data.totalAmount !== undefined) {
            const newTotal = new Money(data.totalAmount);

            if (invoice.paid_amount.isGreaterThan(newTotal)) {
                throw new BusinessRuleError(
                    "Total amount cannot be less than paid amount"
                );
            }

            invoice.total_amount = newTotal;
            invoice.recalcBalance();
        }

        invoice.updated_by = updatedBy;

        return await this.invoiceRepository.save(invoice);

    }
}

export default UpdateInvoiceUseCase;
