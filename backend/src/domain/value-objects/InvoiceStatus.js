class InvoiceStatus {
  static ALLOWED = ["PENDING", "OVERDUE", "PAID", "CANCELLED"];

  constructor(value) {
    if (!InvoiceStatus.ALLOWED.includes(value)) {
      throw new Error(`Invalid invoice status: ${value}`);
    }
    this.value = value;
  }

  static PENDING = new InvoiceStatus("PENDING");
  static OVERDUE = new InvoiceStatus("OVERDUE");
  static PAID = new InvoiceStatus("PAID");
  static CANCELLED = new InvoiceStatus("CANCELLED");


  static fromString(value) {
    switch (value) {
      case "PENDING":
        return InvoiceStatus.PENDING;
      case "OVERDUE":
        return InvoiceStatus.OVERDUE;
      case "PAID":
        return InvoiceStatus.PAID;
      case "CANCELLED":
        return InvoiceStatus.CANCELLED;
      default:
        throw new Error(`Invalid invoice status: ${value}`);
    }
  }

  isPending() {
    return this.value === "PENDING";
  }

  isOverdue() {
    return this.value === "OVERDUE";
  }

  isPaid() {
    return this.value === "PAID";
  }

  isCancelled() {
    return this.value === "CANCELLED";
  }

  canApplyPayment() {
    return !this.isPaid() && !this.isCancelled();
  }

  equals(other) {
    return other instanceof InvoiceStatus && this.value === other.value;
  }

  toString() {
    return this.value;
  }

  toJSON() {
    return this.value;
  }
}

export { InvoiceStatus };
