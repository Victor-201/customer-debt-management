/**
 * Get Payment Summary Use Case
 * Returns aggregated statistics for payments
 */

class GetPaymentSummaryUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute(params = {}) {
        const { startDate = null, endDate = null } = params;
        
        const summary = await this.paymentRepository.getSummary({
            startDate,
            endDate,
        });

        return summary;
    }
}

export default GetPaymentSummaryUseCase;
