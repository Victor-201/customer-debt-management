import fs from 'fs/promises';
import path from 'path';
import EmailTemplateRepositoryInterface from '../../../../application/interfaces/repositories/emailTemplate.repository.interface.js';
import { EmailTemplate } from '../../../../domain/entities/EmailTemplate.js';

export default class FileEmailTemplateRepository extends EmailTemplateRepositoryInterface {
    constructor() {
        super();
        this.templatesDir = path.join(process.cwd(), 'data', 'templates');
    }

    async _getFilePath(type) {
        return path.join(this.templatesDir, `${type}.json`);
    }

    async getTemplate(type) {
        try {
            const filePath = await this._getFilePath(type);
            const data = await fs.readFile(filePath, 'utf-8');
            const json = JSON.parse(data);
            return new EmailTemplate({ type, ...json });
        } catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    async saveTemplate(type, templateData) {
        const filePath = await this._getFilePath(type);
        const data = JSON.stringify({
            subject: templateData.subject,
            html: templateData.html
        }, null, 2);

        // Ensure directory exists
        await fs.mkdir(this.templatesDir, { recursive: true });
        await fs.writeFile(filePath, data, 'utf-8');

        return new EmailTemplate({ type, ...templateData });
    }

    async getAllTemplates() {
        try {
            const files = await fs.readdir(this.templatesDir);
            const templates = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const type = file.replace('.json', '');
                    const template = await this.getTemplate(type);
                    if (template) {
                        templates.push(template);
                    }
                }
            }
            return templates;
        } catch (error) {
            console.error('Error reading templates directory:', error);
            return [];
        }
    }
}
