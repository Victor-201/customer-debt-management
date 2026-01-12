import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class DeleteCustomerUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new BusinessRuleError('Customer not found');
    }

    const hasInvoices = await this.customerRepository.hasInvoices(customerId);
    if (hasInvoices) {
      throw new BusinessRuleError(
        'Cannot delete customer with existing invoices'
      );
    }

    await this.customerRepository.delete(customerId);
    return { message: 'Customer deleted successfully' };
  }
}
