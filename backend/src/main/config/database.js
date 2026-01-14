import { Sequelize } from "sequelize";
import config from "./env.config.js";

export const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "postgres",
    logging: false,
  }
);

export async function connectDatabase() {
  await sequelize.authenticate();
  console.log("Database connected (Sequelize)");
}

export async function closeDatabase() {
  await sequelize.close();
}
