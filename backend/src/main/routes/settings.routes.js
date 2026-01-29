import express from "express";
import SettingsController from "../../presentation/controllers/settings.controller.js";
import FileSettingsRepository from "../../../src/infrastructure/database/repositories/fileSettingsRepository.js";
import GetSettingsUseCase from "../../application/use-cases/settings/getSettings.usecase.js";
import UpdateSettingsUseCase from "../../application/use-cases/settings/updateSettings.usecase.js";

const router = express.Router();

const settingsRepository = new FileSettingsRepository();
const settingsController = new SettingsController({
    getSettingsUseCase: new GetSettingsUseCase({ settingsRepository }),
    updateSettingsUseCase: new UpdateSettingsUseCase({ settingsRepository })
});

router.get("/", (req, res, next) => settingsController.getSettings(req, res, next));
router.post("/", (req, res, next) => settingsController.updateSettings(req, res, next));

export default router;
