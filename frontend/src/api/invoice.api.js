/**
 * Invoice API - Real Backend Implementation
 * Connects to /api/invoices endpoints
 */
import apiClient from './axiosClient.js';

export const invoiceApi = {
    /**
     * Get all invoices with optional filters
     * @param {Object} filters - Filter options
     * @returns {Promise<{data: Array, total: number, page: number, limit: number, totalPages: number}>}
     */
    getAll: async (filters = {}) => {
        const response = await apiClient.get('/api/invoices', { params: filters });
        return response.data;
    },

    /**
     * Get a single invoice by ID
     * @param {string} id - Invoice ID
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await apiClient.get(`/api/invoices/${id}`);
        return response.data;
    },

    /**
     * Create a new invoice
     * @param {Object} invoiceData - Invoice data
     * @returns {Promise<Object>}
     */
    create: async (invoiceData) => {
        const response = await apiClient.post('/api/invoices', invoiceData);
        return response.data;
    },

    /**
     * Update an existing invoice
     * @param {string} id - Invoice ID
     * @param {Object} invoiceData - Updated invoice data
     * @returns {Promise<Object>}
     */
    update: async (id, invoiceData) => {
        const response = await apiClient.patch(`/api/invoices/${id}`, invoiceData);
        return response.data;
    },

    /**
     * Update invoice status
     * @param {string} id - Invoice ID
     * @param {string} status - New status
     * @returns {Promise<Object>}
     */
    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`/api/invoices/${id}`, { status });
        return response.data;
    },

    /**
     * Send invoice (change status from DRAFT to PENDING)
     * @param {string} id - Invoice ID
     * @returns {Promise<Object>}
     */
    send: async (id) => {
        const response = await apiClient.patch(`/api/invoices/${id}`, { status: 'PENDING' });
        return response.data;
    },

    /**
     * Cancel an invoice
     * @param {string} id - Invoice ID
     * @returns {Promise<Object>}
     */
    cancel: async (id) => {
        const response = await apiClient.post(`/api/invoices/${id}/cancel`);
        return response.data;
    },

    /**
     * Get summary statistics
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        const response = await apiClient.get('/api/invoices/summary');
        return response.data;
    }
};

export default invoiceApi;
