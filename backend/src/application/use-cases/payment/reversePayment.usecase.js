import Payment from "../../../domain/entities/Payment.js";

class ReversePaymentUseCase {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  async execute(data) {
    const { payment_id, reversed_by, reason } = data;
    const originalPayment = await this.paymentRepository.findById(payment_id);

    if (!originalPayment) {
      throw new Error("Payment not found");
    }

    const reversedPayment = Payment.record({
      invoice_id: originalPayment.invoice_id,
      payment_date: new Date(),
      amount: -originalPayment.amount.amount,
      method: "REVERSAL",
      reference: reason ?? `Reverse payment ${originalPayment.id}`,
      recorded_by: reversed_by,
    });

    return await this.paymentRepository.save(reversedPayment);
  }
}

export default ReversePaymentUseCase;
