import CustomerRepositoryInterface from "../../../application/interfaces/repositories/customer.repository.interface.js";
import Customer from "../../../domain/entities/Customer.js";

export default class CustomerRepository extends CustomerRepositoryInterface {
  constructor(CustomerModel, InvoiceModel) {
    super();
    this.CustomerModel = CustomerModel;
    this.InvoiceModel = InvoiceModel;
  }

  async findById(id) {
    const record = await this.CustomerModel.findByPk(id);
    return record ? this.toEntity(record) : null;
  }

  async findAll() {
    const records = await this.CustomerModel.findAll({
      order: [["created_at", "DESC"]],
    });
    return records.map(r => this.toEntity(r));
  }

  async findActive() {
    const records = await this.CustomerModel.findAll({
      where: { status: "ACTIVE" },
      order: [["name", "ASC"]],
    });
    return records.map(r => this.toEntity(r));
  }

  async create(customer) {
    const record = await this.CustomerModel.create({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      paymentTerm: customer.paymentTerm.value,
      creditLimit: customer.creditLimit.amount,
      riskLevel: customer.riskLevel,
      status: customer.status,
    });

    customer.id = record.id;
    return customer;
  }

  async update(customer) {
    await this.CustomerModel.update(
      {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        paymentTerm: customer.paymentTerm.value,
        creditLimit: customer.creditLimit.amount,
        riskLevel: customer.riskLevel,
        status: customer.status,
        updated_at: customer.updatedAt,
      },
      {
        where: { id: customer.id },
      }
    );

    return customer;
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
        riskLevel,
        updated_at: new Date(),
      },
      {
        where: { id },
      }
    );
  }

  async findHighRiskCustomers() {
    const records = await this.CustomerModel.findAll({
      where: { riskLevel: "HIGH_RISK" },
      order: [["name", "ASC"]],
    });

    return records.map(r => this.toEntity(r));
  }

  async hasInvoices(customerId) {
    const count = await this.InvoiceModel.count({
      where: { customerId },
    });

    return count > 0;
  }

  toEntity(record) {
    return new Customer({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      address: record.address,
      paymentTerm: record.paymentTerm,
      creditLimit: Number(record.creditLimit),
      riskLevel: record.riskLevel,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }
}
