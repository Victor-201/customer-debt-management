/**
 * Get Recent Payments Use Case
 * Returns the most recent payments
 */

class GetRecentPaymentsUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute(limit = 10) {
        const payments = await this.paymentRepository.findRecent(parseInt(limit, 10));
        return payments;
    }
}

export default GetRecentPaymentsUseCase;
