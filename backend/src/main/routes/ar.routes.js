import express from "express";
import AutomationController from "../../presentation/controllers/automation.controller.js";
import AgingController from "../../presentation/controllers/aging.controller.js";
import InvoiceRepository from "../../infrastructure/database/repositories/invoice.repository.js";
import CustomerRepository from "../../infrastructure/database/repositories/customer.repository.js";
import EmailLogRepository from "../../infrastructure/database/repositories/emailLog.repository.js";
import SendReminderEmailUseCase from "../../application/use-cases/notification/sendReminderEmail.usecase.js";
import LogHistoryEmailUseCase from "../../application/use-cases/notification/logHistoryEmail.usecase.js";
import GenerateAgingReportUseCase from "../../application/use-cases/report/generateAgingReport.usecase.js";
import NodemailerService from "../../infrastructure/email/nodemailer.service.js";
import { sequelize } from "../config/database.js";
import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";
import initCustomerModel from "../../infrastructure/database/models/customer.model.js";
import initEmailLogModel from "../../infrastructure/database/models/emailLog.model.js";

const router = express.Router();

/* ================== INIT MODELS ================== */
const InvoiceModel = initInvoiceModel(sequelize);
const CustomerModel = initCustomerModel(sequelize);
const EmailLogModel = initEmailLogModel(sequelize);

/* ================== DEPENDENCIES ================== */
const invoiceRepository = new InvoiceRepository({ InvoiceModel });
const customerRepository = new CustomerRepository({ CustomerModel, InvoiceModel });
const emailLogRepository = new EmailLogRepository({ EmailLogModel }); // Assuming it's refactored to Sequelize or uses a similar pattern

const emailService = new NodemailerService({
  // Config should ideally come from env
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================== USE CASES ================== */
const logHistoryEmailUseCase = new LogHistoryEmailUseCase({ emailLogRepository });
const sendReminderEmailUseCase = new SendReminderEmailUseCase({
  invoiceRepository,
  customerRepository,
  emailService,
  logHistoryEmailUseCase
});
const generateAgingReportUseCase = new GenerateAgingReportUseCase({ invoiceRepository });

/* ================== CONTROLLERS ================== */
const automationController = new AutomationController({ sendReminderEmailUseCase });
const agingController = new AgingController({ generateAgingReportUseCase });

/* ================== ROUTES ================== */

// REPORTS
router.get("/reports/aging", agingController.getAgingReport);

// AUTOMATION
router.post("/automation/reminders/run", automationController.runReminders);

export default router;
