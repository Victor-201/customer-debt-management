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
    created_by,
    created_at,
    updated_at,
    items = []
  }) {
    this.id = id ?? null;

    this.customer_id = customer_id;
    this.invoice_number = invoice_number;

    this.issue_date = issue_date;
    this.due_date = due_date;

    this.total_amount = new Money(total_amount);
    this.paid_amount = new Money(paid_amount);
    if (this.paid_amount.isGreaterThan(this.total_amount)) {
      throw new Error("Paid amount cannot exceed total amount");
    }
    this.balance_amount = this.total_amount.subtract(this.paid_amount);

    this.status =
      status instanceof InvoiceStatus
        ? status
        : InvoiceStatus.PENDING;

    this.created_by = created_by ?? null;
    this.created_at = created_at ?? null;
    this.updated_at = updated_at ?? null;
    this.items = items;
  }

  static create({ customer_id, invoice_number, issue_date, due_date, total_amount, created_by, items }) {
    return new Invoice({
      customer_id,
      invoice_number,
      issue_date,
      due_date,
      total_amount,
      total_amount,
      status: InvoiceStatus.PENDING,
      created_by,
      items: items || []
    });
  }

  applyPayment(paymentMoney) {
    if (!(paymentMoney instanceof Money)) {
      throw new Error("applyPayment expects Money");
    }

    if (!this.status.canApplyPayment()) {
      throw new Error("Cannot apply payment to a PAID invoice");
    }

    if (paymentMoney.isGreaterThan(this.balance_amount)) {
      throw new Error("Payment exceeds invoice balance");
    }

    this.paid_amount = this.paid_amount.add(paymentMoney);
    this.balance_amount = this.total_amount.subtract(this.paid_amount);

    if (this.balance_amount.amount === 0) {
      this.status = InvoiceStatus.PAID;
    } else {
      this.status = InvoiceStatus.PENDING;
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

  recalcBalance() {
    this.balance_amount = this.total_amount.subtract(this.paid_amount);
  }

  daysOverdue(today = new Date()) {
    const due = new Date(this.due_date);
    const diffTime = today - due;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  recalculatePayment(totalPaid) {
    const paidMoney = new Money(totalPaid);

    if (paidMoney.isGreaterThan(this.total_amount)) {
      throw new Error("Paid amount cannot exceed total amount");
    }

    this.paid_amount = paidMoney;
    this.balance_amount = this.total_amount.subtract(this.paid_amount);

    if (this.balance_amount.isZero()) {
      this.status = InvoiceStatus.PAID;
    } else {
      this.status = InvoiceStatus.PENDING;
    }
  }

  toJSON() {
    return {
      id: this.id,
      customerId: this.customer_id,
      invoiceNumber: this.invoice_number,
      issueDate: this.issue_date,
      dueDate: this.due_date,
      totalAmount: this.total_amount.toJSON(),
      paidAmount: this.paid_amount.toJSON(),
      balanceAmount: this.balance_amount.toJSON(),
      status: this.status.toJSON(),
      createdBy: this.created_by,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
      items: this.items ? this.items.map(i => i.toJSON ? i.toJSON() : i) : []
    };
  }

}

export default Invoice;
