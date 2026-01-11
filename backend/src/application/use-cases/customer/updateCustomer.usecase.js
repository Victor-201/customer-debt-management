import { PaymentTerm } from '../../../domain/value-objects/PaymentTerm.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class UpdateCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId, customerData) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new BusinessRuleError('Customer not found');
    }

    this.#validateInput(customerData);

    const updates = this.#buildUpdates(customerData);

    customer.update(updates);

    return this.customerRepository.update(customer);
  }

  #buildUpdates(customerData) {
    const updates = {};

    if (customerData.name !== undefined) updates.name = customerData.name;
    if (customerData.email !== undefined) updates.email = customerData.email;
    if (customerData.phone !== undefined) updates.phone = customerData.phone;
    if (customerData.address !== undefined) updates.address = customerData.address;

    if (customerData.paymentTerm !== undefined) {
      updates.paymentTerm = PaymentTerm.fromString(customerData.paymentTerm);
    }

    if (customerData.creditLimit !== undefined) {
      updates.creditLimit = Money.fromNumber(customerData.creditLimit);
    }

    if (customerData.riskLevel !== undefined) {
      updates.riskLevel = customerData.riskLevel;
    }

    if (customerData.status !== undefined) {
      updates.status = customerData.status;
    }

    return updates;
  }

  #validateInput(customerData) {
    if (
      customerData.email &&
      !this.#isValidEmail(customerData.email)
    ) {
      throw new BusinessRuleError('Invalid email format');
    }

    if (
      customerData.paymentTerm &&
      !this.#isValidPaymentTerm(customerData.paymentTerm)
    ) {
      throw new BusinessRuleError('Invalid payment term');
    }

    if (
      customerData.creditLimit !== undefined &&
      customerData.creditLimit < 0
    ) {
      throw new BusinessRuleError('Credit limit cannot be negative');
    }

    if (
      customerData.riskLevel &&
      !this.#isValidRiskLevel(customerData.riskLevel)
    ) {
      throw new BusinessRuleError('Invalid risk level');
    }

    if (
      customerData.status &&
      !this.#isValidStatus(customerData.status)
    ) {
      throw new BusinessRuleError('Invalid status');
    }
  }

  #isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  #isValidPaymentTerm(paymentTerm) {
    return ['NET_7', 'NET_15', 'NET_30'].includes(paymentTerm);
  }

  #isValidRiskLevel(riskLevel) {
    return ['NORMAL', 'WARNING', 'HIGH_RISK'].includes(riskLevel);
  }

  #isValidStatus(status) {
    return ['ACTIVE', 'INACTIVE'].includes(status);
  }
}
