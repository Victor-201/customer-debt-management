import express from 'express';

import PaymentController from '../../presentation/controllers/payment.controller.js';

import InvoiceRepository from '../../infrastructure/database/repositories/invoice.repository.js';
import PaymentRepository from '../../infrastructure/database/repositories/payment.repository.js';

import authMiddleware from '../middlewares/auth.middleware.js';
import permissionMiddleware from '../middlewares/permission.middleware.js';
import validateMiddleware from '../middlewares/validate.middleware.js';

import { PAYMENT_PERMISSIONS } from '../../shared/constants/permissions.js';

import { createPaymentSchema, reversePaymentSchema } from '../../presentation/validators/payment.schema.js';

import { sequelize } from "../config/database.js";

import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";
import initPaymentModel from "../../infrastructure/database/models/payment.model.js";

const router = express.Router();

const InvoiceModel = initInvoiceModel(sequelize);
const PaymentModel = initPaymentModel(sequelize);

const invoiceRepository = new InvoiceRepository({InvoiceModel});
const paymentRepository = new PaymentRepository({PaymentModel});

const paymentController = new PaymentController(paymentRepository, invoiceRepository);

router.use(authMiddleware);

/**
 * GET /payments
 * List all payments with filtering and pagination
 */
router.get(
    "/",
    permissionMiddleware(PAYMENT_PERMISSIONS.READ),
    paymentController.getAllPayments
);

/**
 * GET /payments/recent
 * Get recent payments
 */
router.get(
    "/recent",
    permissionMiddleware(PAYMENT_PERMISSIONS.READ),
    paymentController.getRecentPayments
);

/**
 * GET /payments/summary
 * Get payment statistics
 */
router.get(
    "/summary",
    permissionMiddleware(PAYMENT_PERMISSIONS.READ),
    paymentController.getPaymentSummary
);

router.post(
  "/",
  permissionMiddleware(PAYMENT_PERMISSIONS.CREATE),
  validateMiddleware(createPaymentSchema),
  paymentController.recordPayment
);

router.post(
  "/:paymentId/reverse",
  permissionMiddleware(PAYMENT_PERMISSIONS.REVERSE),
  validateMiddleware(reversePaymentSchema),
  paymentController.reversePayment
);

router.get(
  '/:invoiceId',
  permissionMiddleware(PAYMENT_PERMISSIONS.READ),
  validateMiddleware(reversePaymentSchema),
  paymentController.getPaymentByInvoiceId
)

export default router;