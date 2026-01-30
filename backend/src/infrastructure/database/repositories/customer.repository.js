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

  async findAll({
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "DESC",
    filters = {},
  }) {
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.max(parseInt(limit) || 10, 1);

    const offset = (page - 1) * limit;

    /* ===== WHERE (FILTER) ===== */
    const where = {};

    if (filters.paymentTerm) {
      where.payment_term = filters.paymentTerm;
    }

    if (filters.riskLevel) {
      where.risk_level = filters.riskLevel;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    /* ===== ORDER (SORT) ===== */
    const order = [];

    switch (sortBy) {
      case "creditLimit":
        order.push(["credit_limit", sortOrder]);
        break;

      case "email":
        order.push(["email", sortOrder]);
        break;

      case "createdAt":
      default:
        order.push(["created_at", sortOrder]);
        break;
    }

    const { rows, count } = await this.CustomerModel.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    return {
      data: rows.map((row) => this.#toDomain(row)),
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
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
      },
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
      },
    );

    return this.findById(id);
  }

  async findHighRiskCustomers() {
    const customers = await this.CustomerModel.findAll({
      where: {
        risk_level: {
          [Op.in]: ["HIGH_RISK", "WARNING"],
        },
      },
      attributes: {
        include: [
          [
            this.CustomerModel.sequelize.fn(
              "COALESCE",
              this.CustomerModel.sequelize.fn(
                "SUM",
                this.CustomerModel.sequelize.literal(
                  `"Invoices"."total_amount" - "Invoices"."paid_amount"`,
                ),
              ),
              0,
            ),
            "total_debt",
          ],
          [
            this.CustomerModel.sequelize.fn(
              "COALESCE",
              this.CustomerModel.sequelize.fn(
                "MAX",
                this.CustomerModel.sequelize.literal(
                  `EXTRACT(DAY FROM (NOW() - "Invoices"."due_date"))`,
                ),
              ),
              0,
            ),
            "oldest_overdue_days",
          ],
        ],
      },
      include: [
        {
          model: this.InvoiceModel,
          as: "Invoices",
          attributes: [],
          required: false,
          where: {
            status: {
              [Op.in]: ["PENDING", "OVERDUE"],
            },
            due_date: {
              [Op.lt]: new Date(),
            },
          },
        },
      ],
      group: [
        "Customer.id",
        "Customer.name",
        "Customer.email",
        "Customer.phone",
        "Customer.address",
        "Customer.payment_term",
        "Customer.credit_limit",
        "Customer.risk_level",
        "Customer.status",
        "Customer.created_at",
        "Customer.updated_at",
      ],
      order: [
        [this.CustomerModel.sequelize.literal("total_debt"), "DESC"],
        [this.CustomerModel.sequelize.literal("oldest_overdue_days"), "DESC"],
      ],
      subQuery: false,
    });

    return customers.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      paymentTerm: row.payment_term,
      creditLimit: Number(row.credit_limit) || 0,
      riskLevel: row.risk_level,
      status: row.status,
      totalDebt: Number(row.get("total_debt")) || 0,
      oldestOverdueDays: Math.max(
        0,
        Math.floor(Number(row.get("oldest_overdue_days")) || 0),
      ),
    }));
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
