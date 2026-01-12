class User {
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
    this.passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  static create({ name, email, passwordHash, role }) {
    return new User({ name, email, passwordHash, role });
  }

  isAdmin() {
    return this.role === "ADMIN";
  }

  isDeleted() {
    return this.deletedAt !== null;
  }
}

export default User;
