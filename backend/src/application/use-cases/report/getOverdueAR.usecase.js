class GetOverdueArUseCase {
    constructor({ invoiceRepository }) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute() {
        return await this.invoiceRepository.getOverdueReport();
    }
}

export default GetOverdueArUseCase;