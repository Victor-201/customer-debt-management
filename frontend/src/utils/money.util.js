/**
 * Format a number as Vietnamese currency (VND)
 * @param {number} amount - The amount to format
 * @param {string} locale - Locale string (default: 'vi-VN')
 * @param {string} currency - Currency code (default: 'VND')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, locale = 'vi-VN', currency = 'VND') => {
    if (amount === null || amount === undefined) return '0 ₫';

    // Handle Money object from backend { amount, formatted }
    const numericAmount = extractAmount(amount);

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numericAmount);
};

/**
 * Extract numeric amount from backend Money object
 * Backend may return: { amount: number, formatted: string } or just a number
 * @param {number|object} value - The value to extract amount from
 * @returns {number} Numeric amount
 */
export const extractAmount = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value.amount !== undefined) {
        return value.amount;
    }
    // Try to parse as number
    return parseFloat(value) || 0;
};


/**
 * Format a number with thousand separators
 * @param {number} amount - The number to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted number string
 */
export const formatNumber = (amount, locale = 'vi-VN') => {
    if (amount === null || amount === undefined) return '0';

    return new Intl.NumberFormat(locale).format(amount);
};

/**
 * Parse a formatted string back to a number
 * @param {string} value - The formatted string
 * @returns {number} Parsed number
 */
export const parseNumber = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;

    // Remove all non-numeric characters except decimal point and minus
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
};

/**
 * Calculate total from line items
 * @param {Array} items - Array of items with quantity and unitPrice
 * @returns {number} Total amount
 */
export const calculateTotal = (items) => {
    if (!Array.isArray(items)) return 0;

    return items.reduce((sum, item) => {
        const quantity = parseNumber(item.quantity);
        const unitPrice = parseNumber(item.unitPrice);
        return sum + (quantity * unitPrice);
    }, 0);
};

/**
 * Calculate tax amount
 * @param {number} subtotal - The subtotal amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 10 for 10%)
 * @returns {number} Tax amount
 */
export const calculateTax = (subtotal, taxRate = 10) => {
    return subtotal * (taxRate / 100);
};

/**
 * Round to nearest specified precision
 * @param {number} value - The value to round
 * @param {number} precision - Number of decimal places
 * @returns {number} Rounded value
 */
export const roundMoney = (value, precision = 0) => {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
};

/**
 * Check if amount is positive
 * @param {number} amount
 * @returns {boolean}
 */
export const isPositive = (amount) => parseNumber(amount) > 0;

/**
 * Check if amount is negative
 * @param {number} amount
 * @returns {boolean}
 */
export const isNegative = (amount) => parseNumber(amount) < 0;

/**
 * Get CSS class based on amount (positive/negative/zero)
 * @param {number} amount
 * @returns {string} CSS class suffix
 */
export const getAmountColorClass = (amount) => {
    const value = parseNumber(amount);
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
};
