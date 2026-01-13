import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import customerRoutes from './customer.routes.js';
import invoiceRoutes from './invoice.routes.js';
import reportRoutes from './report.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);

export default router;
