import User from "../../../domain/entities/User.js";

class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
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
      updatedAt: row.updated_at,
    });
  }

  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
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
      updatedAt: row.updated_at,
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
      user.passwordHash,
      user.role,
      user.isActive,
      user.createdAt ?? new Date(),
      user.updatedAt ?? new Date(),
    ]);

    user.id = rows[0].id;
    return user;
  }

  async findAll() {
    const query = "SELECT * FROM users ORDER BY created_at DESC";
    const rows = await this.database.execute(query);
    return rows.map(
      (row) =>
        new User({
          id: row.id,
          name: row.name,
          email: row.email,
          passwordHash: row.password_hash,
          role: row.role,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );
  }

  async update(user) {
    if (!user || !user.id) throw new Error("Invalid user");

    const fields = [];
    const values = [];
    let idx = 1;

    if (user.name) {
      fields.push(`name = $${idx++}`);
      values.push(user.name);
    }
    if (user.role) {
      fields.push(`role = $${idx++}`);
      values.push(user.role);
    }
    if (user.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(user.isActive);
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    fields.push(`updated_at = $${idx++}`);
    values.push(new Date());

    const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;
    values.push(user.id);

    const rows = await this.database.execute(query, values);

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async lock(userId) {
    const query = `
    UPDATE users
    SET is_active = false, updated_at = $1
    WHERE id = $2
    RETURNING *
  `;
    const values = [new Date(), userId];
    const rows = await this.database.execute(query, values);
    if (!rows || rows.length === 0) throw new Error("User not found");
    const row = rows[0];
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async unlock(userId) {
    const query = `
    UPDATE users
    SET is_active = true, updated_at = $1
    WHERE id = $2
    RETURNING *
  `;
    const values = [new Date(), userId];
    const rows = await this.database.execute(query, values);
    if (!rows || rows.length === 0) throw new Error("User not found");
    const row = rows[0];
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}

export default UserRepository;
