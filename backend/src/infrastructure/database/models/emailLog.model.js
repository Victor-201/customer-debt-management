import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "EmailLog",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      customer_id: DataTypes.UUID,
      invoice_id: DataTypes.UUID,
      email_type: {
        type: DataTypes.ENUM("BEFORE_DUE", "OVERDUE_1", "OVERDUE_2"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("SUCCESS", "FAILED"),
        allowNull: false,
      },
      error_message: DataTypes.TEXT,
      sent_at: DataTypes.DATE,
    },
    {
      tableName: "email_logs",
      timestamps: false,
    }
  );
