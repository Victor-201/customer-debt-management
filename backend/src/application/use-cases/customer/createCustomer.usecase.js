import Customer from '../../../domain/entities/Customer.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class CreateCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerData) {
    this.#validateInput(customerData);

    // Gọi Customer.create đúng signature
    const customer = Customer.create({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      paymentTerm: customerData.paymentTerm,
      creditLimit: customerData.creditLimit,
    });

    // Lưu vào repository
    return this.customerRepository.save(customer);
  }

  #validateInput(customerData) {
    if (!customerData.name?.trim()) {
      throw new BusinessRuleError('Customer name is required');
    }

    if (customerData.email && !this.#isValidEmail(customerData.email)) {
      throw new BusinessRuleError('Invalid email format');
    }

    if (!this.#isValidPaymentTerm(customerData.paymentTerm)) {
      throw new BusinessRuleError('Invalid payment term');
    }

    if (customerData.creditLimit < 0) {
      throw new BusinessRuleError('Credit limit cannot be negative');
    }
  }

  #isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  #isValidPaymentTerm(paymentTerm) {
    return ['NET_7', 'NET_15', 'NET_30'].includes(paymentTerm);
  }
}
