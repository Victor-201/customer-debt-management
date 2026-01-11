-- =====================================================
-- SEED PAYMENTS (50)
-- =====================================================

BEGIN;

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
  END::payment_method,

  'PAY-' || i.invoice_number,

  (SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1)
FROM invoices i
ORDER BY RANDOM()
LIMIT 50;

COMMIT;
