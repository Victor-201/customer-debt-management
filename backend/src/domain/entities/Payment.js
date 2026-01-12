import { Money } from "../value-objects/Money.js";

class Payment {
  constructor({
    id,
    invoice_id,
    payment_date,
    amount,
    method,
    reference,
    recorded_by,
    created_at,
  }) {
    this.id = id ?? null;
    this.invoice_id = invoice_id;
    this.payment_date = payment_date;

    this.amount = new Money(amount);
    this.method = method;
    this.reference = reference ?? null;

    this.recorded_by = recorded_by ?? null;
    this.created_at = created_at ?? null;
  }

  static record({
    invoice_id,
    payment_date,
    amount,
    method,
    reference,
    recorded_by,
  }) {
    return new Payment({
      invoice_id,
      payment_date,
      amount,
      method,
      reference,
      recorded_by,
    });
  }
}

export default Payment;
