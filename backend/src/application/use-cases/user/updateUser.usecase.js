import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

export default class UpdateUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId, updates, updatedBy) {
    if (!userId) {
      throw new BusinessRuleError("User id is required");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BusinessRuleError("No data to update");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BusinessRuleError("User not found");
    }

    if (updatedBy) {
      await this.#checkAdminPermission(updatedBy);
    }

    this.#validateUpdates(updates);

    return this.userRepository.update(userId, updates);
  }

  async #checkAdminPermission(updatedBy) {
    const updater = await this.userRepository.findById(updatedBy);
    if (!updater || !updater.isAdmin()) {
      throw new BusinessRuleError("Only ADMIN can update users");
    }
  }

  #validateUpdates(updates) {
    if (updates.role && !this.#isValidRole(updates.role)) {
      throw new BusinessRuleError("Invalid role. Must be ADMIN or ACCOUNTANT");
    }
  }

  #isValidRole(role) {
    return ["ADMIN", "ACCOUNTANT"].includes(role);
  }
}
