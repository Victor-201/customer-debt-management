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
    /* ========= VALIDATION ========= */
    if (!name) throw new Error("Customer.name is required");
    if (!paymentTerm) throw new Error("Customer.paymentTerm is required");
    if (creditLimit === undefined || creditLimit === null) {
      throw new Error("Customer.creditLimit is required");
    }

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

  /* ========= DOMAIN RULES ========= */

  isActive() {
    return this.status === "ACTIVE";
  }

  isInactive() {
    return this.status === "INACTIVE";
  }

  isHighRisk() {
    return this.riskLevel === "HIGH_RISK";
  }

  markHighRisk() {
    this.riskLevel = "HIGH_RISK";
  }

  markNormalRisk() {
    this.riskLevel = "NORMAL";
  }

  deactivate() {
    this.status = "INACTIVE";
  }

  activate() {
    this.status = "ACTIVE";
  }

  /* ========= OUTPUT ========= */

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      paymentTerm: this.paymentTerm,
      creditLimit: this.creditLimit,
      riskLevel: this.riskLevel,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
