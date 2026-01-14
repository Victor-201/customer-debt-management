import bcrypt from "bcrypt";
import env from "../../main/config/env.config.js";
import config from "dotenv";

class PasswordHasher {
  async hash(password) {
    const saltRounds = Number(env.saltRounds ?? 12);
    return bcrypt.hash(password, saltRounds);
  }

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

export default PasswordHasher;
