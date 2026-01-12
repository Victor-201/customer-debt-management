import { PaymentTerm } from '../../../domain/value-objects/PaymentTerm.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class UpdateCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId, data) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new BusinessRuleError('Customer not found');
    }

    this.#validate(data);

    const updates = {};

    if (data.name !== undefined) updates.name = data.name;
    if (data.email !== undefined) updates.email = data.email;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.address !== undefined) updates.address = data.address;

    if (data.paymentTerm !== undefined) {
      updates.paymentTerm = PaymentTerm.fromString(data.paymentTerm);
    }

    if (data.creditLimit !== undefined) {
      updates.creditLimit = Money.fromNumber(data.creditLimit);
    }

    customer.update(updates);
    return this.customerRepository.update(customer);
  }

  #validate(data) {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new BusinessRuleError('Invalid email format');
    }

    if (data.paymentTerm &&
      !['NET_7', 'NET_15', 'NET_30'].includes(data.paymentTerm)
    ) {
      throw new BusinessRuleError('Invalid payment term');
    }

    if (data.creditLimit !== undefined && data.creditLimit < 0) {
      throw new BusinessRuleError('Credit limit cannot be negative');
    }
  }
}
