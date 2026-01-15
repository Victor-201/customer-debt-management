import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class ValidateCreditLimitUseCase {
    constructor({ customerRepository, invoiceRepository }) {
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
    }

    async execute({ customerId, invoiceTotalAmount, invoiceId }) {
        let finalCustomerId = customerId;

        if (!finalCustomerId && invoiceId) {
            const existingInvoice = await this.invoiceRepository.findById(invoiceId);
            if (existingInvoice) {
                finalCustomerId = existingInvoice.customer_id;
            }
        }

        if (!finalCustomerId) {
            // Can't validate without a customer
            // If checking credit limit is mandatory, this should error.
            // But if just updating totalAmount without changing customer, we derived it above.
            // If still missing => Error.
            throw new BusinessRuleError("Customer not found (ID required for credit check)");
        }

        const customer = await this.customerRepository.findById(finalCustomerId);
        if (!customer) {
            throw new BusinessRuleError("Customer not found");
        }

        const outstandingInvoices = await this.invoiceRepository.findOutstandingByCustomer(finalCustomerId);

        // Ensure outstandingInvoices is an array
        if (!Array.isArray(outstandingInvoices)) {
            console.error('findOutstandingByCustomer did not return an array:', outstandingInvoices);
            throw new Error('Invalid response from findOutstandingByCustomer');
        }

        let currentDebt = 0;
        for (const inv of outstandingInvoices) {
            // If we are updating an existing invoice, ignore its old balance in this calculation
            // as we are checking the new total against the limit.
            if (invoiceId && inv.id === invoiceId) {
                continue;
            }
            currentDebt += Number(inv.balance_amount || 0);
        }

        // invoiceTotalAmount might be a number or string, ensure number logic matches Money usage elsewhere
        // Assuming passed as number (amount)
        const newAmount = Number(invoiceTotalAmount);
        const totalExposure = currentDebt + newAmount;

        if (totalExposure > customer.creditLimit.amount) {
            throw new BusinessRuleError(`Credit limit exceeded. Limit: ${customer.creditLimit.amount}, Exposure: ${totalExposure}`);
        }

        return {
            success: true,
            limit: customer.creditLimit.amount,
            outstanding: currentDebt,
            newExposure: totalExposure,
            remainingCredit: customer.creditLimit.amount - totalExposure
        };
    }
}

export default ValidateCreditLimitUseCase;
