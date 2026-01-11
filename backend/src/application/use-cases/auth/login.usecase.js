import JWTService from "../../../infrastructure/auth/jwt.service.js";
import PasswordHasher from "../../../infrastructure/auth/passwordHasher.js";
import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BusinessRuleError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new BusinessRuleError("Account is locked");
    }

    const isPasswordValid = await PasswordHasher.compare(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new BusinessRuleError("Invalid email or password");
    }

    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}

export default LoginUseCase;
