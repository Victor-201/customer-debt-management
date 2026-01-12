import { mockInvoices, generateInvoiceId } from '../mocks/mockData.js';
import { INVOICE_STATUS } from '../constants/invoiceStatus.js';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory data store (mutable copy)
let invoices = [...mockInvoices];

/**
 * Invoice API - Mock implementation
 * Will be replaced with real API calls when backend is ready
 */
export const invoiceApi = {
    /**
     * Get all invoices with optional filters
     * @param {Object} filters - Filter options
     * @returns {Promise<{data: Array, total: number}>}
     */
    getAll: async (filters = {}) => {
        await delay(300);

        let result = [...invoices];

        // Filter by status
        if (filters.status && filters.status !== 'ALL') {
            result = result.filter(inv => inv.status === filters.status);
        }

        // Filter by customer
        if (filters.customerId) {
            result = result.filter(inv => inv.customerId === filters.customerId);
        }

        // Search by invoice ID or customer name
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(inv =>
                inv.id.toLowerCase().includes(searchLower) ||
                inv.customerName.toLowerCase().includes(searchLower)
            );
        }

        // Filter by date range
        if (filters.startDate) {
            result = result.filter(inv => new Date(inv.issueDate) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            result = result.filter(inv => new Date(inv.issueDate) <= new Date(filters.endDate));
        }

        // Sort
        const sortField = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        result.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField.includes('Date') || sortField === 'createdAt') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (sortOrder === 'desc') {
                return aVal > bVal ? -1 : 1;
            }
            return aVal > bVal ? 1 : -1;
        });

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
     * Get a single invoice by ID
     * @param {string} id - Invoice ID
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        await delay(200);

        const invoice = invoices.find(inv => inv.id === id);
        if (!invoice) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        return { ...invoice };
    },

    /**
     * Create a new invoice
     * @param {Object} invoiceData - Invoice data
     * @returns {Promise<Object>}
     */
    create: async (invoiceData) => {
        await delay(400);

        const newInvoice = {
            ...invoiceData,
            id: generateInvoiceId(),
            createdAt: new Date().toISOString(),
            status: invoiceData.status || INVOICE_STATUS.DRAFT,
            paidAmount: 0,
            balance: invoiceData.total
        };

        invoices.unshift(newInvoice);

        return { ...newInvoice };
    },

    /**
     * Update an existing invoice
     * @param {string} id - Invoice ID
     * @param {Object} invoiceData - Updated invoice data
     * @returns {Promise<Object>}
     */
    update: async (id, invoiceData) => {
        await delay(400);

        const index = invoices.findIndex(inv => inv.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        // Don't allow editing paid invoices
        if (invoices[index].status === INVOICE_STATUS.PAID) {
            throw new Error('Không thể chỉnh sửa hóa đơn đã thanh toán');
        }

        // Recalculate balance if total changed
        const newBalance = invoiceData.total - invoices[index].paidAmount;

        invoices[index] = {
            ...invoices[index],
            ...invoiceData,
            balance: newBalance,
            updatedAt: new Date().toISOString()
        };

        return { ...invoices[index] };
    },

    /**
     * Delete an invoice
     * @param {string} id - Invoice ID
     * @returns {Promise<{success: boolean}>}
     */
    delete: async (id) => {
        await delay(300);

        const invoice = invoices.find(inv => inv.id === id);
        if (!invoice) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        // Don't allow deleting if there are payments
        if (invoice.paidAmount > 0) {
            throw new Error('Không thể xóa hóa đơn đã có thanh toán');
        }

        invoices = invoices.filter(inv => inv.id !== id);

        return { success: true };
    },

    /**
     * Update invoice status
     * @param {string} id - Invoice ID
     * @param {string} status - New status
     * @returns {Promise<Object>}
     */
    updateStatus: async (id, status) => {
        await delay(200);

        const index = invoices.findIndex(inv => inv.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        invoices[index].status = status;
        invoices[index].updatedAt = new Date().toISOString();

        return { ...invoices[index] };
    },

    /**
     * Send invoice (change status from DRAFT to PENDING)
     * @param {string} id - Invoice ID
     * @returns {Promise<Object>}
     */
    send: async (id) => {
        await delay(300);

        const index = invoices.findIndex(inv => inv.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        if (invoices[index].status !== INVOICE_STATUS.DRAFT) {
            throw new Error('Chỉ có thể gửi hóa đơn ở trạng thái nháp');
        }

        invoices[index].status = INVOICE_STATUS.PENDING;
        invoices[index].updatedAt = new Date().toISOString();

        return { ...invoices[index] };
    },

    /**
     * Cancel an invoice
     * @param {string} id - Invoice ID
     * @returns {Promise<Object>}
     */
    cancel: async (id) => {
        await delay(300);

        const index = invoices.findIndex(inv => inv.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy hóa đơn');
        }

        if (invoices[index].paidAmount > 0) {
            throw new Error('Không thể hủy hóa đơn đã có thanh toán');
        }

        invoices[index].status = INVOICE_STATUS.CANCELLED;
        invoices[index].updatedAt = new Date().toISOString();

        return { ...invoices[index] };
    },

    /**
     * Get invoice with reference to in-memory data (for payment updates)
     * @param {string} id
     * @returns {Object|null}
     */
    _getReference: (id) => {
        return invoices.find(inv => inv.id === id);
    },

    /**
     * Get summary statistics
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        await delay(200);

        const summary = {
            totalInvoices: invoices.length,
            totalAmount: 0,
            totalPaid: 0,
            totalBalance: 0,
            byStatus: {}
        };

        Object.keys(INVOICE_STATUS).forEach(status => {
            summary.byStatus[status] = { count: 0, amount: 0 };
        });

        invoices.forEach(inv => {
            summary.totalAmount += inv.total;
            summary.totalPaid += inv.paidAmount;
            summary.totalBalance += inv.balance;

            if (summary.byStatus[inv.status]) {
                summary.byStatus[inv.status].count += 1;
                summary.byStatus[inv.status].amount += inv.balance;
            }
        });

        return summary;
    }
};

export default invoiceApi;
