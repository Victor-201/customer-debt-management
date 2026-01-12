import RegisterUseCase from "../../application/use-cases/auth/register.usecase.js";
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

class UserController {
  constructor(userRepository) {
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.getDeletedUsersUseCase = new GetDeletedUsersUseCase(userRepository);
    this.lockUserUseCase = new LockUserUseCase(userRepository);
    this.unlockUserUseCase = new UnlockUserUseCase(userRepository);
    this.softDeleteUserUseCase = new SoftDeleteUserUseCase(userRepository);
    this.restoreUserUseCase = new RestoreUserUseCase(userRepository);
    this.hardDeleteUserUseCase = new HardDeleteUserUseCase(userRepository);
    this.hardDeleteAllUsersUseCase = new HardDeleteAllUsersUseCase(userRepository);
  }

  createUser = async (req, res) => {
    try {
      const user = await this.registerUseCase.execute(req.body);
      res.status(201).json(user);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  getUser = async (req, res) => {
    try {
      const user = await this.getUserUseCase.execute(req.params.userId);
      res.json(user);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  getAllUsers = async (req, res) => {
    try {
      const { isActive } = req.query;
      const users = await this.getAllUsersUseCase.execute(
        isActive !== undefined ? { isActive: isActive === "true" } : {}
      );
      res.json(users);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  getDeletedUsers = async (req, res) => {
    try {
      const users = await this.getDeletedUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  updateUser = async (req, res) => {
    try {
      const user = await this.updateUserUseCase.execute(
        req.params.userId,
        req.body,
        req.user?.userId
      );
      res.json(user);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  lockUser = async (req, res) => {
    try {
      const result = await this.lockUserUseCase.execute(req.params.userId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  unlockUser = async (req, res) => {
    try {
      const result = await this.unlockUserUseCase.execute(req.params.userId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  softDeleteUser = async (req, res) => {
    try {
      const result = await this.softDeleteUserUseCase.execute(
        req.params.userId,
        req.user?.userId
      );
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  restoreUser = async (req, res) => {
    try {
      const result = await this.restoreUserUseCase.execute(req.params.userId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  hardDeleteUser = async (req, res) => {
    try {
      const result = await this.hardDeleteUserUseCase.execute(req.params.userId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  hardDeleteAllDeletedUsers = async (req, res) => {
    try {
      const result = await this.hardDeleteAllUsersUseCase.execute();
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  #handleError(res, error) {
    if (error.name === "BusinessRuleError") {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default UserController;
