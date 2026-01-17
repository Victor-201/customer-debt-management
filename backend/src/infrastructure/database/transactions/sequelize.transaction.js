import { sequelize } from "../../../main/config/database.js";

export async function Transaction(fn) {
  const tx = await sequelize.transaction();
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
