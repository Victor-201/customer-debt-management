import express from "express";
import UserController from "../../presentation/controllers/user.controller.js";
import UserRepository from "../../infrastructure/database/repositories/user.repository.js";

import CreateUserUseCase from "../../application/use-cases/user/createUser.usecase.js";
import UpdateUserUseCase from "../../application/use-cases/user/updateUser.usecase.js";
import GetUserUseCase from "../../application/use-cases/user/getUser.usecase.js";
import GetAllUsersUseCase from "../../application/use-cases/user/getAllUsers.usecase.js";
import GetDeletedUsersUseCase from "../../application/use-cases/user/getDeletedUsers.usecase.js";
import LockUserUseCase from "../../application/use-cases/user/lockUser.usecase.js";
import UnlockUserUseCase from "../../application/use-cases/user/unlockUser.usecase.js";
import SoftDeleteUserUseCase from "../../application/use-cases/user/softDeleteUser.usecase.js";
import RestoreUserUseCase from "../../application/use-cases/user/restoreUser.usecase.js";
import HardDeleteUserUseCase from "../../application/use-cases/user/hardDeleteUser.usecase.js";
import HardDeleteAllUsersUseCase from "../../application/use-cases/user/hardDeleteAllUsers.usecase.js";

import PasswordHasher from "../../infrastructure/auth/passwordHasher.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import permissionMiddleware from "../middlewares/permission.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";
import { USER_PERMISSIONS } from "../../shared/constants/permissions.js";
import { execute } from "../../main/config/database.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../presentation/validators/user.schema.js";

const router = express.Router();

const userRepository = new UserRepository({ execute });

const createUserUseCase = new CreateUserUseCase({
  userRepository,
  passwordHasher: PasswordHasher,
});

const controller = new UserController({
  createUserUseCase,
  updateUserUseCase: new UpdateUserUseCase({ userRepository }),
  getUserUseCase: new GetUserUseCase({ userRepository }),
  getAllUsersUseCase: new GetAllUsersUseCase({ userRepository }),
  getDeletedUsersUseCase: new GetDeletedUsersUseCase({ userRepository }),
  lockUserUseCase: new LockUserUseCase({ userRepository }),
  unlockUserUseCase: new UnlockUserUseCase({ userRepository }),
  softDeleteUserUseCase: new SoftDeleteUserUseCase({ userRepository }),
  restoreUserUseCase: new RestoreUserUseCase({ userRepository }),
  hardDeleteUserUseCase: new HardDeleteUserUseCase({ userRepository }),
  hardDeleteAllUsersUseCase: new HardDeleteAllUsersUseCase({ userRepository }),
});

router.use(authMiddleware);

router.post(
  "/",
  permissionMiddleware(USER_PERMISSIONS.CREATE),
  validateMiddleware(createUserSchema),
  controller.createUser
);

router.get(
  "/",
  permissionMiddleware(USER_PERMISSIONS.READ),
  controller.getAllUsers
);

router.get(
  "/deleted",
  permissionMiddleware(USER_PERMISSIONS.READ),
  controller.getDeletedUsers
);

router.delete(
  "/hard/all",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  controller.hardDeleteAllDeletedUsers
);

router.get(
  "/:userId",
  permissionMiddleware(USER_PERMISSIONS.READ),
  controller.getUser
);

router.patch(
  "/:userId",
  permissionMiddleware(USER_PERMISSIONS.UPDATE),
  validateMiddleware(updateUserSchema),
  controller.updateUser
);

router.post(
  "/:userId/lock",
  permissionMiddleware(USER_PERMISSIONS.LOCK),
  controller.lockUser
);

router.post(
  "/:userId/unlock",
  permissionMiddleware(USER_PERMISSIONS.LOCK),
  controller.unlockUser
);

router.delete(
  "/:userId/soft",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  controller.softDeleteUser
);

router.post(
  "/:userId/restore",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  controller.restoreUser
);

router.delete(
  "/:userId/hard",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  controller.hardDeleteUser
);

export default router;
