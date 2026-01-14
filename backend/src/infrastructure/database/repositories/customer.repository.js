import { Op } from "sequelize";
import Customer from "../../../domain/entities/Customer.js";
import CustomerRepositoryInterface from "../../../application/interfaces/repositories/customer.repository.interface.js";

export default class CustomerRepository extends CustomerRepositoryInterface {
  constructor({ CustomerModel, InvoiceModel }) {
    super();
    this.CustomerModel = CustomerModel;
    this.InvoiceModel = InvoiceModel;
  }

  async findById(id) {
    const row = await this.CustomerModel.findOne({
      where: { id },
    });

    return row ? this.#toDomain(row) : null;
  }

  async findAll() {
    const rows = await this.CustomerModel.findAll({
      order: [["created_at", "DESC"]],
    });

    return rows.map(row => this.#toDomain(row));
  }

  async findActive() {
    const rows = await this.CustomerModel.findAll({
      where: { status: "ACTIVE" },
      order: [["name", "ASC"]],
    });

    return rows.map(row => this.#toDomain(row));
  }

  async create(customer) {
    const row = await this.CustomerModel.create({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      payment_term: customer.paymentTerm,
      credit_limit: customer.creditLimit,
      risk_level: customer.riskLevel,
      status: customer.status,
    });

    return this.#toDomain(row);
  }

  async update(customer) {
    await this.CustomerModel.update(
      {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        payment_term: customer.paymentTerm,
        credit_limit: customer.creditLimit,
        risk_level: customer.riskLevel,
        status: customer.status,
        updated_at: new Date(),
      },
      {
        where: { id: customer.id },
      }
    );

    return this.findById(customer.id);
  }

  async delete(id) {
    if (await this.hasInvoices(id)) {
      throw new Error("Cannot delete customer with invoices");
    }

    await this.CustomerModel.destroy({ where: { id } });
  }

  async updateRiskLevel(id, riskLevel) {
    await this.CustomerModel.update(
      {
        risk_level: riskLevel,
        updated_at: new Date(),
      },
      {
        where: { id },
      }
    );

    return this.findById(id);
  }

  async findHighRiskCustomers() {
    const rows = await this.CustomerModel.findAll({
      where: { risk_level: "HIGH_RISK" },
      order: [["name", "ASC"]],
    });

    return rows.map(row => this.#toDomain(row));
  }

  async hasInvoices(customerId) {
    const count = await this.InvoiceModel.count({
      where: { customer_id: customerId },
    });

    return count > 0;
  }

  #toDomain(row) {
    return new Customer({
      id: row.get("id"),
      name: row.get("name"),
      email: row.get("email"),
      phone: row.get("phone"),
      address: row.get("address"),
      paymentTerm: row.get("payment_term"),
      creditLimit: Number(row.get("credit_limit")),
      riskLevel: row.get("risk_level"),
      status: row.get("status"),
      createdAt: row.get("created_at"),
      updatedAt: row.get("updated_at"),
    });
  }
}
