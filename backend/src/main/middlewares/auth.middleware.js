import JWTService from '../../infrastructure/auth/jwt.service.js';
import { AppError } from '../../shared/errors/AppError.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
      });
    }

    const decoded = JWTService.verifyAccessToken(token);
    req.user = decoded; // attach user info to request

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid access token',
    });
  }
};

export default authMiddleware;
