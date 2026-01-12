import RegisterUseCase from "../../application/use-cases/auth/register.usecase.js";
import UpdateUserUseCase from "../../application/use-cases/user/updateUser.usecase.js";
import GetUserUseCase from "../../application/use-cases/user/getUser.usecase.js";
import GetAllUsersUseCase from "../../application/use-cases/user/getAllUsers.usecase.js";
import LockUserUseCase from "../../application/use-cases/user/lockUser.usecase.js";
import UnlockUserUseCase from "../../application/use-cases/user/unlockUser.usecase.js";
import DeleteUserUseCase from "../../application/use-cases/user/deleteUser.usecase.js";

class UserController {
  constructor(userRepository) {
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.lockUserUseCase = new LockUserUseCase(userRepository);
    this.unlockUserUseCase = new UnlockUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
  }

  createUser = async (req, res) => {
    try {
      const createdBy = req.user?.userId;

      const user = await this.registerUseCase.execute({
        ...req.body,
        createdBy,
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getAllUsers = async (req, res) => {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await this.getUserUseCase.execute(userId);
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const updatedBy = req.user?.userId;

      const user = await this.updateUserUseCase.execute(
        userId,
        req.body,
        updatedBy
      );

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  lockUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await this.lockUserUseCase.execute(userId);
      res.json(result);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Lock user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  unlockUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await this.unlockUserUseCase.execute(userId);
      res.json(result);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Unlock user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const deletedBy = req.user?.userId;

      const result = await this.deleteUserUseCase.execute(userId, deletedBy);
      res.json(result);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export default UserController;
