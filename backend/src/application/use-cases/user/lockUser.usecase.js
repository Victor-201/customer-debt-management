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

    user.lock();

    await this.userRepository.update(userId, {
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });

    return { message: "User locked successfully" };
  }
}
