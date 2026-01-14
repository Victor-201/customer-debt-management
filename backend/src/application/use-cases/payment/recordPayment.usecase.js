import Payment from "../../../domain/entities/Payment.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class RecordPayment {
  constructor(paymentRepository, invoiceRepository) {
    this.paymentRepository = paymentRepository;
    this.invoiceRepository = invoiceRepository;
  }

  async execute(data) {
    const invoice = await this.invoiceRepository.findById(data.invoice_id);
    if (!invoice) {
      throw new BusinessRuleError("Invoice not found");
    }

    const payment = Payment.record(data);

    await this.paymentRepository.save(payment);

    const totalPaid = await this.paymentRepository.sumByInvoiceId(data.invoice_id);
    invoice.recalcBalance(totalPaid);

    await this.invoiceRepository.save(invoice);

    return payment;
  }
}

export default RecordPayment;
