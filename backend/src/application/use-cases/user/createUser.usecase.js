import User from '../../../domain/entities/User.js';
import PasswordHasher from '../../../infrastructure/auth/passwordHasher.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    this.#validateInput(userData);

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new BusinessRuleError('Email already exists');
    }

    const passwordHash = await PasswordHasher.hash(userData.password);

    const user = User.create(
      userData.name,
      userData.email,
      passwordHash,
      userData.role
    );

    return this.userRepository.create(user);
  }

  #validateInput(userData) {
    if (!userData.name?.trim() || userData.name.trim().length < 2) {
      throw new BusinessRuleError('Name must be at least 2 characters long');
    }

    if (!userData.email || !this.#isValidEmail(userData.email)) {
      throw new BusinessRuleError('Invalid email format');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new BusinessRuleError('Password must be at least 6 characters long');
    }

    if (!this.#isValidRole(userData.role)) {
      throw new BusinessRuleError('Role must be either ADMIN or ACCOUNTANT');
    }
  }

  #isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  #isValidRole(role) {
    return ['ADMIN', 'ACCOUNTANT'].includes(role);
  }
}
