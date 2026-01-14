class AuthController {
  constructor({ loginUseCase, registerUseCase, refreshTokenUseCase }) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await this.loginUseCase.execute({
        email,
        password,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh-token",
      });

      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
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

      const user = await this.registerUseCase.execute({
        name,
        email,
        password,
        role,
      });

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
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token missing" });
      }

      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
      });

      res.json({
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Refresh token error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  logout = async (_req, res) => {
    res.clearCookie("refreshToken", {
      path: "/api/auth/refresh-token",
    });

    res.json({ message: "Logged out successfully" });
  };
}

export default AuthController;
