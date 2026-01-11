import jwt from 'jsonwebtoken';
import config from '../../main/config/jwt.config.js';

export default class JWTService {
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.accessTokenExpiry,
      issuer: config.issuer,
      audience: config.audience
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.refreshTokenExpiry,
      issuer: config.issuer,
      audience: config.audience
    });
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret, {
        issuer: config.issuer,
        audience: config.audience
      });
    } catch {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwtRefreshSecret, {
        issuer: config.issuer,
        audience: config.audience
      });
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
  }
}
