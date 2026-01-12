import { PaymentTerm } from "../value-objects/PaymentTerm.js";
import { Money } from "../value-objects/Money.js";

const RISK_LEVELS = ["NORMAL", "WARNING", "HIGH_RISK"];
const STATUS = ["ACTIVE", "INACTIVE"];

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
    if (!name) throw new Error("Customer name is required");

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

    this.riskLevel = RISK_LEVELS.includes(riskLevel) ? riskLevel : "NORMAL";

    this.status = STATUS.includes(status) ? status : "ACTIVE";

    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static create(data) {
    return new Customer(data);
  }

  update(data) {
    const { name, email, phone, address, paymentTerm, creditLimit } = data;

    if (name !== undefined) this.name = name;
    if (email !== undefined) this.email = email;
    if (phone !== undefined) this.phone = phone;
    if (address !== undefined) this.address = address;

    if (paymentTerm !== undefined) {
      this.paymentTerm = paymentTerm;
    }

    if (creditLimit !== undefined) {
      this.creditLimit = creditLimit;
    }

    this.updatedAt = new Date();
  }

  activate() {
    this.status = "ACTIVE";
    this.updatedAt = new Date();
  }

  deactivate() {
    this.status = "INACTIVE";
    this.updatedAt = new Date();
  }

  isActive() {
    return this.status === "ACTIVE";
  }

  setRiskLevel(level) {
    if (!RISK_LEVELS.includes(level)) {
      throw new Error("Invalid risk level");
    }
    this.riskLevel = level;
    this.updatedAt = new Date();
  }

  markWarning() {
    this.setRiskLevel("WARNING");
  }

  markHighRisk() {
    this.setRiskLevel("HIGH_RISK");
  }

  markNormalRisk() {
    this.setRiskLevel("NORMAL");
  }

  canUseCredit(amount) {
    return this.creditLimit.amount >= amount;
  }
}

export default Customer;
