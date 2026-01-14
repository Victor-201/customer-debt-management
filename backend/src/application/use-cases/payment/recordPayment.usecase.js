import Payment from "../../../domain/entities/Payment.js";

class RecordPayment {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  async execute(data) {
    const payment = Payment.record(data);

    return await this.paymentRepository.save(payment);
  }
}

export default RecordPayment;
