import express from "express";

import ReportController from "../../presentation/controllers/report.controller.js";
import InvoiceRepository from "../../infrastructure/database/repositories/invoice.repository.js";
import CustomerRepository from "../../infrastructure/database/repositories/customer.repository.js";

import GenerateAgingReportUseCase from "../../application/use-cases/report/generateAgingReport.usecase.js";
import GetHighRiskCustomersUseCase from "../../application/use-cases/report/getHighRiskCustomers.usecase.js";
import GetOverdueArUseCase from "../../application/use-cases/report/getOverdueAR.usecase.js";
import GetTotalARUseCase from "../../application/use-cases/report/getTotalAR.usecase.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { sequelize } from "../config/database.js";

import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";
import initCustomerModel from "../../infrastructure/database/models/customer.model.js";

const router = express.Router();

/* ===== INIT ORM ===== */
const InvoiceModel = initInvoiceModel(sequelize);
const CustomerModel = initCustomerModel(sequelize);

/* ===== DEPENDENCIES ===== */
const invoiceRepository = new InvoiceRepository({ InvoiceModel });
const customerRepository = new CustomerRepository({ CustomerModel, InvoiceModel });

/* ===== USE CASES ===== */
const controller = new ReportController({
    generateAgingReportUseCase: new GenerateAgingReportUseCase({ invoiceRepository }),
    getHighRiskCustomersUseCase: new GetHighRiskCustomersUseCase({ customerRepository }),
    getOverdueArUseCase: new GetOverdueArUseCase({ invoiceRepository }),
    getTotalARUseCase: new GetTotalARUseCase({ invoiceRepository }),
});

/* ===== ROUTES ===== */
router.use(authMiddleware);

router.get("/aging", controller.getAgingReport);
router.get("/high-risk-customers", controller.getHighRiskCustomers);
router.get("/overdue-report", controller.getOverdueReport);
router.get("/total-ar", controller.getTotalARReport);

export default router;
