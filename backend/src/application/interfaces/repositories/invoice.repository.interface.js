/**
 * @interface InvoiceRepositoryInterface
 */
export default class InvoiceRepositoryInterface {
    /** @returns {Promise<Invoice|null>} */
    findById(id) { }

    /** @returns {Promise<Invoice|null>} */
    findByInvoiceNumber(invoiceNumber) { }

    /** @returns {Promise<Invoice[]>} */
    findOutstandingByCustomer(customerId) { }

    /** @returns {Promise<Invoice>} */
    create(invoice) { }

    /** @returns {Promise<Invoice|null>} */
    update(id, payload) { }

    /** @returns {Promise<void>} */
    markOverdueInvoices(currentDate) { }

    /** @returns {Promise<Object>} */
    getAgingReport() { }

    /** @returns {Promise<Array>} */
    getOverdueReport() { }

    /** @returns {Promise<Array>} */
    getTotalArReport() { }
}
