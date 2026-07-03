import { Sequelize } from "sequelize";
import config from "./env.config.js";

/* ===== INIT SEQUELIZE ===== */
export const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "postgres",
    logging: false,
    ...(config.nodeEnv === "production" && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
  }
);

/* ===== IMPORT MODELS ===== */
import initCustomer from "../../infrastructure/database/models/customer.model.js";
import initInvoice from "../../infrastructure/database/models/invoice.model.js";
import initPayment from "../../infrastructure/database/models/payment.model.js";
import initEmailLog from "../../infrastructure/database/models/emailLog.model.js";
import initUser from "../../infrastructure/database/models/user.model.js";

/* ===== INIT MODELS ===== */
export const Customer = initCustomer(sequelize);
export const Invoice = initInvoice(sequelize);
export const Payment = initPayment(sequelize);
export const EmailLog = initEmailLog(sequelize);
export const User = initUser(sequelize);

/* ===== DEFINE ASSOCIATIONS ===== */

/* Customers – Invoices */
Customer.hasMany(Invoice, {
  foreignKey: "customer_id",
  as: "Invoices",
});
Invoice.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "Customer",
});

/* Invoices – Payments */
Invoice.hasMany(Payment, {
  foreignKey: "invoice_id",
  as: "Payments",
});
Payment.belongsTo(Invoice, {
  foreignKey: "invoice_id",
  as: "Invoice",
});

/* Customers – EmailLogs */
Customer.hasMany(EmailLog, {
  foreignKey: "customer_id",
  as: "EmailLogs",
});
EmailLog.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "Customer",
});

/* Invoices – EmailLogs */
Invoice.hasMany(EmailLog, {
  foreignKey: "invoice_id",
  as: "EmailLogs",
});
EmailLog.belongsTo(Invoice, {
  foreignKey: "invoice_id",
  as: "Invoice",
});

/* Users – Invoices */
User.hasMany(Invoice, {
  foreignKey: "created_by",
  as: "CreatedInvoices",
});
Invoice.belongsTo(User, {
  foreignKey: "created_by",
  as: "Creator",
});

/* Users – Payments */
User.hasMany(Payment, {
  foreignKey: "recorded_by",
  as: "RecordedPayments",
});
Payment.belongsTo(User, {
  foreignKey: "recorded_by",
  as: "Recorder",
});

/* ===== CONNECTION HELPERS ===== */
export async function connectDatabase() {
  await sequelize.authenticate();
  console.log("✅ Database connected (Sequelize)");
}

export async function closeDatabase() {
  await sequelize.close();
}
