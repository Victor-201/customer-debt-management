class User {
  constructor({
    id,
    name,
    email,
    passwordHash,
    role,
    isActive,
    createdAt,
    updatedAt
  }) {
    this.id = id ?? null;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role; // 'ADMIN' | 'ACCOUNTANT'
    this.isActive = isActive ?? true;
    this.createdAt = createdAt ?? null;
    this.updatedAt = updatedAt ?? null;
  }

  static create({ name, email, passwordHash, role }) {
    if (!['ADMIN', 'ACCOUNTANT'].includes(role)) {
      throw new Error('Invalid user role');
    }

    return new User({
      name,
      email,
      passwordHash,
      role,
      isActive: true
    });
  }

  update({ name, email, role, isActive }) {
    if (name !== undefined) this.name = name;
    if (email !== undefined) this.email = email;

    if (role !== undefined) {
      if (!['ADMIN', 'ACCOUNTANT'].includes(role)) {
        throw new Error('Invalid user role');
      }
      this.role = role;
    }

    if (isActive !== undefined) this.isActive = isActive;
  }

  lock() {
    this.isActive = false;
  }

  unlock() {
    this.isActive = true;
  }

  isAdmin() {
    return this.role === 'ADMIN';
  }

  isAccountant() {
    return this.role === 'ACCOUNTANT';
  }
}

export default User;
