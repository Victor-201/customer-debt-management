class GetTotalARUseCase {
    constructor({ invoiceRepository }) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute() {
        return await this.invoiceRepository.getTotalArReport();
    }
}

export default GetTotalARUseCase;
