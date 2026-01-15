import express from "express";

import InvoiceController from "../../presentation/controllers/invoice.controller.js";

import InvoiceRepository from "../../infrastructure/database/repositories/invoice.repository.js";
import CustomerRepository from "../../infrastructure/database/repositories/customer.repository.js";
import PaymentRepository from "../../infrastructure/database/repositories/payment.repository.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import permissionMiddleware from "../middlewares/permission.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

import { INVOICE_PERMISSIONS } from "../../shared/constants/permissions.js";

import { createInvoiceSchema, updateInvoiceSchema } from "../../presentation/validators/invoice.schema.js";

import { sequelize } from "../config/database.js";

import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";
import initCustomerModel from "../../infrastructure/database/models/customer.model.js";
import initPaymentModel from "../../infrastructure/database/models/payment.model.js";

const router = express.Router();

const InvoiceModel = initInvoiceModel(sequelize);
const CustomerModel = initCustomerModel(sequelize);
const PaymentModel = initPaymentModel(sequelize);

const invoiceRepository = new InvoiceRepository(InvoiceModel);
const customerRepository = new CustomerRepository({CustomerModel, InvoiceModel});
const paymentRepository = new PaymentRepository(PaymentModel);

const invoiceController = new InvoiceController(
  invoiceRepository,
  paymentRepository,
  customerRepository
);


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
//   permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
// validateMiddleware(updateInvoiceSchema),
  invoiceController.updateInvoice
);

/**
 * POST /invoices/:invoiceId/mark-paid
 */
router.post(
  "/:invoiceId/mark-paid",
//   permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
  invoiceController.markInvoicePaid
);

/**
 * POST /invoices/update-overdue
 */
router.post(
  "/update-overdue",
  permissionMiddleware(INVOICE_PERMISSIONS.UPDATE),
  invoiceController.updateOverdueInvoices
);

/**
 * POST /invoices/validate-credit-limit
 */
router.post(
  "/validate-credit-limit",
  permissionMiddleware(INVOICE_PERMISSIONS.CREATE),
  invoiceController.validateCreditLimit
);

export default router;
