import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class GetInvoicesByCustomerUseCase {
    constructor( invoiceRepository ) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(customerId) {
        if (!customerId) {
            throw new BusinessRuleError("Customer id is required");
        }

        const invoices = await this.invoiceRepository.findByCustomer(customerId);

        return invoices;
    }
}

export default GetInvoicesByCustomerUseCase;
