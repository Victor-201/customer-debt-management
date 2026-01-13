import express from "express";
import InvoiceController from "../../presentation/controllers/invoice.controller.js";
import InvoiceRepository from "../../application/interfaces/repositories/invoice.repository.interface.js";
import CustomerRepository from "../../application/interfaces/repositories/customer.repository.interface.js"; // nếu validateCreditLimit cần
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionMiddleware from "../middlewares/permission.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";
import {
    INVOICE_PERMISSIONS,
    DASHBOARD_PERMISSIONS,
    RISK_PERMISSIONS,
} from "../../shared/constants/permissions.js";
import { execute } from "../../main/config/database.js";
import {
    createInvoiceSchema,
    updateInvoiceSchema,
    updateInvoiceStatusSchema,
} from "../../presentation/validators/invoice.schema.js";

const router = express.Router();

// DI repositories
const invoiceRepository = new InvoiceRepository({ execute });
const customerRepository = new CustomerRepository({ execute }); // nếu bạn chưa có thì bỏ dòng này và sửa controller constructor

// DI controller
const invoiceController = new InvoiceController(invoiceRepository, customerRepository);

router.use(authMiddleware);

/**
 * POST /invoices
 */
router.post(
    "/",
    permissionMiddleware(INVOICE_PERMISSIONS.CREATE),
    validateMiddleware(createInvoiceSchema),
    invoiceController.createInvoice
);

/**
 * PATCH /invoices/:invoiceId
 */
router.patch(
    "/:invoiceId",
    permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
    validateMiddleware(updateInvoiceSchema),
    invoiceController.updateInvoice
);
/**
 * POST /invoices/:invoiceId/mark-paid
 * (nếu bạn có markInvoicePaid.usecase)
 */
router.post(
    "/:invoiceId/mark-paid",
    permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
    invoiceController.markInvoicePaid
);

/**
 * POST /invoices/:invoiceId/recalc-balance
 * (nếu bạn có recalcInvoiceBalance.usecase)
 */
router.post(
    "/:invoiceId/recalc-balance",
    permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
    invoiceController.recalcInvoiceBalance
);

/**
 * POST /invoices/update-overdue
 * (job/manual trigger)
 */
router.post(
    "/update-overdue",
    permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
    invoiceController.updateOverdueInvoices
);

/**
 * POST /invoices/validate-credit-limit
 * UI check trước khi tạo/update invoice
 */
router.post(
    "/validate-credit-limit",
    permissionMiddleware(INVOICE_PERMISSIONS.CREATE),
    invoiceController.validateCreditLimit
);

export default router;
