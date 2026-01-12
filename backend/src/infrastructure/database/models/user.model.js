import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserModel = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },

      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("ADMIN", "ACCOUNTANT"),
        allowNull: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          name: "idx_users_email",
          unique: true,
          fields: ["email"],
        },
        {
          name: "idx_users_deleted_at",
          fields: ["deleted_at"],
        },
      ],
    }
  );

  return UserModel;
};
