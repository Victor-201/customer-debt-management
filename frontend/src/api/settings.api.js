/**
 * Settings API - Real Backend Implementation
 * Connects to /api/settings endpoints
 */
import apiClient from './axiosClient.js';

export const settingsApi = {
    /**
     * Get all settings
     * @returns {Promise<Object>}
     */
    getSettings: async () => {
        const response = await apiClient.get('/api/settings');
        return response.data;
    },

    /**
     * Update settings
     * @param {Object} settings - Settings object
     * @returns {Promise<Object>}
     */
    updateSettings: async (settings) => {
        const response = await apiClient.post('/api/settings', settings);
        return response.data;
    }
};

export default settingsApi;
