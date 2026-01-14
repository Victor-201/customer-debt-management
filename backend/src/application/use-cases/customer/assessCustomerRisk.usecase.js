export default class AssessCustomerRiskUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(customerId) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const aging = await this.customerRepository.getInvoiceAgingSummary(
      customerId
    );

    const maxOverdueDays = aging.maxOverdueDays ?? 0;
    const totalOutstanding = aging.totalOutstanding ?? 0;

    let riskLevel = "NORMAL";

    if (maxOverdueDays > 30) {
      riskLevel = "HIGH_RISK";
    } else if (maxOverdueDays > 0) {
      riskLevel = "WARNING";
    }

    customer.riskLevel = riskLevel;
    await this.customerRepository.update(customer);

    return {
      customerId,
      riskLevel,
      maxOverdueDays,
      totalOutstanding,
    };
  }
}
