import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

export default class UpdateCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId, data) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new BusinessRuleError("Customer not found");
    }

    this.#validate(data);

    if (data.name !== undefined) customer.name = data.name;
    if (data.email !== undefined) customer.email = data.email;
    if (data.phone !== undefined) customer.phone = data.phone;
    if (data.address !== undefined) customer.address = data.address;
    if (data.paymentTerm !== undefined) customer.paymentTerm = data.paymentTerm;
    if (data.creditLimit !== undefined) customer.creditLimit = data.creditLimit;
    if (data.riskLevel !== undefined) customer.riskLevel = data.riskLevel;
    if (data.status !== undefined) customer.status = data.status;

    customer.updatedAt = new Date();

    return this.customerRepository.update(customer);
  }

  #validate(data) {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new BusinessRuleError("Invalid email format");
    }

    if (
      data.paymentTerm &&
      !["NET_7", "NET_15", "NET_30"].includes(data.paymentTerm)
    ) {
      throw new BusinessRuleError("Invalid payment term");
    }

    if (data.creditLimit !== undefined && data.creditLimit < 0) {
      throw new BusinessRuleError("Credit limit cannot be negative");
    }
  }
}
