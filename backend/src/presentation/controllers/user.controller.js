class UserController {
  constructor({
    createUserUseCase,
    updateUserUseCase,
    getUserUseCase,
    getAllUsersUseCase,
    getDeletedUsersUseCase,
    lockUserUseCase,
    unlockUserUseCase,
    softDeleteUserUseCase,
    restoreUserUseCase,
    hardDeleteUserUseCase,
    hardDeleteAllUsersUseCase,
  }) {
    this.createUserUseCase = createUserUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.getUserUseCase = getUserUseCase;
    this.getAllUsersUseCase = getAllUsersUseCase;
    this.getDeletedUsersUseCase = getDeletedUsersUseCase;
    this.lockUserUseCase = lockUserUseCase;
    this.unlockUserUseCase = unlockUserUseCase;
    this.softDeleteUserUseCase = softDeleteUserUseCase;
    this.restoreUserUseCase = restoreUserUseCase;
    this.hardDeleteUserUseCase = hardDeleteUserUseCase;
    this.hardDeleteAllUsersUseCase = hardDeleteAllUsersUseCase;
  }

  createUser = async (req, res) => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
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

  getDeletedUsers = async (_req, res) => {
    try {
      const users = await this.getDeletedUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  updateUser = async (req, res) => {
    try {
      const result = await this.updateUserUseCase.execute(
        req.params.userId,
        req.body,
        req.user?.userId
      );
      res.json(result);
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

  hardDeleteAllDeletedUsers = async (_req, res) => {
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
