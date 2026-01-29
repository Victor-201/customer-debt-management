export default class GetEmailTemplateUseCase {
    constructor({ emailTemplateRepository }) {
        this.emailTemplateRepository = emailTemplateRepository;
    }

    async execute(type) {
        if (!type) {
            throw new Error('Template type is required');
        }
        const template = await this.emailTemplateRepository.getTemplate(type);
        if (!template) {
            throw new Error(`Template not found for type: ${type}`);
        }
        return template;
    }
}
