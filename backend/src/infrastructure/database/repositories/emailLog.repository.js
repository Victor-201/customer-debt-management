export default class EmailLogRepository {
  constructor(database) {
    this.database = database;
  }

  async hasSent(invoiceId, emailType) {
    const query = `
      SELECT 1
      FROM email_logs
      WHERE invoice_id = $1 AND email_type = $2 AND status = 'SUCCESS'
      LIMIT 1
    `;
    const rows = await this.database.execute(query, [invoiceId, emailType]);
    return rows.length > 0;
  }

  async save(log) {
    const query = `
      INSERT INTO email_logs (
        customer_id,
        invoice_id,
        email_type,
        status,
        error_message
      )
      VALUES ($1,$2,$3,$4,$5)
    `;
    await this.database.execute(query, [
      log.customerId,
      log.invoiceId,
      log.emailType,
      log.status,
      log.errorMessage,
    ]);
  }
}
