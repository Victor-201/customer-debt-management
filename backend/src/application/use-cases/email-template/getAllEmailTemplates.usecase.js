export default class GetAllEmailTemplatesUseCase {
    constructor({ emailTemplateRepository }) {
        this.emailTemplateRepository = emailTemplateRepository;
    }

    async execute() {
        return await this.emailTemplateRepository.getAllTemplates();
    }
}
