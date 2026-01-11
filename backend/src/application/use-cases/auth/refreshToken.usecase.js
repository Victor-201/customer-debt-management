import JWTService from '../../../infrastructure/auth/jwt.service.js';
import { BusinessRuleError } from '../../../shared/errors/BusinessRuleError.js';

export default class RefreshTokenUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(refreshToken) {
    const decoded = this.#verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new BusinessRuleError('User not found');
    }

    if (!user.isActive) {
      throw new BusinessRuleError('Account is locked');
    }

    return this.#generateTokens(user);
  }

  #verifyRefreshToken(refreshToken) {
    try {
      return JWTService.verifyRefreshToken(refreshToken);
    } catch {
      throw new BusinessRuleError('Invalid refresh token');
    }
  }

  #generateTokens(user) {
    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: JWTService.generateAccessToken(payload),
      refreshToken: JWTService.generateRefreshToken(payload)
    };
  }
}
