import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      invoice_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM("CASH", "BANK_TRANSFER"),
        allowNull: false,
      },
      reference: DataTypes.STRING(100),
      recorded_by: DataTypes.UUID,
      created_at: DataTypes.DATE,
    },
    { tableName: "payments", timestamps: false }
  );
