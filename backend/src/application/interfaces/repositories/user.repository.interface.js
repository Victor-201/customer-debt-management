import User from "../../../domain/entities/User.js";

const BASE_SELECT = `
  SELECT
    id, name, email, password_hash, role,
    is_active, created_at, updated_at, deleted_at
  FROM users
`;

class UserRepository {
  constructor(database) {
    this.database = database;
  }

  async findById(id) {
    const rows = await this.database.execute(
      `${BASE_SELECT} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] ? this.#map(rows[0]) : null;
  }

  async findByEmail(email) {
    const rows = await this.database.execute(
      `${BASE_SELECT} WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return rows[0] ? this.#map(rows[0]) : null;
  }

  async findAll({ isActive } = {}) {
    const conditions = ["deleted_at IS NULL"];
    const values = [];
    let idx = 1;

    if (isActive !== undefined) {
      conditions.push(`is_active = $${idx++}`);
      values.push(isActive);
    }

    const rows = await this.database.execute(
      `${BASE_SELECT}
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC`,
      values
    );

    return rows.map(this.#map);
  }

  findAllActive() {
    return this.findAll({ isActive: true });
  }

  async findAllDeleted() {
    const rows = await this.database.execute(
      `${BASE_SELECT}
       WHERE deleted_at IS NOT NULL
       ORDER BY deleted_at DESC`
    );
    return rows.map(this.#map);
  }

  async create(user) {
    try {
      const rows = await this.database.execute(
        `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
        [user.name, user.email, user.passwordHash, user.role]
      );

      return this.#map(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        throw new Error("Email already exists");
      }
      throw err;
    }
  }

  async update(id, payload) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, column] of Object.entries({
      name: "name",
      role: "role",
      isActive: "is_active",
    })) {
      if (payload[key] !== undefined) {
        fields.push(`${column} = $${idx++}`);
        values.push(payload[key]);
      }
    }

    if (!fields.length) {
      throw new Error("No fields to update");
    }

    fields.push(`updated_at = NOW()`);

    const rows = await this.database.execute(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *
      `,
      [...values, id]
    );

    return rows[0] ? this.#map(rows[0]) : null;
  }

  async setActive(id, isActive) {
    const rows = await this.database.execute(
      `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
      `,
      [isActive, id]
    );

    if (!rows.length) throw new Error("User not found");
    return this.#map(rows[0]);
  }

  lock(id) {
    return this.setActive(id, false);
  }

  unlock(id) {
    return this.setActive(id, true);
  }

  async softDelete(id) {
    const rows = await this.database.execute(
      `
      UPDATE users
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
      `,
      [id]
    );

    if (!rows.length) throw new Error("User not found");
    return this.#map(rows[0]);
  }

  async restore(id) {
    const rows = await this.database.execute(
      `
      UPDATE users
      SET deleted_at = NULL, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NOT NULL
      RETURNING *
      `,
      [id]
    );

    if (!rows.length) throw new Error("User not found");
    return this.#map(rows[0]);
  }

  async hardDelete(id) {
    const rows = await this.database.execute(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id]
    );

    if (!rows.length) throw new Error("User not found");
    return this.#map(rows[0]);
  }

  async hardDeleteAllDeleted() {
    const rows = await this.database.execute(
      `DELETE FROM users WHERE deleted_at IS NOT NULL RETURNING id`
    );
    return rows.map((r) => r.id);
  }

  #map(row) {
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    });
  }
}

export default UserRepository;
