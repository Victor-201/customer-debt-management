import Payment from "../../../domain/entities/Payment.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class ReversePaymentUseCase {
  constructor(paymentRepository, invoiceRepository) {
    this.paymentRepository = paymentRepository;
    this.invoiceRepository = invoiceRepository;
  }

  async execute(data) {
    const { payment_id, reversed_by, reason } = data;

    const originalPayment = await this.paymentRepository.findById(payment_id);
    if (!originalPayment) {
      throw new BusinessRuleError("Payment not found");
    }

    const invoice = await this.invoiceRepository.findById(
      originalPayment.invoice_id
    );
    if (!invoice) {
      throw new BusinessRuleError("Invoice not found");
    }

    const reversedPayment = Payment.record({
      invoice_id: originalPayment.invoice_id,
      payment_date: new Date(),
      amount: originalPayment.amount.amount,
      method: "REVERSAL",
      reference: reason ?? `Reverse payment ${originalPayment.id}`,
      recorded_by: reversed_by,
    });

    await this.paymentRepository.save(reversedPayment);

    const totalPaid = await this.paymentRepository.sumByInvoiceId(
      originalPayment.invoice_id
    );
    invoice.recalcBalance(totalPaid);

    await this.invoiceRepository.save(invoice);

    return reversedPayment;
  }
}

export default ReversePaymentUseCase;
