/**
 * Get All Invoices Use Case
 * Returns paginated list of invoices with filtering and sorting
 */

class GetAllInvoicesUseCase {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    async execute(params = {}) {
        const {
            status = 'ALL',
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
            customerId = null,
        } = params;

        const result = await this.invoiceRepository.findAll({
            status: status === 'ALL' ? null : status,
            search,
            sortBy,
            sortOrder,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            customerId,
        });

        return result;
    }
}

export default GetAllInvoicesUseCase;
