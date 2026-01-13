class InvoiceStatus {
    static ALLOWED = ["PENDING", "OVERDUE", "PAID"];

    constructor(value) {
    if (!InvoiceStatus.ALLOWED.includes(value)) {
      throw new Error(`Invalid invoice status: ${value}`);
    }
    this.value = value;
  }

  static PENDING = new InvoiceStatus("PENDING");
  static OVERDUE = new InvoiceStatus("OVERDUE");
  static PAID = new InvoiceStatus("PAID");


  static fromString(value) {
    switch (value) {
      case "PENDING":
        return InvoiceStatus.PENDING;
      case "OVERDUE":
        return InvoiceStatus.OVERDUE;
      case "PAID":
        return InvoiceStatus.PAID;
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

  canApplyPayment() {
    return !this.isPaid();
  }

  equals(other) {
    return other instanceof InvoiceStatus && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

export { InvoiceStatus };
