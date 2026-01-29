export default class GetAllEmailLogsUseCase {
    constructor({ emailLogRepository }) {
        this.emailLogRepository = emailLogRepository;
    }

    async execute() {
        return await this.emailLogRepository.findAll();
    }
}
