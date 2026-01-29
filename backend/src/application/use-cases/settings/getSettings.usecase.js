export default class GetSettingsUseCase {
    constructor({ settingsRepository }) {
        this.settingsRepository = settingsRepository;
    }

    async execute() {
        return await this.settingsRepository.getSettings();
    }
}
