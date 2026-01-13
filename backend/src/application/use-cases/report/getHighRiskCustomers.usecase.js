class GetHighRiskCustomersUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }

    async execute() {
        return await this.customerRepository.findHighRiskCustomers();
    }
}

export default GetHighRiskCustomersUseCase;
