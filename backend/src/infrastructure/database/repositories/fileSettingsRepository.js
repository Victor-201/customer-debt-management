import fs from 'fs/promises';
import path from 'path';
import SettingsRepositoryInterface from '../../../application/interfaces/repositories/settings.repository.interface.js';

export default class FileSettingsRepository extends SettingsRepositoryInterface {
    constructor() {
        super();
        this.settingsPath = path.join(process.cwd(), 'data', 'settings.json');
        this.defaultSettings = {
            cron: {
                SEND_REMINDER: "0 8 * * *" // Default: 8 AM every day
            }
        };
    }

    async getSettings() {
        try {
            const data = await fs.readFile(this.settingsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return this.defaultSettings;
            }
            throw error;
        }
    }

    async saveSettings(settings) {
        const data = JSON.stringify(settings, null, 2);
        const dir = path.dirname(this.settingsPath);

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.settingsPath, data, 'utf-8');

        return settings;
    }
}
