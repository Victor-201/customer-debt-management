import User from '../../../domain/entities/User.js';
import PasswordHasher from '../../../infrastructure/auth/passwordHasher.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(name, email, password, role, createdBy) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BusinessRuleError('User with this email already exists');
    }

    if (!['ADMIN', 'ACCOUNTANT'].includes(role)) {
      throw new BusinessRuleError('Invalid role. Must be ADMIN or ACCOUNTANT');
    }

    if (createdBy) {
      const creator = await this.userRepository.findById(createdBy);
      if (!creator || !creator.isAdmin()) {
        throw new BusinessRuleError('Only ADMIN can create users');
      }
    }

    const passwordHash = await PasswordHasher.hash(password);

    const user = User.create({ name, email, passwordHash, role });

    return await this.userRepository.create(user);
  }
}

export default RegisterUseCase;
