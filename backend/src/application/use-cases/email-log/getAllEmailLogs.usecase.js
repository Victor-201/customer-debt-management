export default class GetAllEmailLogsUseCase {
    constructor({ emailLogRepository }) {
        this.emailLogRepository = emailLogRepository;
    }

    async execute(params = {}) {
        return await this.emailLogRepository.findAll(params);
    }
}
