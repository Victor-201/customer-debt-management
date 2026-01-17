import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class GetInvoiceUseCase {
    constructor( invoiceRepository ) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(invoiceId) {
        if (!invoiceId) {
            throw new BusinessRuleError("Invoice id is required");
        }

        const invoice = await this.invoiceRepository.findById(invoiceId);

        if (!invoice) {
            throw new BusinessRuleError("Invoice not found");
        }

        return invoice;
    }
}

export default GetInvoiceUseCase;
