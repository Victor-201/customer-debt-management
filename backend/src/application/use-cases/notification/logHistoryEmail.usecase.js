import EmailLog from "../../../domain/entities/EmailLog.js";

class LogHistoryEmailUseCase {
    constructor({ emailLogRepository }) {
        this.emailLogRepository = emailLogRepository;
    }

    async execute({ customerId, invoiceId, emailType, status, errorMessage = null }) {
        const emailLog = new EmailLog({
            customerId,
            invoiceId,
            emailType,
            status,
            errorMessage,
            sentAt: new Date(),
        });

        return await this.emailLogRepository.save(emailLog);
    }
}

export default LogHistoryEmailUseCase;
