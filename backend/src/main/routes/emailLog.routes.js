import express from "express";
import EmailLogController from "../../presentation/controllers/emailLog.controller.js";
import EmailLogRepository from "../../infrastructure/database/repositories/emailLog.repository.js";
import GetAllEmailLogsUseCase from "../../application/use-cases/email-log/getAllEmailLogs.usecase.js";
import { sequelize } from "../config/database.js";
import initEmailLogModel from "../../infrastructure/database/models/emailLog.model.js";
import initCustomerModel from "../../infrastructure/database/models/customer.model.js";
import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";

const router = express.Router();

const EmailLogModel = initEmailLogModel(sequelize);
const CustomerModel = initCustomerModel(sequelize);
const InvoiceModel = initInvoiceModel(sequelize);

// Associations
EmailLogModel.belongsTo(CustomerModel, { foreignKey: 'customer_id', as: 'Customer' });
EmailLogModel.belongsTo(InvoiceModel, { foreignKey: 'invoice_id', as: 'Invoice' });

const emailLogRepository = new EmailLogRepository({ EmailLogModel });
const getAllEmailLogsUseCase = new GetAllEmailLogsUseCase({ emailLogRepository });
const emailLogController = new EmailLogController({ getAllEmailLogsUseCase });

router.get("/", (req, res, next) => emailLogController.getAllLogs(req, res, next));

export default router;
