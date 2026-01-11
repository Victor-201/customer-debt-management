import CreateCustomerUseCase from '../../../application/use-cases/customer/createCustomer.usecase.js';
import Customer from '../../../domain/entities/Customer.js';

describe('CreateCustomerUseCase', () => {
  const mockRepo = {
    save: jest.fn(async (customer) => customer)
  };
  const usecase = new CreateCustomerUseCase(mockRepo);

  test('Create valid customer', async () => {
    const input = { name: 'Test Corp', paymentTerm: 'NET_30', creditLimit: 10000 };
    const customer = await usecase.execute(input);

    expect(customer).toBeInstanceOf(Customer);
    expect(customer.name).toBe('Test Corp');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
