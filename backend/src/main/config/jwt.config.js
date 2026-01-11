const config = {
  jwtSecret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'your-super-secret-refresh-key',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  issuer: process.env.JWT_ISSUER ?? 'customer-debt-management',
  audience: process.env.JWT_AUDIENCE ?? 'customer-debt-management-users'
};

export default config;
