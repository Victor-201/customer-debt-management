import express from "express";
import UserController from "../../presentation/controllers/user.controller.js";
import UserRepository from "../../application/interfaces/repositories/user.repository.interface.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";
import { execute } from "../../main/config/database.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../presentation/validators/user.schema.js";

const router = express.Router();

const userRepository = new UserRepository({ execute });
const userController = new UserController(userRepository);

router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.post(
  "/",
  validateMiddleware(createUserSchema),
  (req, res) => userController.createUser(req, res)
);

router.get("/", (req, res) => userController.getAllUsers(req, res));

router.get("/:userId", (req, res) => userController.getUser(req, res));

router.put(
  "/:userId",
  validateMiddleware(updateUserSchema),
  (req, res) => userController.updateUser(req, res)
);

router.post("/:userId/lock", (req, res) => userController.lockUser(req, res));

router.post("/:userId/unlock", (req, res) => userController.unlockUser(req, res));

export default router;
