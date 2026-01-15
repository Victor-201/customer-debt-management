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
    createdAt,
    updatedAt = null,
  }) {
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

  static create({ name, email, phone, address, paymentTerm, creditLimit }) {
    return new Customer({
      name,
      email,
      phone,
      address,
      paymentTerm,
      creditLimit,
      riskLevel: "NORMAL",
      status: "ACTIVE",
      createdAt: new Date(),
    });
  }

  static restore(persistedData) {
    return new Customer(persistedData);
  }

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
    this.updatedAt = new Date();
  }

  markNormalRisk() {
    this.riskLevel = "NORMAL";
    this.updatedAt = new Date();
  }

  deactivate() {
    this.status = "INACTIVE";
    this.updatedAt = new Date();
  }

  activate() {
    this.status = "ACTIVE";
    this.updatedAt = new Date();
  }

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
