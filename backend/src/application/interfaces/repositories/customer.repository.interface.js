/**
 * @interface CustomerRepositoryInterface
 */
export default class CustomerRepositoryInterface {
  findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {string} params.sortBy        // createdAt | creditLimit | email
   * @param {string} params.sortOrder     // ASC | DESC
   * @param {Object} params.filters
   * @param {string} params.filters.paymentTerm
   * @param {string} params.filters.riskLevel
   * @param {string} params.filters.status
   */
  findAll({
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
  }) {
    throw new Error("Method not implemented");
  }

  create(customer) {
    throw new Error("Method not implemented");
  }

  update(customer) {
    throw new Error("Method not implemented");
  }

  delete(id) {
    throw new Error("Method not implemented");
  }

  updateRiskLevel(id, riskLevel) {
    throw new Error("Method not implemented");
  }

  findHighRiskCustomers() {
    throw new Error("Method not implemented");
  }

  hasInvoices(customerId) {
    throw new Error("Method not implemented");
  }

  getInvoiceAgingSummary(customerId) {
    throw new Error("Method not implemented");
  }
}
