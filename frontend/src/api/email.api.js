/**
 * Email API - Real Backend Implementation
 * Connects to /api/email-logs and /api/email-templates endpoints
 */
import apiClient from './axiosClient.js';

export const emailApi = {
    /**
     * Get all email logs (history)
     * @returns {Promise<Array>}
     */
    getLogs: async () => {
        const response = await apiClient.get('/api/email-logs');
        return response.data;
    },

    /**
     * Get all email templates
     * @returns {Promise<Array>}
     */
    getTemplates: async () => {
        const response = await apiClient.get('/api/email-templates');
        return response.data;
    },

    /**
     * Get a specific email template by type
     * @param {string} type - Template type (e.g., 'reminder', 'overdue')
     * @returns {Promise<Object>}
     */
    getTemplate: async (type) => {
        const response = await apiClient.get(`/api/email-templates/${type}`);
        return response.data;
    },

    /**
     * Update an email template
     * @param {string} type - Template type
     * @param {Object} templateData - Template content
     * @returns {Promise<Object>}
     */
    updateTemplate: async (type, templateData) => {
        const response = await apiClient.post(`/api/email-templates/${type}`, templateData);
        return response.data;
    }
};

export default emailApi;
