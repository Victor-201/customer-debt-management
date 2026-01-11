import Customer from '../../../domain/entities/Customer.js';

describe('Customer Entity', () => {

  test('Create a valid customer', () => {
    const customer = Customer.create({
      name: 'ABC Corp',
      paymentTerm: 'NET_30',
      creditLimit: 5000
    });

    expect(customer.name).toBe('ABC Corp');
    expect(customer.paymentTerm.value).toBe('NET_30');
    expect(customer.creditLimit.amount).toBe(5000);
    expect(customer.status).toBe('ACTIVE');
  });

  test('Activate & deactivate customer', () => {
    const customer = Customer.create({
      name: 'XYZ Corp',
      paymentTerm: 'NET_15',
      creditLimit: 10000
    });

    customer.deactivate();
    expect(customer.isActive()).toBe(false);

    customer.activate();
    expect(customer.isActive()).toBe(true);
  });

});
