import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import reportRoutes from './report.routes.js';
import customerRoutes from './customer.routes.js';
import invoiceRoutes from './invoice.routes.js';
import paymentRoutes from './payment.routes.js';
import arRoutes from './ar.routes.js';
import emailTemplateRoutes from './emailTemplate.routes.js';
import settingsRoutes from './settings.routes.js';
import emailLogRoutes from './emailLog.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/report', reportRoutes);
router.use('/customers', customerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/ar', arRoutes);
router.use('/email-templates', emailTemplateRoutes);
router.use('/settings', settingsRoutes);
router.use('/email-logs', emailLogRoutes);

export default router;
