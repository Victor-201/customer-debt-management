import bcrypt from 'bcrypt';
import env from '../../main/config/env.config.js';
import config from 'dotenv';

class PasswordHasher {
  static async hash(password) {
    const saltRounds = Number(config.saltRounds ?? 12);
    return bcrypt.hash(password, saltRounds);
  }

  static async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

export default PasswordHasher;
