import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class LoginUseCase {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BusinessRuleError("Email does not exist");
    }

    if (user.isDeleted()) {
      throw new BusinessRuleError("Account has been deleted");
    }

    if (!user.canLogin()) {
      throw new BusinessRuleError("Account is locked");
    }

    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new BusinessRuleError("Incorrect password");
    }

    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      user: user.toResponse(),
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
  }
}

export default LoginUseCase;
