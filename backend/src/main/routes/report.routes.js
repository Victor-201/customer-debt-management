import express from "express";
import ReportController from "../../presentation/controllers/report.controller.js";
import InvoiceRepository from "../../application/interfaces/repositories/invoice.repository.interface.js";
import CustomerRepository from "../../application/interfaces/repositories/customer.repository.interface.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { execute } from "../../main/config/database.js";

const router = express.Router();

const invoiceRepository = new InvoiceRepository({ execute });
const customerRepository = new CustomerRepository({ execute });
const reportController = new ReportController(invoiceRepository, customerRepository);

router.use(authMiddleware);

router.get("/aging", reportController.getAgingReport);
router.get("/high-risk-customers", reportController.getHighRiskCustomers);
router.get("/overdue-report", reportController.getOverdueReport);
router.get("/total-ar", reportController.getTotalARReport);

export default router;
