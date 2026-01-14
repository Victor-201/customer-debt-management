import JWTService from "../../infrastructure/auth/jwt.service.js";

const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const decoded = JWTService.verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired access token",
    });
  }
};

export default authMiddleware;
