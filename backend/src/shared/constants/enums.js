export const USER_ROLE = Object.freeze({
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
});

export const PAYMENT_TERM = Object.freeze({
  NET_7: 'NET_7',
  NET_15: 'NET_15',
  NET_30: 'NET_30',
});

export const CUSTOMER_RISK_LEVEL = Object.freeze({
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  HIGH_RISK: 'HIGH_RISK',
});

export const CUSTOMER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
});

export const INVOICE_STATUS = Object.freeze({
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
  PAID: 'PAID',
});

export const PAYMENT_METHOD = Object.freeze({
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
});

export const EMAIL_TYPE = Object.freeze({
  BEFORE_DUE: 'BEFORE_DUE',
  OVERDUE_1: 'OVERDUE_1',
  OVERDUE_2: 'OVERDUE_2',
});

export const EMAIL_STATUS = Object.freeze({
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
});
