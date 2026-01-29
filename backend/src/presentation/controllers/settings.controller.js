export default class SettingsController {
    constructor({ getSettingsUseCase, updateSettingsUseCase }) {
        this.getSettingsUseCase = getSettingsUseCase;
        this.updateSettingsUseCase = updateSettingsUseCase;
    }

    async getSettings(req, res, next) {
        try {
            const settings = await this.getSettingsUseCase.execute();
            res.json(settings);
        } catch (error) {
            next(error);
        }
    }

    async updateSettings(req, res, next) {
        try {
            const settings = await this.updateSettingsUseCase.execute(req.body);
            res.json(settings);
        } catch (error) {
            next(error);
        }
    }
}
