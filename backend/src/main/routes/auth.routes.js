import express from "express";

import AuthController from "../../presentation/controllers/auth.controller.js";
import UserRepository from "../../infrastructure/database/repositories/user.repository.js";

import LoginUseCase from "../../application/use-cases/auth/login.usecase.js";
import RegisterUseCase from "../../application/use-cases/auth/register.usecase.js";
import RefreshTokenUseCase from "../../application/use-cases/auth/refreshToken.usecase.js";

import PasswordHasher from "../../infrastructure/auth/passwordHasher.js";
import JWTService from "../../infrastructure/auth/jwt.service.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

import {
  loginSchema,
  registerSchema,
} from "../../presentation/validators/auth.schema.js";

import { sequelize } from "../config/database.js";
import initUserModel from "../../infrastructure/database/models/user.model.js";

const router = express.Router();

/* ================== INIT ORM ================== */
const UserModel = initUserModel(sequelize);

/* ================== DEPENDENCIES ================== */
const userRepository = new UserRepository({ UserModel });
const passwordHasher = new PasswordHasher();
const tokenService = new JWTService();

/* ================== USE CASES ================== */
const loginUseCase = new LoginUseCase({
  userRepository,
  passwordHasher,
  tokenService,
});

const registerUseCase = new RegisterUseCase({
  userRepository,
  passwordHasher,
});

const refreshTokenUseCase = new RefreshTokenUseCase({
  userRepository,
  tokenService,
});

/* ================== CONTROLLER ================== */
const authController = new AuthController({
  loginUseCase,
  registerUseCase,
  refreshTokenUseCase,
});

/* ================== ROUTES ================== */
router.post("/login", validateMiddleware(loginSchema), authController.login);

router.post(
  "/register",
  validateMiddleware(registerSchema),
  authController.register
);

router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
