/**
 * Get Invoice Summary Use Case
 * Returns aggregated statistics for invoices
 */

class GetInvoiceSummaryUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute() {
        const summary = await this.invoiceRepository.getSummary();
        return summary;
    }
}

export default GetInvoiceSummaryUseCase;
