import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class UpdateCustomerStatusUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId, status) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new BusinessRuleError('Customer not found');
    }

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new BusinessRuleError('Invalid customer status');
    }

    if (status === 'ACTIVE') customer.activate();
    else customer.deactivate();

    return this.customerRepository.update(customer);
  }
}
