import CustomerRiskLevel from "../value-objects/CustomerRiskLevel.js";

class RiskAssessmentService {
    constructor(agingService) {
        this.agingService = agingService;
    }

    /**
     * @param {Customer} customer
     * @param {Invoice[]} invoices
     * @returns {string} 'NORMAL' | 'WARNING' | 'HIGH_RISK'
     */
    evaluateRisk(customer, invoices) {
        let maxOverdueDays = 0;
        let totalDebt = 0;

        for (const invoice of invoices) {
            // Calculate debt
            totalDebt += invoice.balance_amount.amount;

            // Calculate overdue days
            const days = this.agingService.calculateOverdueDays(invoice);
            if (days > maxOverdueDays) {
                maxOverdueDays = days;
            }
        }

        // Rule 1: Credit Limit
        // If debt > 100% credit limit => High Risk
        // (Assuming creditLimit is a number or Money object with amount)
        const creditLimitAmount = customer.creditLimit?.amount || customer.creditLimit || 0;

        if (creditLimitAmount > 0 && totalDebt > creditLimitAmount) {
            return CustomerRiskLevel.HIGH_RISK.value;
        }

        // Rule 2: Aging
        // > 90 days => High Risk
        if (maxOverdueDays > 90) {
            return CustomerRiskLevel.HIGH_RISK.value;
        }

        // > 60 days => Warning (renamed from Medium)
        if (maxOverdueDays > 60) {
            return CustomerRiskLevel.WARNING.value;
        }

        // > 30 days => Medium (optional, strictness depends on policy)
        // Let's stick to user prompt "based on debt age". 
        // Typically 60-90 is medium/watch.

        // Default => Normal (renamed from Low)
        return CustomerRiskLevel.NORMAL.value;
    }

    /**
     * Calculates and applies the risk level to the customer entity.
     * Fulfills "Auto update risk level" requirement (domain logic update).
     * @param {Customer} customer
     * @param {Invoice[]} invoices
     * @returns {boolean} true if risk level was changed
     */
    applyRiskAssessment(customer, invoices) {
        const newRisk = this.evaluateRisk(customer, invoices);

        if (customer.riskLevel !== newRisk) {
            customer.riskLevel = newRisk;
            customer.updatedAt = new Date();
            return true;
        }

        return false;
    }
}

export default RiskAssessmentService;
