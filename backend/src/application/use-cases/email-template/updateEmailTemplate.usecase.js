export default class UpdateEmailTemplateUseCase {
    constructor({ emailTemplateRepository }) {
        this.emailTemplateRepository = emailTemplateRepository;
    }

    async execute(type, data) {
        if (!type) {
            throw new Error('Template type is required');
        }
        if (!data.subject || !data.html) {
            throw new Error('Subject and HTML content are required');
        }

        return await this.emailTemplateRepository.saveTemplate(type, data);
    }
}
