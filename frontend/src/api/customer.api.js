import { mockCustomers } from '../mocks/mockData.js';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory data store
let customers = [...mockCustomers];

/**
 * Customer API - Mock implementation
 */
export const customerApi = {
    /**
     * Get all customers
     * @param {Object} filters - Filter options
     * @returns {Promise<{data: Array, total: number}>}
     */
    getAll: async (filters = {}) => {
        await delay(200);

        let result = [...customers];

        // Filter by status
        if (filters.status) {
            result = result.filter(c => c.status === filters.status);
        }

        // Filter by risk level
        if (filters.riskLevel) {
            result = result.filter(c => c.riskLevel === filters.riskLevel);
        }

        // Search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(searchLower) ||
                c.email.toLowerCase().includes(searchLower)
            );
        }

        return {
            data: result,
            total: result.length
        };
    },

    /**
     * Get a single customer by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        await delay(200);

        const customer = customers.find(c => c.id === id);
        if (!customer) {
            throw new Error('Không tìm thấy khách hàng');
        }

        return { ...customer };
    },

    /**
     * Get customer options for dropdowns
     * @returns {Promise<Array>}
     */
    getOptions: async () => {
        await delay(100);

        return customers
            .filter(c => c.status === 'ACTIVE')
            .map(c => ({
                value: c.id,
                label: c.name
            }));
    }
};

export default customerApi;
