import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";
import { Money } from "../../../domain/value-objects/Money.js";

class RecalcInvoiceBalanceUseCase {
    constructor(invoiceRepository, paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    async execute(id) {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        const totalPaidNumber = await this.paymentRepository.sumByInvoiceId(id);

        invoice.paid_amount = new Money(totalPaidNumber);

        invoice.recalcBalance();

        return await this.invoiceRepository.save(invoice);
    }
}

export default RecalcInvoiceBalanceUseCase;
