import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

export default class UnlockUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BusinessRuleError("User not found");
    }

    user.unlock();

    await this.userRepository.update(userId, {
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });

    return { message: "User unlocked successfully" };
  }
}
