export default class User {
  #passwordHash;

  constructor({
    id,
    name,
    email,
    passwordHash,
    role,
    isActive = true,
    deletedAt = null,
    createdAt = null,
    updatedAt = null,
  }) {
    if (!name) throw new Error("User.name is required");
    if (!email) throw new Error("User.email is required");
    if (!passwordHash) throw new Error("User.passwordHash is required");
    if (!role) throw new Error("User.role is required");

    this.id = id;
    this.name = name;
    this.email = email;
    this.#passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive;
    this.deletedAt = deletedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /* ========= DOMAIN RULES ========= */

  isDeleted() {
    return this.deletedAt !== null;
  }

  canLogin() {
    return this.isActive && !this.isDeleted();
  }

  isAdmin() {
    return this.role === "ADMIN";
  }

  lock() {
    this.isActive = false;
  }

  unlock() {
    this.isActive = true;
  }

  markDeleted(date = new Date()) {
    this.deletedAt = date;
  }

  /* ========= GETTERS ========= */

  get passwordHash() {
    return this.#passwordHash;
  }

  /* ========= OUTPUT ========= */

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
