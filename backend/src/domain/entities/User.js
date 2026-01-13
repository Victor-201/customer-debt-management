export default class User {
  #passwordHash;

  constructor({
    id = null,
    name,
    email,
    passwordHash,
    role,
    isActive = true,
    createdAt = null,
    updatedAt = null,
    deletedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.#passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  static create({ name, email, passwordHash, role }) {
    return new User({ name, email, passwordHash, role });
  }

  get passwordHash() {
    return this.#passwordHash;
  }

  isAdmin() {
    return this.role === "ADMIN";
  }

  isActiveUser() {
    return this.isActive === true;
  }

  isDeleted() {
    return this.deletedAt !== null;
  }

  canLogin() {
    return this.isActiveUser() && !this.isDeleted();
  }

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
