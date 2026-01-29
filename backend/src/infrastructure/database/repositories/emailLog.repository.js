import { Op } from "sequelize";
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

  async hasSentToday(invoiceId, emailType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await this.EmailLogModel.findOne({
      where: {
        invoice_id: invoiceId,
        email_type: emailType,
        status: "SUCCESS",
        sent_at: {
          [Op.gte]: today,
        },
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

  async findAll() {
    const logs = await this.EmailLogModel.findAll({
      order: [["sent_at", "DESC"]],
      include: ["Customer", "Invoice"], // Ensuring these associations exist in the model
    });
    return logs.map((log) => log.get({ plain: true }));
  }
}
