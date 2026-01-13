import { Money } from "../value-objects/Money.js";
import { InvoiceStatus } from "../value-objects/InvoiceStatus.js";

class Invoice {
  constructor({
    id,
    customer_id,
    invoice_number,
    issue_date,
    due_date,
    total_amount,
    paid_amount = 0,
    status,
    created_by,
    created_at,
    updated_at,
  }) {
    this.id = id ?? null;

    this.customer_id = customer_id;
    this.invoice_number = invoice_number;

    this.issue_date = issue_date;
    this.due_date = due_date;

    this.total_amount = new Money(total_amount);
    this.paid_amount = new Money(paid_amount);
    this.balance_amount = this.total_amount.subtract(this.paid_amount);

    this.status =
      status instanceof InvoiceStatus
        ? status
        : InvoiceStatus.PENDING;

    this.created_by = created_by ?? null;
    this.created_at = created_at ?? null;
    this.updated_at = updated_at ?? null;
  }

  static create({ customer_id, invoice_number, issue_date, due_date, total_amount, created_by }) {
    return new Invoice({
      customer_id,
      invoice_number,
      issue_date,
      due_date,
      total_amount,
      status: InvoiceStatus.PENDING,
      created_by,
    });
  }

  applyPayment(amount) {
    if (!this.status.canApplyPayment()) {
      throw new Error("Cannot apply payment to a PAID invoice");
    }

    const paymentMoney = new Money(amount);

    if (paymentMoney.isGreaterThan(this.balance_amount)) {
      throw new Error("Payment exceeds invoice balance");
    }

    this.paid_amount = this.paid_amount.add(paymentMoney);
    this.balance_amount = this.total_amount.subtract(this.paid_amount);

    if (this.balance_amount.amount === 0) {
      this.status = InvoiceStatus.PAID;
    }
  }

  markOverdue(currentDate = new Date()) {
    if (
      this.status.isPending() &&
      new Date(this.due_date) < currentDate
    ) {
      this.status = InvoiceStatus.OVERDUE;
    }
  }

  isPaid() {
    return this.status.isPaid();
  }
}

export default Invoice;
