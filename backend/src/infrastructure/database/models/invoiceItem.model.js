import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
    class InvoiceItemModel extends Model { }

    InvoiceItemModel.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            invoice_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "invoices",
                    key: "id",
                },
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1
                }
            },
            unit_price: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
            },
            total_price: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "InvoiceItem",
            tableName: "invoice_items",
            timestamps: true,
            underscored: true,
        }
    );

    return InvoiceItemModel;
};
