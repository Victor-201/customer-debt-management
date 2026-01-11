class Money {
  constructor(amount, currency = "VND") {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    this.amount = amount;
    this.currency = currency;
  }

  static fromNumber(amount, currency = "VND") {
    return new Money(amount, currency);
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    if (this.amount < other.amount) {
      throw new Error("Cannot subtract more than available amount");
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }

  isGreaterThan(other) {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount > other.amount;
  }

  isLessThan(other) {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount < other.amount;
  }

  equals(other) {
    return (
      this.currency === other.currency &&
      this.amount === other.amount
    );
  }

  toString() {
    return `${this.amount} ${this.currency}`;
  }
}

export { Money };
