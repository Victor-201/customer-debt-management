import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Customer",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: DataTypes.STRING(150),
      phone: DataTypes.STRING(50),
      address: DataTypes.TEXT,
      payment_term: {
        type: DataTypes.ENUM("NET_7", "NET_15", "NET_30"),
        allowNull: false,
      },
      credit_limit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      risk_level: {
        type: DataTypes.ENUM("NORMAL", "WARNING", "HIGH_RISK"),
        defaultValue: "NORMAL",
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    { tableName: "customers", timestamps: false }
  );
