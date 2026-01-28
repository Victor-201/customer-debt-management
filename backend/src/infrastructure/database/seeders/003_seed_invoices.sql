-- =====================================================
-- SEED INVOICES - Simple version matching DB schema
-- Schema only has: PENDING, OVERDUE, PAID statuses
-- No 'notes' column in invoices table
-- =====================================================

BEGIN;

-- Delete existing invoices first
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Insert invoices without notes column
INSERT INTO invoices (
  id,
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
  gen_random_uuid(),
  c.id,
  'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(ROW_NUMBER() OVER()::text, 3, '0'),
  CURRENT_DATE - (random() * 60)::integer,
  CURRENT_DATE + (random() * 30 - 15)::integer,
  amount,
  paid,
  amount - paid,
  CASE 
    WHEN paid >= amount THEN 'PAID'::invoice_status
    WHEN CURRENT_DATE > CURRENT_DATE + (random() * 30 - 15)::integer THEN 'OVERDUE'::invoice_status
    ELSE 'PENDING'::invoice_status
  END,
  (SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1)
FROM customers c
CROSS JOIN (
  VALUES
    (15000000, 0),
    (28500000, 0),
    (45000000, 45000000),
    (12000000, 0),
    (22000000, 0),
    (18500000, 0),
    (35000000, 10500000),
    (25000000, 0),
    (18000000, 0),
    (32000000, 32000000)
) AS invoice_data(amount, paid)
LIMIT 30;

COMMIT;
