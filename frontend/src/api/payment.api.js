import { mockPayments, generatePaymentId } from '../mocks/mockData.js';
import { invoiceApi } from './invoice.api.js';
import { INVOICE_STATUS } from '../constants/invoiceStatus.js';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory data store (mutable copy)
let payments = [...mockPayments];

/**
 * Payment API - Mock implementation
 * Will be replaced with real API calls when backend is ready
 */
export const paymentApi = {
    /**
     * Get all payments with optional filters
     * @param {Object} filters - Filter options
     * @returns {Promise<{data: Array, total: number}>}
     */
    getAll: async (filters = {}) => {
        await delay(300);

        let result = [...payments];

        // Filter by invoice
        if (filters.invoiceId) {
            result = result.filter(pay => pay.invoiceId === filters.invoiceId);
        }

        // Filter by customer
        if (filters.customerName) {
            const searchLower = filters.customerName.toLowerCase();
            result = result.filter(pay =>
                pay.customerName.toLowerCase().includes(searchLower)
            );
        }

        // Filter by payment method
        if (filters.paymentMethod) {
            result = result.filter(pay => pay.paymentMethod === filters.paymentMethod);
        }

        // Filter by date range
        if (filters.startDate) {
            result = result.filter(pay => new Date(pay.paymentDate) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            result = result.filter(pay => new Date(pay.paymentDate) <= new Date(filters.endDate));
        }

        // Search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(pay =>
                pay.id.toLowerCase().includes(searchLower) ||
                pay.invoiceId.toLowerCase().includes(searchLower) ||
                pay.customerName.toLowerCase().includes(searchLower) ||
                (pay.reference && pay.reference.toLowerCase().includes(searchLower))
            );
        }

        // Sort by date (newest first by default)
        result.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const total = result.length;
        const startIndex = (page - 1) * limit;
        const paginatedResult = result.slice(startIndex, startIndex + limit);

        return {
            data: paginatedResult,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    },

    /**
     * Get payments for a specific invoice
     * @param {string} invoiceId - Invoice ID
     * @returns {Promise<Array>}
     */
    getByInvoiceId: async (invoiceId) => {
        await delay(200);

        return payments
            .filter(pay => pay.invoiceId === invoiceId)
            .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    },

    /**
     * Get a single payment by ID
     * @param {string} id - Payment ID
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        await delay(200);

        const payment = payments.find(pay => pay.id === id);
        if (!payment) {
            throw new Error('Không tìm thấy phiếu thu');
        }

        return { ...payment };
    },

    /**
     * Create a new payment (record payment for invoice)
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>}
     */
    create: async (paymentData) => {
        await delay(400);

        // Get the invoice
        const invoice = invoiceApi._getReference(paymentData.invoiceId);
        if (!invoice) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        // Validate amount
        if (paymentData.amount <= 0) {
            throw new Error('Số tiền thanh toán phải lớn hơn 0');
        }

        if (paymentData.amount > invoice.balance) {
            throw new Error('Số tiền thanh toán không được lớn hơn số dư còn lại');
        }

        // Create payment
        const newPayment = {
            id: generatePaymentId(),
            invoiceId: paymentData.invoiceId,
            invoiceNumber: invoice.id,
            customerName: invoice.customerName,
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            paymentDate: paymentData.paymentDate,
            reference: paymentData.reference || '',
            note: paymentData.note || '',
            createdBy: 'admin@company.com', // Mock user
            createdAt: new Date().toISOString()
        };

        payments.unshift(newPayment);

        // Update invoice
        invoice.paidAmount += paymentData.amount;
        invoice.balance = invoice.total - invoice.paidAmount;
        invoice.updatedAt = new Date().toISOString();

        // Update invoice status
        if (invoice.balance <= 0) {
            invoice.status = INVOICE_STATUS.PAID;
            invoice.balance = 0; // Ensure no negative balance
        } else if (invoice.paidAmount > 0 && invoice.status !== INVOICE_STATUS.OVERDUE) {
            invoice.status = INVOICE_STATUS.PARTIAL;
        }

        return {
            payment: { ...newPayment },
            invoice: { ...invoice }
        };
    },

    /**
     * Delete a payment (reverse the payment)
     * @param {string} id - Payment ID
     * @returns {Promise<{success: boolean}>}
     */
    delete: async (id) => {
        await delay(300);

        const payment = payments.find(pay => pay.id === id);
        if (!payment) {
            throw new Error('Không tìm thấy phiếu thu');
        }

        // Get the invoice and reverse the payment
        const invoice = invoiceApi._getReference(payment.invoiceId);
        if (invoice) {
            invoice.paidAmount -= payment.amount;
            invoice.balance = invoice.total - invoice.paidAmount;

            // Update status
            if (invoice.paidAmount === 0) {
                // Check if overdue
                const today = new Date();
                const dueDate = new Date(invoice.dueDate);
                invoice.status = today > dueDate ? INVOICE_STATUS.OVERDUE : INVOICE_STATUS.PENDING;
            } else {
                invoice.status = INVOICE_STATUS.PARTIAL;
            }

            invoice.updatedAt = new Date().toISOString();
        }

        // Remove payment
        payments = payments.filter(pay => pay.id !== id);

        return {
            success: true,
            invoice: invoice ? { ...invoice } : null
        };
    },

    /**
     * Get payment summary statistics
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        await delay(200);

        const summary = {
            totalPayments: payments.length,
            totalAmount: 0,
            byMethod: {}
        };

        payments.forEach(pay => {
            summary.totalAmount += pay.amount;

            if (!summary.byMethod[pay.paymentMethod]) {
                summary.byMethod[pay.paymentMethod] = { count: 0, amount: 0 };
            }
            summary.byMethod[pay.paymentMethod].count += 1;
            summary.byMethod[pay.paymentMethod].amount += pay.amount;
        });

        return summary;
    },

    /**
     * Get recent payments
     * @param {number} limit - Number of payments to return
     * @returns {Promise<Array>}
     */
    getRecent: async (limit = 5) => {
        await delay(200);

        return payments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
};

export default paymentApi;
