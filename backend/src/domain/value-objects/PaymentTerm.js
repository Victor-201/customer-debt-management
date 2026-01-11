class PaymentTerm {
  constructor(value, description) {
    this.value = value; 
    this.description = description; 
  }

  static NET_7 = new PaymentTerm("NET_7", "Net 7 days");
  static NET_15 = new PaymentTerm("NET_15", "Net 15 days");
  static NET_30 = new PaymentTerm("NET_30", "Net 30 days");

  static fromString(value) {
    switch (value) {
      case "NET_7":
        return PaymentTerm.NET_7;
      case "NET_15":
        return PaymentTerm.NET_15;
      case "NET_30":
        return PaymentTerm.NET_30;
      default:
        throw new Error(`Invalid payment term: ${value}`);
    }
  }

  toString() {
    return this.value;
  }

  equals(other) {
    return other instanceof PaymentTerm && this.value === other.value;
  }
}

export { PaymentTerm };
