import Invoice from "../../domain/entities/Invoice.js";

class CreateInvoiceUseCase {
  constructor({ invoiceRepository }) {
    this.invoiceRepository = invoiceRepository;
  }

  async execute({
    customer_id,
    invoice_number,
    issue_date,
    due_date,
    total_amount,
    created_by,
  }) {
    // 1. Check duplicate invoice number
    const existing =
      await this.invoiceRepository.findByInvoiceNumber(invoice_number);

    if (existing) {
      throw new Error("Invoice number already exists");
    }

    // 2. Create entity
    const invoice = Invoice.create({
      customer_id,
      invoice_number,
      issue_date,
      due_date,
      total_amount,
      created_by,
    });

    // 3. Save
    return await this.invoiceRepository.save(invoice);
  }
}

export default CreateInvoiceUseCase;
