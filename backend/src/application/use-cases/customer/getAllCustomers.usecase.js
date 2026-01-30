export default class GetAllCustomersUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute({ page, limit }) {
    const result = await this.customerRepository.findAll({ page, limit });

    return {
      data: result.data.map((c) => this.#toResponse(c)),
      pagination: result.pagination,
    };
  }

  #toResponse(customer) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      paymentTerm: customer.paymentTerm,
      creditLimit: customer.creditLimit,
      riskLevel: customer.riskLevel,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
