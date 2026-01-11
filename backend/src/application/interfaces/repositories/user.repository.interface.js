import User from '../../../domain/entities/User.js';

class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const rows = await this.database.execute(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const rows = await this.database.execute(query, [email]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async create(user) {
    const query = `
      INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const rows = await this.database.execute(query, [
      user.name,
      user.email,
      user.passwordHash, // hash đã có
      user.role,
      user.isActive,
      user.createdAt ?? new Date(),
      user.updatedAt ?? new Date()
    ]);

    user.id = rows[0].id;
    return user;
  }

  async findAll() {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const rows = await this.database.execute(query);
    return rows.map(row => new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }
}

export default UserRepository;
