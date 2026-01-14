import { Op } from "sequelize";
import User from "../../../domain/entities/User.js";
import UserRepositoryInterface from "../../../application/interfaces/repositories/user.repository.interface.js";

export default class UserRepository extends UserRepositoryInterface {
  constructor({ UserModel }) {
    super();
    this.UserModel = UserModel;
  }

  async findById(id) {
    const row = await this.UserModel.findOne({
      where: { id, deleted_at: null },
    });
    return row ? this.#toDomain(row) : null;
  }

  async findByEmail(email) {
    const row = await this.UserModel.findOne({
      where: { email, deleted_at: null },
    });
    return row ? this.#toDomain(row) : null;
  }

  async findAll() {
    const rows = await this.UserModel.findAll({
      where: { deleted_at: null },
      order: [["created_at", "DESC"]],
    });
    return rows.map((row) => this.#toDomain(row));
  }

  async findAllDeleted() {
    const rows = await this.UserModel.findAll({
      where: { deleted_at: { [Op.ne]: null } },
    });
    return rows.map((row) => this.#toDomain(row));
  }

  async create(user) {
    const row = await this.UserModel.create({
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      role: user.role,
      is_active: user.isActive,
    });
    return this.#toDomain(row);
  }

  async update(id, payload) {
    await this.UserModel.update(
      {
        name: payload.name,
        role: payload.role,
        is_active: payload.isActive,
      },
      { where: { id } }
    );
    return this.findById(id);
  }

  async softDelete(id) {
    await this.UserModel.update(
      { deleted_at: new Date() },
      { where: { id } }
    );
  }

  async restore(id) {
    await this.UserModel.update(
      { deleted_at: null },
      { where: { id } }
    );
  }

  async hardDelete(id) {
    await this.UserModel.destroy({ where: { id } });
  }

  async hardDeleteAllDeleted() {
    return this.UserModel.destroy({
      where: { deleted_at: { [Op.ne]: null } },
    });
  }

  #toDomain(row) {
    return new User({
      id: row.get("id"),
      name: row.get("name"),
      email: row.get("email"),
      passwordHash: row.get("password_hash"),
      role: row.get("role"),
      isActive: row.get("is_active"),
      deletedAt: row.get("deleted_at"),
      createdAt: row.get("createdAt"),
      updatedAt: row.get("updatedAt"),
    });
  }
}
