import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";
export default class SoftDeleteUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId, deletedBy) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDeleted()) {
      throw new BusinessRuleError("User not found");
    }

    if (user.id === deletedBy) {
      throw new BusinessRuleError("You cannot delete yourself");
    }

    await this.userRepository.softDelete(userId);
    return { message: "User deleted temporarily" };
  }
}
