import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class RecalcInvoiceBalanceUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(id, userId) {
        const invoice = await this.invoiceRepository.findById(id);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        // Logic: Just saving the entity might trigger DB based recalculations 
        // or if the entity was loaded and somehow modified in memory (which it isn't here).
        // The main purpose often is to fetch -> re-save to sync eventual consistency or triggers.
        // Invoice entity's constructor aligns balance based on total - paid.
        // If DB has bad state, loading it into Entity calculates correct balance, saving it persists it.

        // We can also double check payments if we had a payment repository, but we don't here.

        return await this.invoiceRepository.save(invoice);
    }
}

export default RecalcInvoiceBalanceUseCase;
