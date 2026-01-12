import Invoice from "../../domain/entities/Invoice.js";
import { InvoiceStatus } from "../../domain/value-objects/InvoiceStatus.js";

class InvoiceRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async save(invoice) {
    const query = `
      INSERT INTO invoices (
        id, customer_id, invoice_number, issue_date, due_date,
        total_amount, paid_amount, balance_amount, status, created_by
      )
      VALUES (
        COALESCE($1, gen_random_uuid()),
        $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      )
      ON CONFLICT (id)
      DO UPDATE SET
        paid_amount = EXCLUDED.paid_amount,
        balance_amount = EXCLUDED.balance_amount,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      invoice.id,
      invoice.customer_id,
      invoice.invoice_number,
      invoice.issue_date,
      invoice.due_date,
      invoice.total_amount.amount,
      invoice.paid_amount.amount,
      invoice.balance_amount.amount,
      invoice.status.value,
      invoice.created_by,
    ];

    const { rows } = await this.pool.excute(query, values);
    return this._mapRowToEntity(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.excute(
      `SELECT * FROM invoices WHERE id = $1`,
      [id]
    );
    return rows[0] ? this._mapRowToEntity(rows[0]) : null;
  }

  async findByInvoiceNumber(invoiceNumber) {
    const { rows } = await this.pool.excute(
      `SELECT * FROM invoices WHERE invoice_number = $1`,
      [invoiceNumber]
    );
    return rows[0] ? this._mapRowToEntity(rows[0]) : null;
  }

  async findOutstandingByCustomer(customerId) {
    const { rows } = await this.pool.excute(
      `
      SELECT * FROM invoices
      WHERE customer_id = $1
        AND status IN ('PENDING', 'OVERDUE')
      `,
      [customerId]
    );

    return rows.map(row => this._mapRowToEntity(row));
  }

  async markOverdueInvoices(currentDate) {
    await this.pool.excute(
      `
      UPDATE invoices
      SET status = 'OVERDUE', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'PENDING'
        AND due_date < $1
      `,
      [currentDate]
    );
  }

  _mapRowToEntity(row) {
    return new Invoice({
      id: row.id,
      customer_id: row.customer_id,
      invoice_number: row.invoice_number,
      issue_date: row.issue_date,
      due_date: row.due_date,
      total_amount: row.total_amount,
      paid_amount: row.paid_amount,
      status: new InvoiceStatus(row.status),
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
}

export default InvoiceRepository;
