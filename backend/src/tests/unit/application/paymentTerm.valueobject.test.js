import { PaymentTerm } from '../../../domain/value-objects/PaymentTerm';

describe('PaymentTerm Value Object', () => {

  test('Should return correct PaymentTerm instances', () => {
    const net7 = PaymentTerm.fromString('NET_7');
    const net15 = PaymentTerm.fromString('NET_15');
    const net30 = PaymentTerm.fromString('NET_30');

    expect(net7).toBe(PaymentTerm.NET_7);
    expect(net15).toBe(PaymentTerm.NET_15);
    expect(net30).toBe(PaymentTerm.NET_30);

    expect(net7.toString()).toBe('NET_7');
    expect(net15.toString()).toBe('NET_15');
    expect(net30.toString()).toBe('NET_30');

    expect(net7.equals(PaymentTerm.NET_7)).toBe(true);
    expect(net7.equals(PaymentTerm.NET_15)).toBe(false);
  });

  test('Should throw error for invalid term', () => {
    expect(() => PaymentTerm.fromString('NET_99')).toThrow('Invalid payment term: NET_99');
  });

});
