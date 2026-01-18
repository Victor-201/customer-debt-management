import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class GetPaymentByInvoiceId {
    constructor (paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute (invoiceId) {
        if (!invoiceId) {
            throw new BusinessRuleError("Invoice id is required");
        }
        // console.log(invoiceId);
        const payments = this.paymentRepository.findByInvoiceId(invoiceId);

        if (!payments) throw new BusinessRuleError("Payment with invoice id not found!");

        return payments;
    }
}

export default GetPaymentByInvoiceId;