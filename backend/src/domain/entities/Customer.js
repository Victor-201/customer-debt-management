export default class Customer {
  constructor({
    id = null,
    name,
    email = null,
    phone = null,
    address = null,
    paymentTerm,
    creditLimit,
    riskLevel = "NORMAL",
    status = "ACTIVE",
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.paymentTerm = paymentTerm;
    this.creditLimit = creditLimit;
    this.riskLevel = riskLevel;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isHighRisk() {
    return this.riskLevel === "HIGH_RISK";
  }

  deactivate() {
    this.status = "INACTIVE";
  }
}
