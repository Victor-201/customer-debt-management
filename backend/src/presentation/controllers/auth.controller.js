import LoginUseCase from "../../application/use-cases/auth/login.usecase.js";
import RegisterUseCase from "../../application/use-cases/auth/register.usecase.js";
import RefreshTokenUseCase from "../../application/use-cases/auth/refreshToken.usecase.js";

class AuthController {
  constructor(userRepository) {
    this.loginUseCase = new LoginUseCase(userRepository);
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await this.loginUseCase.execute(email, password);
      res.json(result);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  register = async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const user = await this.registerUseCase.execute(
        name,
        email,
        password,
        role
      );

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const result = await this.refreshTokenUseCase.execute(refreshToken);
      res.json(result);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Refresh token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  logout = async (req, res) => {
    res.json({ message: "Logged out successfully" });
  };
}

export default AuthController;
