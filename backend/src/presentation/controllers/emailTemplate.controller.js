export default class EmailTemplateController {
    constructor({ getEmailTemplateUseCase, updateEmailTemplateUseCase, getAllEmailTemplatesUseCase }) {
        this.getEmailTemplateUseCase = getEmailTemplateUseCase;
        this.updateEmailTemplateUseCase = updateEmailTemplateUseCase;
        this.getAllEmailTemplatesUseCase = getAllEmailTemplatesUseCase;
    }

    async getTemplate(req, res, next) {
        try {
            const { type } = req.params;
            const template = await this.getEmailTemplateUseCase.execute(type);
            res.json(template);
        } catch (error) {
            next(error);
        }
    }

    async updateTemplate(req, res, next) {
        try {
            const { type } = req.params;
            const template = await this.updateEmailTemplateUseCase.execute(type, req.body);
            res.json(template);
        } catch (error) {
            next(error);
        }
    }

    async getAllTemplates(req, res, next) {
        try {
            const templates = await this.getAllEmailTemplatesUseCase.execute();
            res.json(templates);
        } catch (error) {
            next(error);
        }
    }
}
