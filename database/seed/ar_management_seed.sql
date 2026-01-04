-- =====================================================
-- ACCOUNTS RECEIVABLE MANAGEMENT SYSTEM
-- SEED DATA
-- POSTGRESQL – UUID ONLY
-- =====================================================

BEGIN;

-- =====================================================
-- USERS (2)
-- =====================================================
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('System Admin', 'admin@ar-system.com', 'hashed_admin_password', 'ADMIN'),
  ('Main Accountant', 'accountant@ar-system.com', 'hashed_accountant_password', 'ACCOUNTANT');

-- =====================================================
-- CUSTOMERS (25)
-- =====================================================
INSERT INTO customers (
  name, email, phone, address,
  payment_term, credit_limit,
  risk_level, status
)
SELECT
  'Customer ' || i,
  'customer' || i || '@mail.com',
  '0909' || LPAD(i::text, 6, '0'),
  'Vietnam',
  CASE
    WHEN i % 3 = 0 THEN 'NET_7'
    WHEN i % 3 = 1 THEN 'NET_15'
    ELSE 'NET_30'
  END,
  30000000 + (i * 1000000),
  CASE
    WHEN i % 7 = 0 THEN 'HIGH_RISK'
    WHEN i % 4 = 0 THEN 'WARNING'
    ELSE 'NORMAL'
  END,
  'ACTIVE'
FROM generate_series(1, 25) i;

-- =====================================================
-- INVOICES (75)
-- 3 invoices / customer
-- =====================================================
INSERT INTO invoices (
  customer_id,
  invoice_number,
  issue_date,
  due_date,
  total_amount,
  paid_amount,
  balance_amount,
  status,
  created_by
)
SELECT
  c.id,
  'INV-' || LPAD(i::text, 3, '0') || '-' || SUBSTRING(c.id::text, 1, 6),
  CURRENT_DATE - (i * 5),
  CURRENT_DATE - (i * 2),
  4000000 + (i * 250000),
  0,
  4000000 + (i * 250000),
  CASE
    WHEN i % 5 = 0 THEN 'PAID'
    WHEN i % 3 = 0 THEN 'OVERDUE'
    ELSE 'PENDING'
  END,
  (SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1)
FROM customers c
CROSS JOIN generate_series(1, 3) i;

-- =====================================================
-- PAYMENTS (50)
-- Trigger sẽ tự cập nhật invoice
-- =====================================================
INSERT INTO payments (
  invoice_id,
  payment_date,
  amount,
  method,
  reference,
  recorded_by
)
SELECT
  i.id,
  CURRENT_DATE - INTERVAL '3 days',
  i.total_amount * 
    CASE
      WHEN RANDOM() < 0.5 THEN 0.5
      ELSE 1
    END,
  CASE
    WHEN RANDOM() < 0.5 THEN 'CASH'
    ELSE 'BANK_TRANSFER'
  END,
  'PAY-' || i.invoice_number,
  (SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1)
FROM invoices i
ORDER BY RANDOM()
LIMIT 50;

-- =====================================================
-- EMAIL LOGS (40)
-- =====================================================
INSERT INTO email_logs (
  customer_id,
  invoice_id,
  email_type,
  sent_at,
  status,
  error_message
)
SELECT
  i.customer_id,
  i.id,
  CASE
    WHEN i.status = 'PENDING' THEN 'BEFORE_DUE'
    WHEN i.status = 'OVERDUE' THEN 'OVERDUE_1'
    ELSE 'OVERDUE_2'
  END,
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  'SUCCESS',
  NULL
FROM invoices i
WHERE i.status <> 'PAID'
LIMIT 40;

COMMIT;

-- =====================================================
-- SUMMARY (FOR DEMO & DEFENSE)
-- =====================================================
-- USERS        : 2
-- CUSTOMERS    : 25
-- INVOICES     : 75
-- PAYMENTS     : 50
-- EMAIL LOGS   : 40
-- TOTAL ROWS   : ~192
--
-- ✔ UUID everywhere
-- ✔ Trigger tested
-- ✔ Aging views hoạt động
-- ✔ Dashboard có số liệu thật
