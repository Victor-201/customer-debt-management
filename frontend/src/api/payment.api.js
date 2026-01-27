/**
 * Payment API - Real Backend Implementation
 * Connects to /api/payments endpoints
 */
import apiClient from './axiosClient.js';

export const paymentApi = {
    /**
     * Get all payments with optional filters
     * @param {Object} filters - Filter options
     * @returns {Promise<{data: Array, total: number, page: number, limit: number, totalPages: number}>}
     */
    getAll: async (filters = {}) => {
        const response = await apiClient.get('/api/payments', { params: filters });
        return response.data;
    },

    /**
     * Get payments for a specific invoice
     * @param {string} invoiceId - Invoice ID
     * @returns {Promise<Array>}
     */
    getByInvoiceId: async (invoiceId) => {
        const response = await apiClient.get(`/api/payments/${invoiceId}`);
        return response.data;
    },

    /**
     * Get a single payment by ID
     * @param {string} id - Payment ID
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await apiClient.get(`/api/payments/${id}`);
        return response.data;
    },

    /**
     * Create a new payment (record payment for invoice)
     * @param {Object} paymentData - Payment data
     * @returns {Promise<{payment: Object, invoice: Object}>}
     */
    create: async (paymentData) => {
        const response = await apiClient.post('/api/payments', paymentData);
        return response.data;
    },

    /**
     * Delete a payment (reverse the payment)
     * @param {string} id - Payment ID
     * @returns {Promise<{success: boolean, invoice: Object}>}
     */
    reverse: async (id, reason = '') => {
        const response = await apiClient.post(`/api/payments/${id}/reverse`, { reason });
        return response.data;
    },

    /**
     * Get payment summary statistics
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        const response = await apiClient.get('/api/payments/summary');
        return response.data;
    },

    /**
     * Get recent payments
     * @param {number} limit - Number of payments to return
     * @returns {Promise<Array>}
     */
    getRecent: async (limit = 5) => {
        const response = await apiClient.get('/api/payments/recent', { params: { limit } });
        return response.data;
    }
};

export default paymentApi;
