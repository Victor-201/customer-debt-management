export default class PaymentRepositoryInterface {
  save(payment) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  findById(id) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  findByInvoiceId(invoiceId) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  sumByInvoiceId(invoiceId) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
}
