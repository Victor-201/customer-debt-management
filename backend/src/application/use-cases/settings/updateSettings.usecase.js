export default class UpdateSettingsUseCase {
    constructor({ settingsRepository }) {
        this.settingsRepository = settingsRepository;
    }

    async execute(newSettings) {
        // Validate cron expression if provided
        if (newSettings?.cron?.SEND_REMINDER) {
            // Simple validation could be added here
        }

        const currentSettings = await this.settingsRepository.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...newSettings,
            cron: {
                ...currentSettings.cron,
                ...newSettings.cron
            }
        };

        return await this.settingsRepository.saveSettings(updatedSettings);
    }
}
