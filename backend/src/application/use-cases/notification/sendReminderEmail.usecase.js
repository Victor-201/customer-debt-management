import { EmailType } from "../../../domain/value-objects/EmailType.js";
import { buildEmailTemplate } from "../../../infrastructure/email/emailTemplate.factory.js";

class SendReminderEmailUseCase {
    constructor({
        invoiceRepository,
        customerRepository,
        emailService,
        logHistoryEmailUseCase,
        emailLogRepository,
    }) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.emailService = emailService;
        this.logHistoryEmailUseCase = logHistoryEmailUseCase;
        this.emailLogRepository = emailLogRepository;
    }

    async execute({ today = new Date() } = {}) {
        // 1. Get all unpaid invoices
        const invoices = await this.invoiceRepository.findUnpaid();
        const results = [];

        for (const invoice of invoices) {
            // 2. Get customer info
            const customer = await this.customerRepository.findById(invoice.customer_id);
            if (!customer || !customer.email) continue;

            // 3. Determine if reminder is needed based on days overdue
            // Note: daysOverdue() should return:
            // - Negative if not yet due (e.g. -3 for "3 days before due")
            // - Positive if overdue (e.g. 1 for "1 day after due")
            const daysOverdue = invoice.daysOverdue(today);
            let emailType = null;

            if (daysOverdue === -3) {
                emailType = EmailType.BEFORE_DUE;
            } else if (daysOverdue === 1) {
                emailType = EmailType.OVERDUE_1;
            } else if (daysOverdue > 1) {
                const riskLevel = customer.riskLevel;
                let interval = 3; // Default for NORMAL and HIGH_RISK

                if (riskLevel === "WARNING") {
                    interval = 2;
                }
                if (riskLevel === "HIGH_RISK") {
                    interval = 1;
                }

                if ((daysOverdue - 1) % interval === 0) {
                    emailType = EmailType.OVERDUE_2;
                }
            }

            if (!emailType) continue;

            // 3.5 Check if already sent today
            const alreadySent = await this.emailLogRepository.hasSentToday(invoice.id, emailType);
            if (alreadySent) continue;

            // 4. Build and send email
            const template = await buildEmailTemplate(emailType, { customer, invoice });

            let status = "SUCCESS";
            let errorMessage = null;

            try {
                await this.emailService.send({
                    to: customer.email,
                    subject: template.subject,
                    html: template.html,
                });
            } catch (error) {
                status = "FAILED";
                errorMessage = error.message;
            }

            // 5. Log the history
            await this.logHistoryEmailUseCase.execute({
                customerId: customer.id,
                invoiceId: invoice.id,
                emailType,
                status,
                errorMessage,
            });

            results.push({
                invoiceId: invoice.id,
                customerEmail: customer.email,
                emailType,
                status,
            });
        }

        return results;
    }
}

export default SendReminderEmailUseCase;
