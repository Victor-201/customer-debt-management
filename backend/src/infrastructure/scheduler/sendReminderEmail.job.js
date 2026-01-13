import { EmailType } from "../../domain/value-objects/EmailType.js";
import { buildEmailTemplate } from "../email/emailTemplate.factory.js";

export default class SendReminderEmailJob {
  constructor({
    invoiceRepository,
    customerRepository,
    sendReminderEmailUseCase,
  }) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
    this.sendReminderEmailUseCase = sendReminderEmailUseCase;
  }

  async run(today = new Date()) {
    const invoices = await this.invoiceRepository.findUnpaid();

    for (const invoice of invoices) {
      const customer = await this.customerRepository.findById(
        invoice.customerId
      );

      if (!customer?.email) continue;

      const daysOverdue = invoice.daysOverdue(today);
      let emailType = null;

      if (daysOverdue === -3) emailType = EmailType.BEFORE_DUE;
      if (daysOverdue === 1) emailType = EmailType.OVERDUE_1;
      if (daysOverdue === 7) emailType = EmailType.OVERDUE_2;

      if (!emailType) continue;

      const template = buildEmailTemplate(emailType, {
        customer,
        invoice,
      });

      await this.sendReminderEmailUseCase.execute({
        customer,
        invoice,
        emailType,
        template,
      });
    }
  }
}
