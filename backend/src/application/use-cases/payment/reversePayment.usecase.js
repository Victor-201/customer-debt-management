import Payment from "../../../domain/entities/Payment.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";
import { Transaction } from "../../../infrastructure/database/transactions/sequelize.transaction.js";
import { Money } from "../../../domain/value-objects/Money.js";

class ReversePaymentUseCase {
  constructor(paymentRepository, invoiceRepository) {
    this.paymentRepository = paymentRepository;
    this.invoiceRepository = invoiceRepository;
  }

  async execute({ paymentId, reversedBy, reference }) {
    return Transaction(async (tx) => {
      const originalPayment = await this.paymentRepository.findById(paymentId);
      if (!originalPayment) {
        throw new BusinessRuleError("Payment not found");
      }

      const reversedPayment = Payment.record({
        invoice_id: originalPayment.invoice_id,
        payment_date: new Date(),
        amount: originalPayment.amount.amount,
        method: "REVERSAL",
        reference: reference ?? 'REVERSAL PAYMENT',
        recorded_by: reversedBy,
      });

      await this.paymentRepository.save(reversedPayment, tx);

      const totalPaid = await this.paymentRepository.sumByInvoiceId(
        originalPayment.invoice_id,
        tx
      );

      const invoice = await this.invoiceRepository.findById(
        originalPayment.invoice_id,
        tx
      );

      // console.log(totalPaid);
      invoice.recalculatePayment(totalPaid);

      await this.invoiceRepository.save(invoice, tx);

      return reversedPayment;
    });
  }
}

export default ReversePaymentUseCase;
