import User from "../../../domain/entities/User.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

export default class RegisterUseCase {
  constructor({ userRepository, passwordHasher }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ name, email, password, role }) {
    if (!name || !email || !password || !role) {
      throw new BusinessRuleError("Missing required fields");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BusinessRuleError("Email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const user = User.create({ name, email, passwordHash, role });
    const savedUser = await this.userRepository.create(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
    };
  }
}