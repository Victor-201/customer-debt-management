export default class InvoiceRepositoryInterface {
  save(invoice) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  findById(id) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  findByInvoiceNumber(invoiceNumber) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  findOutstandingByCustomer(customerId) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  markOverdueInvoices(currentDate) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  getAgingReport() {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  getOverdueReport() {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  getTotalArReport() {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
}
