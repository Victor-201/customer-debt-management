import { PaymentTerm } from '../value-objects/PaymentTerm.js';
import { Money } from '../value-objects/Money.js';

const VALID_RISK_LEVELS = ["NORMAL", "WARNING", "HIGH_RISK"];
const VALID_STATUS = ["ACTIVE", "INACTIVE"];

class Customer {
  constructor({
    id,
    name,
    email,
    phone,
    address,
    paymentTerm,
    creditLimit,
    riskLevel,
    status,
    createdAt,
    updatedAt,
  }) {
    this.id = id ?? null;
    this.name = name;
    this.email = email ?? null;
    this.phone = phone ?? null;
    this.address = address ?? null;

    this.paymentTerm =
      paymentTerm instanceof PaymentTerm
        ? paymentTerm
        : PaymentTerm.fromString(paymentTerm ?? "NET_30");

    this.creditLimit =
      creditLimit instanceof Money ? creditLimit : new Money(creditLimit ?? 0);

    this.riskLevel = riskLevel ?? "NORMAL";
    this.status = status ?? "ACTIVE";

    this.createdAt = createdAt ?? null;
    this.updatedAt = updatedAt ?? null;
  }

  static create({ name, email, phone, address, paymentTerm, creditLimit }) {
    const term = PaymentTerm.fromString(paymentTerm ?? "NET_30");
    const money = new Money(creditLimit ?? 0);

    return new Customer({
      name,
      email,
      phone,
      address,
      paymentTerm: term,
      creditLimit: money,
    });
  }

  update({ name, email, phone, address, paymentTerm, creditLimit, riskLevel, status }) {
    if (name !== undefined) this.name = name;
    if (email !== undefined) this.email = email;
    if (phone !== undefined) this.phone = phone;
    if (address !== undefined) this.address = address;

    if (paymentTerm !== undefined)
      this.paymentTerm = PaymentTerm.fromString(paymentTerm);

    if (creditLimit !== undefined) this.creditLimit = new Money(creditLimit);

    if (riskLevel !== undefined) {
      if (!VALID_RISK_LEVELS.includes(riskLevel))
        throw new Error("Invalid risk level");
      this.riskLevel = riskLevel;
    }

    if (status !== undefined) {
      if (!VALID_STATUS.includes(status))
        throw new Error("Invalid customer status");
      this.status = status;
    }
  }

  activate() {
    this.status = "ACTIVE";
  }

  deactivate() {
    this.status = "INACTIVE";
  }

  isActive() {
    return this.status === "ACTIVE";
  }

  canHaveCreditLimit(amount) {
    return this.creditLimit.amount >= amount;
  }

  markHighRisk() {
    this.riskLevel = "HIGH_RISK";
  }
}

export default Customer;
