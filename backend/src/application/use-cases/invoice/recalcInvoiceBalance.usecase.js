import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

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

        const totalPaid = await this.paymentRepository.sumByInvoiceId(id);

        invoice.recalcBalance(totalPaid);

        return await this.invoiceRepository.save(invoice);
    }
}

export default RecalcInvoiceBalanceUseCase;
