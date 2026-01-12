export default class AssessCustomerRiskUseCase {
  constructor(customerRepository, database) {
    this.customerRepository = customerRepository;
    this.database = database;
  }

  async execute(customerId) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const query = `
      SELECT
        MAX(days_overdue) AS max_overdue,
        SUM(balance_amount) AS total_due
      FROM vw_invoice_aging_days
      WHERE customer_id = $1
    `;

    const [result] = await this.database.execute(query, [customerId]);

    let risk = 'NORMAL';

    if (result?.max_overdue > 30) {
      risk = 'HIGH_RISK';
    } else if (result?.max_overdue > 0) {
      risk = 'WARNING';
    }

    customer.setRiskLevel(risk);
    await this.customerRepository.update(customer);

    return {
      customerId,
      riskLevel: risk,
      maxOverdueDays: result?.max_overdue ?? 0,
      totalOutstanding: Number(result?.total_due ?? 0)
    };
  }
}
