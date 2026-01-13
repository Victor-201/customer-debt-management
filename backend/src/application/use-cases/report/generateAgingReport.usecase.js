class GenerateAgingReportUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute() {
        return await this.invoiceRepository.getAgingReport();
    }
}

export default GenerateAgingReportUseCase;
