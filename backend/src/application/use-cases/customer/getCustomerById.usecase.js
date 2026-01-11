import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class GetCustomerByIdUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new BusinessRuleError('Customer not found');
    }

    return this.#toResponse(customer);
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
