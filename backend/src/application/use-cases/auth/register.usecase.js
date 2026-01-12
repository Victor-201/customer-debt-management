import bcrypt from "bcrypt";
import User from "../../../domain/entities/User.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ name, email, password, role }) {
    if (!name || !email || !password || !role) {
      throw new BusinessRuleError("Missing required fields");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BusinessRuleError("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = User.create({
      name,
      email,
      passwordHash,
      role,
    });

    return this.userRepository.create(user);
  }
}

export default RegisterUseCase;
