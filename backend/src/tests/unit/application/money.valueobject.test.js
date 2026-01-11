import { Money } from '../../../domain/value-objects/Money';

describe('Money Value Object', () => {

  test('Add two Money objects with same currency', () => {
    const m1 = new Money(1000, 'VND');
    const m2 = new Money(2000, 'VND');
    const sum = m1.add(m2);

    expect(sum.amount).toBe(3000);
    expect(sum.currency).toBe('VND');
  });

  test('Cannot add Money objects with different currencies', () => {
    const m1 = new Money(1000, 'VND');
    const m2 = new Money(50, 'USD');
    expect(() => m1.add(m2)).toThrow('Cannot add money with different currencies');
  });

  test('Subtract two Money objects', () => {
    const m1 = new Money(5000, 'VND');
    const m2 = new Money(3000, 'VND');
    const result = m1.subtract(m2);

    expect(result.amount).toBe(2000);
    expect(result.currency).toBe('VND');
  });

  test('Cannot subtract more than amount', () => {
    const m1 = new Money(1000, 'VND');
    const m2 = new Money(2000, 'VND');
    expect(() => m1.subtract(m2)).toThrow('Cannot subtract more than available amount');
  });

  test('Multiply money by factor', () => {
    const m = new Money(1000, 'VND');
    const result = m.multiply(3);
    expect(result.amount).toBe(3000);
    expect(result.currency).toBe('VND');
  });

  test('Comparison: isGreaterThan and isLessThan', () => {
    const m1 = new Money(5000, 'VND');
    const m2 = new Money(3000, 'VND');

    expect(m1.isGreaterThan(m2)).toBe(true);
    expect(m2.isLessThan(m1)).toBe(true);
  });

  test('Equality check', () => {
    const m1 = new Money(1000, 'VND');
    const m2 = new Money(1000, 'VND');
    const m3 = new Money(1000, 'USD');

    expect(m1.equals(m2)).toBe(true);
    expect(m1.equals(m3)).toBe(false);
  });

});
