const Customer = require('../../domain/entities/Customer');
const { PaymentTerm } = require('../../domain/value-objects/PaymentTerm');
const { Money } = require('../../domain/value-objects/Money');

class CustomerRepository {
  constructor(database) {
    this.database = database;
  }

  async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const rows = await this.database.execute(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new Customer(
      row.id,
      row.name,
      row.email,
      row.phone,
      row.address,
      PaymentTerm.fromString(row.payment_term),
      Money.fromNumber(parseFloat(row.credit_limit)),
      row.risk_level,
      row.status,
      row.created_at,
      row.updated_at
    );
  }

  async findAll() {
    const query = 'SELECT * FROM customers ORDER BY created_at DESC';
    const rows = await this.database.execute(query);
    return rows.map(row => new Customer(
      row.id,
      row.name,
      row.email,
      row.phone,
      row.address,
      PaymentTerm.fromString(row.payment_term),
      Money.fromNumber(parseFloat(row.credit_limit)),
      row.risk_level,
      row.status,
      row.created_at,
      row.updated_at
    ));
  }

  async findActive() {
    const query = 'SELECT * FROM customers WHERE status = $1 ORDER BY name ASC';
    const rows = await this.database.execute(query, ['ACTIVE']);
    return rows.map(row => new Customer(
      row.id,
      row.name,
      row.email,
      row.phone,
      row.address,
      PaymentTerm.fromString(row.payment_term),
      Money.fromNumber(parseFloat(row.credit_limit)),
      row.risk_level,
      row.status,
      row.created_at,
      row.updated_at
    ));
  }

  async create(customer) {
    const query = `
      INSERT INTO customers (name, email, phone, address, payment_term, credit_limit, risk_level, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    const rows = await this.database.execute(query, [
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.paymentTerm.value,
      customer.creditLimit.amount,
      customer.riskLevel,
      customer.status,
      customer.createdAt,
      customer.updatedAt
    ]);
    customer.id = rows[0].id;
    return customer;
  }

  async update(customer) {
    const query = `
      UPDATE customers
      SET name = $1, email = $2, phone = $3, address = $4, payment_term = $5, credit_limit = $6, risk_level = $7, status = $8, updated_at = $9
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
      customer.id
    ]);
    return customer;
  }

  async delete(id) {
    // Check if customer has invoices
    const hasInvoices = await this.hasInvoices(id);
    if (hasInvoices) {
      throw new Error('Cannot delete customer with existing invoices');
    }

    const query = 'DELETE FROM customers WHERE id = $1';
    await this.database.execute(query, [id]);
  }

  async hasInvoices(customerId) {
    const query = 'SELECT COUNT(*) as count FROM invoices WHERE customer_id = $1';
    const rows = await this.database.execute(query, [customerId]);
    return parseInt(rows[0].count) > 0;
  }

  async activate(id) {
    const query = 'UPDATE customers SET status = $1, updated_at = $2 WHERE id = $3';
    await this.database.execute(query, ['ACTIVE', new Date(), id]);
  }

  async deactivate(id) {
    const query = 'UPDATE customers SET status = $1, updated_at = $2 WHERE id = $3';
    await this.database.execute(query, ['INACTIVE', new Date(), id]);
  }

  async updateRiskLevel(id, riskLevel) {
    const query = 'UPDATE customers SET risk_level = $1, updated_at = $2 WHERE id = $3';
    await this.database.execute(query, [riskLevel, new Date(), id]);
  }
}

module.exports = CustomerRepository;
