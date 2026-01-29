import express from "express";
import EmailTemplateController from "../../presentation/controllers/emailTemplate.controller.js";
import FileEmailTemplateRepository from "../../../src/infrastructure/database/repositories/fileEmailTemplate.repository.js";
import GetEmailTemplateUseCase from "../../application/use-cases/email-template/getEmailTemplate.usecase.js";
import UpdateEmailTemplateUseCase from "../../application/use-cases/email-template/updateEmailTemplate.usecase.js";
import GetAllEmailTemplatesUseCase from "../../application/use-cases/email-template/getAllEmailTemplates.usecase.js";

const router = express.Router();

/* ===== DEPENDENCIES ===== */
const emailTemplateRepository = new FileEmailTemplateRepository();

/* ===== CONTROLLER ===== */
const emailTemplateController = new EmailTemplateController({
    getEmailTemplateUseCase: new GetEmailTemplateUseCase({ emailTemplateRepository }),
    updateEmailTemplateUseCase: new UpdateEmailTemplateUseCase({ emailTemplateRepository }),
    getAllEmailTemplatesUseCase: new GetAllEmailTemplatesUseCase({ emailTemplateRepository }),
});

/* ===== ROUTES ===== */
router.get("/", (req, res, next) => emailTemplateController.getAllTemplates(req, res, next));
router.get("/:type", (req, res, next) => emailTemplateController.getTemplate(req, res, next));
router.post("/:type", (req, res, next) => emailTemplateController.updateTemplate(req, res, next));

export default router;
