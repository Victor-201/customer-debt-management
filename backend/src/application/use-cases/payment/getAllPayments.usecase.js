/**
 * Get All Payments Use Case
 * Returns paginated list of payments with filtering
 */

class GetAllPaymentsUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute(params = {}) {
        const {
            search = '',
            page = 1,
            limit = 10,
            invoiceId = null,
            paymentMethod = null,
            startDate = null,
            endDate = null,
        } = params;

        const result = await this.paymentRepository.findAll({
            search,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            invoiceId,
            paymentMethod,
            startDate,
            endDate,
        });

        return result;
    }
}

export default GetAllPaymentsUseCase;
