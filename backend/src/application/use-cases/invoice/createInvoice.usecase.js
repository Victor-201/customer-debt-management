import Invoice from "../../../domain/entities/Invoice.js";

class CreateInvoiceUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(data) {
        const invoice = Invoice.create({
            customer_id: data.customerId,
            invoice_number: data.invoiceNumber,
            issue_date: data.issueDate,
            due_date: data.dueDate,
            total_amount: data.totalAmount,
            created_by: data.createdBy ?? null,
        });

        return await this.invoiceRepository.save(invoice);
    }
}

export default CreateInvoiceUseCase;
