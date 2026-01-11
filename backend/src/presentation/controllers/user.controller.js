import RegisterUseCase from '../../application/use-cases/auth/register.usecase.js';
import UpdateUserUseCase from '../../application/use-cases/user/updateUser.usecase.js';
import GetUsersUseCase from '../../application/use-cases/user/getUsers.usecase.js';

class UserController {
  constructor(userRepository) {
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.getUsersUseCase = new GetUsersUseCase(userRepository);
  }

  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;
      const createdBy = req.user?.userId;

      const user = await this.registerUseCase.execute(name, email, password, role, createdBy);

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error) {
      if (error.name === 'BusinessRuleError') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;
      const updatedBy = req.user?.userId;

      const user = await this.updateUserUseCase.execute(userId, updates, updatedBy);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      if (error.name === 'BusinessRuleError') {
        return res.status(400).json({ error: error.message });
      }
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.getUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UserController;