import { USER_ROLE } from "./enums.js";
import {
  USER_PERMISSIONS,
  CUSTOMER_PERMISSIONS,
  INVOICE_PERMISSIONS,
  PAYMENT_PERMISSIONS
} from "./permissions.js";

export const ROLE_PERMISSIONS = Object.freeze({
  [USER_ROLE.ADMIN]: ["*"],

  [USER_ROLE.ACCOUNTANT]: [
    // Customers
    CUSTOMER_PERMISSIONS.READ,
    CUSTOMER_PERMISSIONS.CREATE,
    CUSTOMER_PERMISSIONS.UPDATE,
    CUSTOMER_PERMISSIONS.DELETE,

    // Invoices
    INVOICE_PERMISSIONS.READ,
    INVOICE_PERMISSIONS.CREATE,
    INVOICE_PERMISSIONS.UPDATE,
    INVOICE_PERMISSIONS.DELETE,

    // Payments
    PAYMENT_PERMISSIONS.READ,
    PAYMENT_PERMISSIONS.CREATE,
    PAYMENT_PERMISSIONS.REVERSE
  ],
});

export const isValidUserRole = (value) =>
  Object.values(USER_ROLE).includes(value);

export const isAdmin = (role) => role === USER_ROLE.ADMIN;

export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  return permissions.includes("*") || permissions.includes(permission);
};

export default {
  ROLE_PERMISSIONS,
  isAdmin,
  hasPermission,
};
