import UserRepositoryInterface from "../../../application/interfaces/repositories/user.repository.interface.js";
import User from "../../../domain/entities/User.js";

const BASE_SELECT = `
  SELECT id, name, email, password_hash, role,
         is_active, created_at, updated_at, deleted_at
  FROM users
`;

export default class UserRepository extends UserRepositoryInterface {
  constructor({ execute }) {
    super();

    if (!execute) {
      throw new Error("UserRepository requires execute function");
    }

    this.execute = execute;
  }

  async findById(id) {
    const rows = await this.execute(
      `${BASE_SELECT} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] ? this.#map(rows[0]) : null;
  }

  async findByEmail(email) {
    const rows = await this.execute(
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

    const rows = await this.execute(
      `${BASE_SELECT}
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC`,
      values
    );

    return rows.map((row) => this.#map(row));
  }

  async findAllDeleted() {
    const rows = await this.execute(
      `${BASE_SELECT} WHERE deleted_at IS NOT NULL`
    );
    return rows.map((row) => this.#map(row));
  }

  async create(user) {
    const rows = await this.execute(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [user.name, user.email, user.passwordHash, user.role]
    );

    return this.#map(rows[0]);
  }

  async update(id, payload) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (payload.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(payload.name);
    }

    if (payload.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(payload.role);
    }

    if (payload.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(payload.isActive);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);

    const rows = await this.execute(
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

  lock(id) {
    return this.#setActive(id, false);
  }

  unlock(id) {
    return this.#setActive(id, true);
  }

  async softDelete(id) {
    const rows = await this.execute(
      `
      UPDATE users
      SET deleted_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    return rows[0] ? this.#map(rows[0]) : null;
  }

  async restore(id) {
    const rows = await this.execute(
      `
      UPDATE users
      SET deleted_at = NULL
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    return rows[0] ? this.#map(rows[0]) : null;
  }

  async hardDelete(id) {
    await this.execute(`DELETE FROM users WHERE id = $1`, [id]);
  }

  async hardDeleteAllDeleted() {
    const rows = await this.execute(
      `DELETE FROM users WHERE deleted_at IS NOT NULL RETURNING id`
    );
    return rows.map((r) => r.id);
  }

  async #setActive(id, isActive) {
    const rows = await this.execute(
      `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
      `,
      [isActive, id]
    );
    return rows[0] ? this.#map(rows[0]) : null;
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
