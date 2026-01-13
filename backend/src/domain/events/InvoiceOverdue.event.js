/**
 * InvoiceOverdue Domain Event
 * Raised when an invoice becomes overdue (past its due date and unpaid)
 * Automatically assesses overdue severity and loads current date
 */
class InvoiceOverdueEvent {
    // Overdue severity thresholds
    static SEVERITY_THRESHOLDS = {
        LOW: 7,        // 1-7 days overdue
        MEDIUM: 30,    // 8-30 days overdue
        HIGH: 60,      // 31-60 days overdue
        CRITICAL: 90   // 60+ days overdue
    };

    /**
     * @param {Object} payload
     * @param {string} payload.invoiceId - ID of the overdue invoice
     * @param {string} payload.customerId - ID of the customer
     * @param {string} payload.invoiceNumber - Invoice number
     * @param {Date} payload.dueDate - Original due date
     * @param {number} payload.balanceAmount - Outstanding balance
     * @param {number} payload.totalAmount - Total invoice amount
     * @param {number} payload.daysOverdue - Number of days overdue (auto-calculated if not provided)
     * @param {Date} payload.overdueDetectedAt - When the overdue status was detected (auto-loads current date)
     */
    constructor({
        invoiceId,
        customerId,
        invoiceNumber,
        dueDate,
        balanceAmount,
        totalAmount,
        daysOverdue = null,
        overdueDetectedAt = null
    }) {
        this.eventType = 'InvoiceOverdue';
        this.occurredAt = new Date();

        this.invoiceId = invoiceId;
        this.customerId = customerId;
        this.invoiceNumber = invoiceNumber;
        this.dueDate = new Date(dueDate);
        this.balanceAmount = balanceAmount;
        this.totalAmount = totalAmount;

        // Auto-load current date if not provided
        this.overdueDetectedAt = overdueDetectedAt ? new Date(overdueDetectedAt) : new Date();

        // Auto-calculate days overdue if not provided
        this.daysOverdue = daysOverdue !== null ? daysOverdue : this._calculateDaysOverdue();

        // Auto-assess severity and risk
        this.severity = this._assessSeverity();
        this.category = this._getOverdueCategory();
        this.riskLevel = this._assessRiskLevel();
    }

    /**
     * Calculate days overdue from due date to detection date
     * @private
     * @returns {number} Number of days overdue
     */
    _calculateDaysOverdue() {
        const timeDiff = this.overdueDetectedAt.getTime() - this.dueDate.getTime();
        return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    }

    /**
     * Assess overdue severity based on days overdue
     * @private
     * @returns {string} Severity level: LOW, MEDIUM, HIGH, CRITICAL
     */
    _assessSeverity() {
        if (this.daysOverdue <= InvoiceOverdueEvent.SEVERITY_THRESHOLDS.LOW) {
            return 'LOW';
        } else if (this.daysOverdue <= InvoiceOverdueEvent.SEVERITY_THRESHOLDS.MEDIUM) {
            return 'MEDIUM';
        } else if (this.daysOverdue <= InvoiceOverdueEvent.SEVERITY_THRESHOLDS.HIGH) {
            return 'HIGH';
        } else {
            return 'CRITICAL';
        }
    }

    /**
     * Get overdue category name
     * @private
     * @returns {string} Category name
     */
    _getOverdueCategory() {
        switch (this.severity) {
            case 'LOW':
                return 'Recently Overdue';
            case 'MEDIUM':
                return 'Moderately Overdue';
            case 'HIGH':
                return 'Seriously Overdue';
            case 'CRITICAL':
                return 'Critically Overdue';
            default:
                return 'Unknown';
        }
    }

    /**
     * Assess risk level based on amount and days overdue
     * @private
     * @returns {number} Risk score (0-100)
     */
    _assessRiskLevel() {
        // Base risk on days overdue (max 70 points)
        const daysRisk = Math.min(70, (this.daysOverdue / 90) * 70);

        // Add risk based on amount (max 30 points)
        const amountRisk = this.balanceAmount > 10000000 ? 30 :
            this.balanceAmount > 5000000 ? 20 : 10;

        return Math.min(100, Math.round(daysRisk + amountRisk));
    }

    /**
     * Check if invoice requires immediate action
     * @returns {boolean}
     */
    requiresImmediateAction() {
        return this.severity === 'CRITICAL' ||
            (this.severity === 'HIGH' && this.balanceAmount > 10000000);
    }

    /**
     * Get recommended action based on severity
     * @returns {string} Recommended action
     */
    getRecommendedAction() {
        switch (this.severity) {
            case 'LOW':
                return 'Send friendly reminder email';
            case 'MEDIUM':
                return 'Send formal payment request with urgency';
            case 'HIGH':
                return 'Make phone call and send final notice';
            case 'CRITICAL':
                return 'Escalate to collections or legal team';
            default:
                return 'Review and assess';
        }
    }

    /**
     * Create an InvoiceOverdue event from an Invoice entity
     * Auto-loads current date if not provided
     * @param {Invoice} invoice - The invoice entity
     * @param {Date} currentDate - Current date to calculate days overdue (auto-loads if not provided)
     * @returns {InvoiceOverdueEvent}
     */
    static fromInvoice(invoice, currentDate = null) {
        // Auto-load current date if not provided
        const detectionDate = currentDate ? new Date(currentDate) : new Date();
        const dueDate = new Date(invoice.due_date);
        const timeDiff = detectionDate.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        return new InvoiceOverdueEvent({
            invoiceId: invoice.id,
            customerId: invoice.customer_id,
            invoiceNumber: invoice.invoice_number,
            dueDate: invoice.due_date,
            balanceAmount: invoice.balance_amount.amount,
            totalAmount: invoice.total_amount.amount,
            daysOverdue: daysOverdue,
            overdueDetectedAt: detectionDate
        });
    }

    /**
     * Get a formatted message describing this event
     * @returns {string}
     */
    getMessage() {
        return `Invoice ${this.invoiceNumber} is ${this.category.toLowerCase()} by ${this.daysOverdue} days (Severity: ${this.severity}). Outstanding balance: ${this.balanceAmount.toLocaleString('vi-VN')} VND`;
    }

    /**
     * Get detailed assessment
     * @returns {Object}
     */
    getAssessment() {
        return {
            severity: this.severity,
            category: this.category,
            daysOverdue: this.daysOverdue,
            riskLevel: this.riskLevel,
            requiresImmediateAction: this.requiresImmediateAction(),
            recommendedAction: this.getRecommendedAction()
        };
    }

    /**
     * Serialize event to JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            eventType: this.eventType,
            occurredAt: this.occurredAt.toISOString(),
            invoiceId: this.invoiceId,
            customerId: this.customerId,
            invoiceNumber: this.invoiceNumber,
            dueDate: this.dueDate.toISOString(),
            balanceAmount: this.balanceAmount,
            totalAmount: this.totalAmount,
            daysOverdue: this.daysOverdue,
            overdueDetectedAt: this.overdueDetectedAt.toISOString(),
            severity: this.severity,
            category: this.category,
            riskLevel: this.riskLevel,
            requiresImmediateAction: this.requiresImmediateAction(),
            recommendedAction: this.getRecommendedAction()
        };
    }
}

export default InvoiceOverdueEvent;
