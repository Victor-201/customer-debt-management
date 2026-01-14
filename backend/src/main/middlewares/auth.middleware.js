import JWTService from "../../infrastructure/auth/jwt.service.js";

const tokenService = new JWTService();

const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers.authorization;
    const token = tokenService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const decoded = tokenService.verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired access token",
    });
  }
};

export default authMiddleware;
