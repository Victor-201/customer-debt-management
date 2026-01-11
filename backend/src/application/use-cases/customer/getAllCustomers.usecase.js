export default class GetAllCustomersUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute() {
    const customers = await this.customerRepository.findAll();
    return customers.map(customer => this.#toResponse(customer));
  }

  #toResponse(customer) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      paymentTerm: customer.paymentTerm.value,
      creditLimit: customer.creditLimit.amount,
      riskLevel: customer.riskLevel,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }
}
