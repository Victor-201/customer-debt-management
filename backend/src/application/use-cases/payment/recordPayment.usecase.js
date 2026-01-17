import Payment from "../../../domain/entities/Payment.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";
import { Transaction } from "../../../infrastructure/database/transactions/sequelize.transaction.js";

class RecordPayment {
  constructor(paymentRepository, invoiceRepository) {
    this.paymentRepository = paymentRepository;
    this.invoiceRepository = invoiceRepository;
  }

  async execute(data) {
    return Transaction(async (tx) => {
      const invoice = await this.invoiceRepository.findByIdForUpdate(
        data.invoiceId,
        tx
      );

      if (!invoice) {
        throw new BusinessRuleError("Invoice not found");
      }

      const payment = Payment.record({
        invoice_id: data.invoiceId,
        payment_date: data.paymentDate,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        recorded_by: data.recorded_by,
      });
      
      invoice.applyPayment(payment.amount);

      const result = await this.paymentRepository.save(payment, tx);
      await this.invoiceRepository.save(invoice, tx);

      return result;
    });
  }
}

export default RecordPayment;
