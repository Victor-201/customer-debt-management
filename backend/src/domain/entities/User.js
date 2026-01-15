export default class User {
  #passwordHash;

  constructor({
    id = null,
    name,
    email,
    passwordHash,
    role,
    isActive = true,
    deletedAt = null,
    createdAt,
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

  /* ========= FACTORY ========= */

  static create({ name, email, passwordHash, role }) {
    return new User({
      name,
      email,
      passwordHash,
      role,
      isActive: true,
      createdAt: new Date(),
    });
  }

  static restore(persistedData) {
    return new User(persistedData);
  }

  /* ========= DOMAIN ========= */

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
    if (this.isDeleted()) {
      throw new Error("Cannot lock a deleted user");
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  unlock() {
    if (this.isDeleted()) {
      throw new Error("Cannot unlock a deleted user");
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  markDeleted(date = new Date()) {
    this.deletedAt = date;
    this.isActive = false;
    this.updatedAt = date;
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
