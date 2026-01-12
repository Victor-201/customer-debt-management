import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

export default class RefreshTokenUseCase {
  constructor({ userRepository, tokenService }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute({ refreshToken }) {
    let decoded;

    try {
      decoded = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new BusinessRuleError("Invalid refresh token");
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new BusinessRuleError("User not found");
    }

    if (!user.canLogin()) {
      throw new BusinessRuleError("Account is locked");
    }

    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
  }
}
