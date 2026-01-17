import EmailLogRepositoryInterface from "../../../application/interfaces/repositories/emailLog.repository.interface.js";

export default class EmailLogRepository extends EmailLogRepositoryInterface {
  constructor({ EmailLogModel }) {
    super();
    this.EmailLogModel = EmailLogModel;
  }

  async hasSent(invoiceId, emailType) {
    const log = await this.EmailLogModel.findOne({
      where: {
        invoice_id: invoiceId,
        email_type: emailType,
        status: "SUCCESS",
      },
    });
    return !!log;
  }

  async save(log) {
    const payload = {
      customer_id: log.customerId,
      invoice_id: log.invoiceId,
      email_type: log.emailType,
      status: log.status,
      error_message: log.errorMessage,
      sent_at: log.sentAt || new Date(),
    };

    const created = await this.EmailLogModel.create(payload);
    return created.get({ plain: true });
  }
}
