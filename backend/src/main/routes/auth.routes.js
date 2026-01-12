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
  refreshTokenSchema,
} from "../../presentation/validators/auth.schema.js";

import { execute } from "../config/database.js";

const router = express.Router();

const userRepository = new UserRepository({ execute });

const loginUseCase = new LoginUseCase({
  userRepository,
  passwordHasher: PasswordHasher,
  tokenService: JWTService,
});

const registerUseCase = new RegisterUseCase({
  userRepository,
  passwordHasher: PasswordHasher,
});

const refreshTokenUseCase = new RefreshTokenUseCase({
  userRepository,
  tokenService: JWTService,
});

const authController = new AuthController({
  loginUseCase,
  registerUseCase,
  refreshTokenUseCase,
});

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

router.post("/logout", authController.logout);

export default router;
