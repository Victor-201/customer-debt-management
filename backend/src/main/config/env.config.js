import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 12,

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'customer_debt_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'customer-debt-management',
    audience: process.env.JWT_AUDIENCE || 'customer-debt-management-users',
  },

  email: {
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT, 10) || 587,
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
  },
};

export default config;
