export class AgingUtil {
    /**
     * Calculate days between due date and current date
     * @param {Date|string} dueDate 
     * @param {Date} today 
     * @returns {number}
     */
    static getDaysOverdue(dueDate, today = new Date()) {
        const due = new Date(dueDate);
        const diffTime = today - due;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Determine which aging bucket a number of days belongs to
     * @param {number} daysOverdue 
     * @returns {string}
     */
    static getBucket(daysOverdue) {
        if (daysOverdue <= 0) return "CURRENT";
        if (daysOverdue <= 30) return "1_30";
        if (daysOverdue <= 60) return "31_60";
        if (daysOverdue <= 90) return "61_90";
        return "90_PLUS";
    }

    /**
     * Map days overdue to a human readable label
     * @param {number} daysOverdue 
     * @returns {string}
     */
    static getBucketLabel(daysOverdue) {
        const bucket = this.getBucket(daysOverdue);
        const labels = {
            CURRENT: "Current",
            "1_30": "1-30 Days",
            "31_60": "31-60 Days",
            "61_90": "61-90 Days",
            "90_PLUS": "90+ Days",
        };
        return labels[bucket];
    }
}
