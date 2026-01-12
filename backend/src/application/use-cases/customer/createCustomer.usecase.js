import Customer from '../../../domain/entities/Customer.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class CreateCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(data) {
    this.#validate(data);

    const customer = Customer.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      paymentTerm: data.paymentTerm,
      creditLimit: data.creditLimit,
    });

    return this.customerRepository.create(customer);
  }

  #validate(data) {
    if (!data.name?.trim()) {
      throw new BusinessRuleError('Customer name is required');
    }

    if (data.email && !this.#isValidEmail(data.email)) {
      throw new BusinessRuleError('Invalid email format');
    }

    if (!['NET_7', 'NET_15', 'NET_30'].includes(data.paymentTerm)) {
      throw new BusinessRuleError('Invalid payment term');
    }

    if (data.creditLimit < 0) {
      throw new BusinessRuleError('Credit limit cannot be negative');
    }
  }

  #isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
