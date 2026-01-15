class UpdateOverdueInvoicesUseCase {
    constructor({ invoiceRepository }) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute() {
        // Determine what "currentDate" is. Usually now.
        const currentDate = new Date();
        await this.invoiceRepository.markOverdueInvoices(currentDate);
        return { success: true, timestamp: currentDate };
    }
}

export default UpdateOverdueInvoicesUseCase;
