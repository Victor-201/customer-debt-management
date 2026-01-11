import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class GetUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BusinessRuleError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
