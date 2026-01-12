import { daysBetween, isPast } from './date.util.js';

/**
 * Aging bucket definitions
 * Used for categorizing overdue invoices by age
 */
export const AGING_BUCKETS = {
    CURRENT: {
        key: 'CURRENT',
        label: 'Còn hạn',
        min: -Infinity,
        max: 0,
        color: '#10b981',
        bgColor: '#d1fae5'
    },
    '1_30': {
        key: '1_30',
        label: '1-30 ngày',
        min: 1,
        max: 30,
        color: '#f59e0b',
        bgColor: '#fef3c7'
    },
    '31_60': {
        key: '31_60',
        label: '31-60 ngày',
        min: 31,
        max: 60,
        color: '#f97316',
        bgColor: '#ffedd5'
    },
    '61_90': {
        key: '61_90',
        label: '61-90 ngày',
        min: 61,
        max: 90,
        color: '#ef4444',
        bgColor: '#fee2e2'
    },
    OVER_90: {
        key: 'OVER_90',
        label: 'Trên 90 ngày',
        min: 91,
        max: Infinity,
        color: '#dc2626',
        bgColor: '#fecaca'
    }
};

/**
 * Calculate days overdue from due date
 * @param {string|Date} dueDate - The due date
 * @returns {number} Days overdue (positive if overdue, negative if not yet due)
 */
export const calculateDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return daysBetween(new Date(dueDate), today);
};

/**
 * Get aging bucket for given days overdue
 * @param {number} daysOverdue - Number of days overdue
 * @returns {Object} Aging bucket object
 */
export const getAgingBucket = (daysOverdue) => {
    if (daysOverdue <= 0) return AGING_BUCKETS.CURRENT;
    if (daysOverdue <= 30) return AGING_BUCKETS['1_30'];
    if (daysOverdue <= 60) return AGING_BUCKETS['31_60'];
    if (daysOverdue <= 90) return AGING_BUCKETS['61_90'];
    return AGING_BUCKETS.OVER_90;
};

/**
 * Get aging info for an invoice
 * @param {string|Date} dueDate - Invoice due date
 * @returns {Object} Aging information
 */
export const getAgingInfo = (dueDate) => {
    const daysOverdue = calculateDaysOverdue(dueDate);
    const bucket = getAgingBucket(daysOverdue);
    const isOverdue = daysOverdue > 0;

    return {
        daysOverdue,
        bucket,
        isOverdue,
        label: isOverdue
            ? `Quá hạn ${daysOverdue} ngày`
            : daysOverdue === 0
                ? 'Đến hạn hôm nay'
                : `Còn ${Math.abs(daysOverdue)} ngày`
    };
};

/**
 * Calculate risk score based on aging
 * @param {number} daysOverdue
 * @returns {number} Risk score (0-100)
 */
export const calculateAgingRiskScore = (daysOverdue) => {
    if (daysOverdue <= 0) return 0;
    if (daysOverdue <= 30) return 25;
    if (daysOverdue <= 60) return 50;
    if (daysOverdue <= 90) return 75;
    return 100;
};

/**
 * Check if invoice should be marked as high risk
 * @param {number} daysOverdue
 * @returns {boolean}
 */
export const isHighRiskAging = (daysOverdue) => daysOverdue > 60;

/**
 * Group invoices by aging bucket
 * @param {Array} invoices - Array of invoices with dueDate
 * @returns {Object} Invoices grouped by bucket key
 */
export const groupByAgingBucket = (invoices) => {
    const groups = {
        CURRENT: [],
        '1_30': [],
        '31_60': [],
        '61_90': [],
        OVER_90: []
    };

    invoices.forEach(invoice => {
        const daysOverdue = calculateDaysOverdue(invoice.dueDate);
        const bucket = getAgingBucket(daysOverdue);
        groups[bucket.key].push({
            ...invoice,
            daysOverdue
        });
    });

    return groups;
};

/**
 * Calculate aging summary for a set of invoices
 * @param {Array} invoices - Array of invoices with dueDate and balance
 * @returns {Object} Summary with counts and totals by bucket
 */
export const calculateAgingSummary = (invoices) => {
    const summary = {};

    Object.keys(AGING_BUCKETS).forEach(key => {
        summary[key] = {
            ...AGING_BUCKETS[key],
            count: 0,
            total: 0
        };
    });

    invoices.forEach(invoice => {
        if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return;

        const daysOverdue = calculateDaysOverdue(invoice.dueDate);
        const bucket = getAgingBucket(daysOverdue);
        summary[bucket.key].count += 1;
        summary[bucket.key].total += invoice.balance || 0;
    });

    return summary;
};
