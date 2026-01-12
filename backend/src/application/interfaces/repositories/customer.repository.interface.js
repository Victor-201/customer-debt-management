import Customer from "../../../domain/entities/Customer.js";

export default class CustomerRepository {
  constructor(database) {
    this.database = database;
  }

  async findById(id) {
    const query = "SELECT * FROM customers WHERE id = $1";
    const rows = await this.database.execute(query, [id]);

    if (!rows || rows.length === 0) return null;

    return this.#mapRowToCustomer(rows[0]);
  }

  async findAll() {
    const query = "SELECT * FROM customers ORDER BY created_at DESC";
    const rows = await this.database.execute(query);

    return rows.map(row => this.#mapRowToCustomer(row));
  }

  async findActive() {
    const query = `
      SELECT *
      FROM customers
      WHERE status = $1
      ORDER BY name ASC
    `;
    const rows = await this.database.execute(query, ["ACTIVE"]);

    return rows.map(row => this.#mapRowToCustomer(row));
  }

  async create(customer) {
    const query = `
      INSERT INTO customers (
        name,
        email,
        phone,
        address,
        payment_term,
        credit_limit,
        risk_level,
        status,
        created_at,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const [result] = await this.database.execute(query, [
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.paymentTerm.value,
      customer.creditLimit.amount,
      customer.riskLevel,
      customer.status,
      customer.createdAt,
      customer.updatedAt,
    ]);

    customer.id = result.id;
    return customer;
  }

  async update(customer) {
    const query = `
      UPDATE customers
      SET
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        payment_term = $5,
        credit_limit = $6,
        risk_level = $7,
        status = $8,
        updated_at = $9
      WHERE id = $10
    `;

    await this.database.execute(query, [
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.paymentTerm.value,
      customer.creditLimit.amount,
      customer.riskLevel,
      customer.status,
      customer.updatedAt,
      customer.id,
    ]);

    return customer;
  }

  async delete(id) {
    if (await this.hasInvoices(id)) {
      throw new Error("Cannot delete customer with existing invoices");
    }

    const query = "DELETE FROM customers WHERE id = $1";
    await this.database.execute(query, [id]);
  }

  async updateRiskLevel(id, riskLevel) {
    const query = `
      UPDATE customers
      SET risk_level = $1, updated_at = $2
      WHERE id = $3
    `;
    await this.database.execute(query, [riskLevel, new Date(), id]);
  }

  async hasInvoices(customerId) {
    const query = `
      SELECT COUNT(*)::int AS count
      FROM invoices
      WHERE customer_id = $1
    `;
    const [result] = await this.database.execute(query, [customerId]);

    return result.count > 0;
  }

  #mapRowToCustomer(row) {
    return new Customer({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      paymentTerm: row.payment_term,  
      creditLimit: Number(row.credit_limit),
      riskLevel: row.risk_level,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
