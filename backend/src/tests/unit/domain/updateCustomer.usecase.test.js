import UpdateCustomerUseCase from '../../../application/use-cases/customer/updateCustomer.usecase';
import Customer from '../../../domain/entities/Customer.js';

describe('UpdateCustomerUseCase', () => {
  const customer = Customer.create({ name: 'Old Name', paymentTerm: 'NET_15', creditLimit: 5000 });
  const mockRepo = {
    findById: jest.fn(async () => customer),
    update: jest.fn(async (c) => c)
  };
  const usecase = new UpdateCustomerUseCase(mockRepo);

  test('Update customer name', async () => {
    const updated = await usecase.execute(customer.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
    expect(mockRepo.update).toHaveBeenCalled();
  });
});
