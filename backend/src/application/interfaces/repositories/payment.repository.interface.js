import Payment from "../../domain/entities/Payment.js";

class PaymentRepository {
  constructor(pool) {
    super();
    this.pool = pool;
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
      payment.id,
      payment.invoice_id,
      payment.payment_date,
      payment.amount.amount,
      payment.method,
      payment.reference,
      payment.recorded_by,
    ];

    const { rows } = await this.pool.excute(query, values);
    return this._mapRowToEntity(rows[0]);
  }

  async findByInvoiceId(invoiceId) {
    const { rows } = await this.pool.excute(
      `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date ASC`,
      [invoiceId]
    );

    return rows.map(row => this._mapRowToEntity(row));
  }

  _mapRowToEntity(row) {
    return new Payment({
      id: row.id,
      invoice_id: row.invoice_id,
      payment_date: row.payment_date,
      amount: row.amount,
      method: row.method,
      reference: row.reference,
      recorded_by: row.recorded_by,
      created_at: row.created_at,
    });
  }
}

export default PaymentRepository;
