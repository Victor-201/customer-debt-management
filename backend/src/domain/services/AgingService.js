class AgingService {
    constructor(currentDate = new Date()) {
        this.currentDate = currentDate;
        // Default buckets configuration. Can be injected or modified.
        this.buckets = [
            { label: '0-30', maxDays: 30 },
            { label: '31-60', maxDays: 60 },
            { label: '61-90', maxDays: 90 },
            { label: '>90', maxDays: Infinity }
        ];
    }

    /**
     * @param {Invoice} invoice
     * @returns {number}
     */
    calculateOverdueDays(invoice) {
        if (!invoice.due_date) return 0;

        const dueDate = new Date(invoice.due_date);
        const now = new Date(this.currentDate);

        // Reset hours to compare dates only
        dueDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = now - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }

    /**
     * @param {Invoice} invoice
     * @returns {string}
     */
    getBucket(invoice) {
        const days = this.calculateOverdueDays(invoice);

        // If not overdue (<= 0 days), usually considered 'Current' or handle as per rule.
        // User requested 0-30 etc for overdue. If days=0 it technically fits 0-30?
        // Let's assume if it is overdue (>0), we check buckets.
        // If it is strictly 0 days overdue (today is due date),
        // usually it falls in 0-30.

        for (const bucket of this.buckets) {
            if (days <= bucket.maxDays) {
                return bucket.label;
            }
        }
        return '>90'; // Fallback
    }

    /**
     * @param {Invoice[]} invoices
     * @returns {object}
     */
    groupInvoicesByAging(invoices) {
        // Initialize summary with all bucket labels
        const summary = {};
        for (const b of this.buckets) {
            summary[b.label] = [];
        }

        for (const invoice of invoices) {
            // Only process overdue invoices? Or all?
            // Usually Aging Report includes everything.
            // If days <= 0 (not overdue), we might need a separate 'Current' bucket
            // or put it in 0-30 depending on requirement.
            // Requirement says "0-30". 0 could be included.

            const days = this.calculateOverdueDays(invoice);

            // Logic: if days=0, match first bucket (0-30).
            let matched = false;
            for (const bucket of this.buckets) {
                if (days <= bucket.maxDays) {
                    summary[bucket.label].push(invoice);
                    matched = true;
                    break;
                }
            }
        }

        return summary;
    }
}

export default AgingService;
