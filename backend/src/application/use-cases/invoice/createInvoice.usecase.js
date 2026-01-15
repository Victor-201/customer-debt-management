import Invoice from "../../../domain/entities/Invoice.js";

class CreateInvoiceUseCase {
    constructor({ invoiceRepository }) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(data) {
        // 1. Check for existing invoice number
        const existing = await this.invoiceRepository.findByInvoiceNumber(data.invoiceNumber);
        if (existing) {
            throw new Error(`Invoice number ${data.invoiceNumber} already exists.`);
        }

        const invoice = Invoice.create({
            customer_id: data.customerId,
            invoice_number: data.invoiceNumber,
            issue_date: data.issueDate,
            due_date: data.dueDate,
            total_amount: data.totalAmount,
            created_by: data.createdBy ?? null,
        });

        return await this.invoiceRepository.create(invoice);
    }
}

export default CreateInvoiceUseCase;
