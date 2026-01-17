export const USER_PERMISSIONS = Object.freeze({
  READ: "users:read",
  CREATE: "users:create",
  UPDATE: "users:update",
  LOCK: "users:lock",
  DELETE: "users:delete",
});

export const CUSTOMER_PERMISSIONS = Object.freeze({
  READ: "customers:read",
  CREATE: "customers:create",
  UPDATE: "customers:update",
  DELETE: "customers:delete",
});

export const INVOICE_PERMISSIONS = Object.freeze({
  READ: "invoices:read",
  CREATE: "invoices:create",
  UPDATE: "invoices:update",
  DELETE: "invoices:delete",
});

export const DASHBOARD_PERMISSIONS = Object.freeze({
    READ: "dashboard:read",
    VIEW_AR: "dashboard:ar_view",
    VIEW_RISK: "dashboard:risk_view",
})

export const RISK_PERMISSIONS = Object.freeze({
    READ: "risk:read",
    VIEW_HIGH_RISK: "risk:high:view",
    ASSESS: "risk:assess",
    UPDATE_LEVEL: "risk:update"
})

export const PAYMENT_PERMISSIONS = Object.freeze({
  READ: "payments:read",
  CREATE: "payments:create",
  REVERSE: "payments:reverse",
});
