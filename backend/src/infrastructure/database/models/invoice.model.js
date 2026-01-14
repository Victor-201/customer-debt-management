import { DataTypes } from "sequelize";

export default (sequelize) =>
  sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      invoice_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      paid_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      balance_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "OVERDUE", "PAID"),
        allowNull: false,
      },
      created_by: DataTypes.UUID,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "invoices",
      timestamps: false,
    }
  );
