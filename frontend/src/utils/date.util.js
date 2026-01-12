/**
 * Format a date to Vietnamese format (DD/MM/YYYY)
 * @param {string|Date} date - The date to format
 * @param {string} format - Format pattern (default: 'DD/MM/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * Format date for input[type="date"]
 * @param {string|Date} date
 * @returns {string} YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0];
};

/**
 * Add days to a date
 * @param {string|Date} date - The starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Subtract days from a date
 * @param {string|Date} date
 * @param {number} days
 * @returns {Date}
 */
export const subtractDays = (date, days) => addDays(date, -days);

/**
 * Calculate days between two dates
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {number} Number of days (can be negative)
 */
export const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2 - d1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is in the past
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isPast = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
};

/**
 * Check if a date is today
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the future
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isFuture = (date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d > today;
};

/**
 * Get relative time description (e.g., "2 ngày trước", "trong 3 ngày")
 * @param {string|Date} date
 * @returns {string}
 */
export const getRelativeTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = daysBetween(now, d);

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays > 1) return `Trong ${diffDays} ngày`;
    if (diffDays < -1) return `${Math.abs(diffDays)} ngày trước`;

    return formatDate(date);
};

/**
 * Get start of day
 * @param {string|Date} date
 * @returns {Date}
 */
export const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end of day
 * @param {string|Date} date
 * @returns {Date}
 */
export const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Get current date in ISO format
 * @returns {string}
 */
export const today = () => formatDateForInput(new Date());
