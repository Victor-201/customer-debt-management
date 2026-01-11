-- =====================================================
-- SEED INVOICES (75)
-- =====================================================

BEGIN;

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
  END::invoice_status,

  (SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1)
FROM customers c
CROSS JOIN generate_series(1, 3) i;

COMMIT;
