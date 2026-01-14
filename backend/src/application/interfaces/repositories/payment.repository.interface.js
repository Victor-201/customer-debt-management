import Payment from "../../../domain/entities/Payment.js";

class PaymentRepository {
  constructor({ execute }) {
    this.execute = execute;
  }

  async save(payment) {
    const query = `
      INSERT INTO payments (
        id, invoice_id, payment_date, amount,
        method, reference, recorded_by
      )
      VALUES (
        COALESCE($1, gen_random_uuid()),
        $2, $3, $4,
        $5, $6, $7
      )
      RETURNING *;
    `;

    const values = [
      payment.id ?? null,
      payment.invoice_id,
      payment.payment_date,
      payment.amount.amount,
      payment.method,
      payment.reference,
      payment.recorded_by,
    ];

    const rows = await this.execute(query, values);
    return rows?.[0] ? this._mapRowToEntity(rows[0]) : null;
  }

  async findByInvoiceId(invoiceId) {
    const rows = await this.execute(
      `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date ASC`,
      [invoiceId]
    );

    return (rows ?? []).map(row => this._mapRowToEntity(row));
  }

  async findById(id) {
    const rows = await this.execute(
      `SELECT * FROM payments WHERE id = $1`,
      [id]
    );
    return rows?.[0] ? this._mapRowToEntity(rows[0]) : null;
  }

  async findAllByInvoiceId(invoice_id) {
    let query = `
      SELECT *
      FROM payments
      WHERE invoice_id = $1
      ORDER BY payment_date ASC, created_at ASC
    `;

    const values = [invoice_id];

    const rows = await this.execute(query, values);
    return rows.map(row => this._mapRowToEntity(row));
  }

  async sumByInvoiceId(invoiceId) {
    const query = `
      SELECT COALESCE(
        SUM(
          CASE
            WHEN type = 'REVERSAL' THEN -amount
            ELSE amount
          END
        ), 0
      ) AS total_paid
      FROM payments
      WHERE invoice_id = $1;
    `;

    const values = [invoiceId];
    const result = await this.execute(query, values);

    return Number(result.rows[0].total_paid);
  }

  _mapRowToEntity(row) {
    return new Payment({
      id: row.id,
      invoice_id: row.invoice_id,
      payment_date: new Date(row.payment_date),
      amount: row.amount,
      method: row.method,
      reference: row.reference,
      recorded_by: row.recorded_by,
      created_at: row.created_at,
    });
  }
}

export default PaymentRepository;
