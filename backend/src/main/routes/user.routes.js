import express from "express";
import UserController from "../../presentation/controllers/user.controller.js";
import UserRepository from "../../application/interfaces/repositories/user.repository.interface.js";
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
const userController = new UserController(userRepository);

router.use(authMiddleware);

router.post(
  "/",
  permissionMiddleware(USER_PERMISSIONS.CREATE),
  validateMiddleware(createUserSchema),
  userController.createUser.bind(userController)
);

router.get(
  "/",
  permissionMiddleware(USER_PERMISSIONS.READ),
  userController.getAllUsers.bind(userController)
);

router.get(
  "/:userId",
  permissionMiddleware(USER_PERMISSIONS.READ),
  userController.getUser.bind(userController)
);

router.get(
  "/deleted",
  permissionMiddleware(USER_PERMISSIONS.READ),
  userController.getDeletedUsers.bind(userController)
);

router.patch(
  "/:userId",
  permissionMiddleware(USER_PERMISSIONS.UPDATE),
  validateMiddleware(updateUserSchema),
  userController.updateUser.bind(userController)
);

router.post(
  "/:userId/lock",
  permissionMiddleware(USER_PERMISSIONS.LOCK),
  userController.lockUser.bind(userController)
);

router.post(
  "/:userId/unlock",
  permissionMiddleware(USER_PERMISSIONS.LOCK),
  userController.unlockUser.bind(userController)
);

router.delete(
  "/:userId/soft",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  userController.softDeleteUser.bind(userController)
);

router.post(
  "/:userId/restore",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  userController.restoreUser.bind(userController)
);

router.delete(
  "/:userId/hard",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  userController.hardDeleteUser.bind(userController)
);

router.delete(
  "/hard/all",
  permissionMiddleware(USER_PERMISSIONS.DELETE),
  userController.hardDeleteAllDeletedUsers.bind(userController)
);

export default router;
