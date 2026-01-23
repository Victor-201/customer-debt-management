import { registerCrons } from "../../infrastructure/scheduler/cron.registry.js";
import SendReminderEmailJob from "../../infrastructure/scheduler/sendReminderEmail.job.js";
import SendReminderEmailUseCase from "../../application/use-cases/notification/sendReminderEmail.usecase.js";
import LogHistoryEmailUseCase from "../../application/use-cases/notification/logHistoryEmail.usecase.js";
import InvoiceRepository from "../../infrastructure/database/repositories/invoice.repository.js";
import CustomerRepository from "../../infrastructure/database/repositories/customer.repository.js";
import EmailLogRepository from "../../infrastructure/database/repositories/emailLog.repository.js";
import NodemailerService from "../../infrastructure/email/nodemailer.service.js";
import { sequelize } from "./database.js";
import config from "./env.config.js";

import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";
import initCustomerModel from "../../infrastructure/database/models/customer.model.js";
import initEmailLogModel from "../../infrastructure/database/models/emailLog.model.js";

export function initScheduler() {
    console.log("[SCHEDULER] Initializing automatic reminder system...");

    // 1. Init Models
    const InvoiceModel = initInvoiceModel(sequelize);
    const CustomerModel = initCustomerModel(sequelize);
    const EmailLogModel = initEmailLogModel(sequelize);

    // 2. Init Repositories
    const invoiceRepository = new InvoiceRepository({ InvoiceModel });
    const customerRepository = new CustomerRepository({ CustomerModel, InvoiceModel });
    const emailLogRepository = new EmailLogRepository({ EmailLogModel });

    // 3. Init Services
    const emailService = new NodemailerService({
        host: config.email.host,
        port: config.email.port,
        from: config.email.from,
        auth: {
            user: config.email.user,
            pass: config.email.pass
        }
    });

    // 4. Init Use Cases
    const logHistoryEmailUseCase = new LogHistoryEmailUseCase({ emailLogRepository });
    const sendReminderEmailUseCase = new SendReminderEmailUseCase({
        invoiceRepository,
        customerRepository,
        emailService,
        logHistoryEmailUseCase
    });

    // Init Job
    const sendReminderEmailJob = new SendReminderEmailJob({
        invoiceRepository,
        customerRepository,
        sendReminderEmailUseCase
    });

    // Register Crons
    registerCrons({ sendReminderEmailJob });

    console.log("[SCHEDULER] Automatic reminder system registered.");
}
