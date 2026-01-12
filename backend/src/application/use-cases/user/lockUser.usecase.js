import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

export default class LockUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BusinessRuleError("User not found");
    }

    if (!user.isActive) {
      throw new BusinessRuleError("User is already locked");
    }

    await this.userRepository.lock(userId);

    return { message: "User locked successfully" };
  }
}
