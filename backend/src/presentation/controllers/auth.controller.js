import LoginUseCase from '../../application/use-cases/auth/login.usecase.js';
import RegisterUseCase from '../../application/use-cases/auth/register.usecase.js';
import RefreshTokenUseCase from '../../application/use-cases/auth/refreshToken.usecase.js';

class AuthController {
  constructor(userRepository) {
    this.loginUseCase = new LoginUseCase(userRepository);
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await this.loginUseCase.execute(email, password);
      res.json(result);
    } catch (error) {
      if (error.name === 'BusinessRuleError') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      const createdBy = req.user?.userId; // From auth middleware

      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password, and role are required' });
      }

      const user = await this.registerUseCase.execute(name, email, password, role, createdBy);
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      if (error.name === 'BusinessRuleError') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);
      res.json(result);
    } catch (error) {
      if (error.name === 'BusinessRuleError') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req, res) {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    res.json({ message: 'Logged out successfully' });
  }
}

export default AuthController;
