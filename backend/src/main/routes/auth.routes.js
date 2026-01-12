import express from "express";

import AuthController from "../../presentation/controllers/auth.controller.js";
import UserRepository from "../../application/interfaces/repositories/user.repository.interface.js";

import validateMiddleware from "../middlewares/validate.middleware.js";

import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "../../presentation/validators/auth.schema.js";

import { execute } from "../../main/config/database.js";

const router = express.Router();

const userRepository = new UserRepository({ execute });
const authController = new AuthController(userRepository);

router.post(
  "/login",
  validateMiddleware(loginSchema),
  authController.login
);

router.post(
  "/register",
  validateMiddleware(registerSchema),
  authController.register
);

router.post(
  "/refresh-token",
  validateMiddleware(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  "/logout",
  authController.logout
);

export default router;
