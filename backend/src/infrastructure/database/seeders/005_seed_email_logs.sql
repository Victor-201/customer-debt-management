-- =====================================================
-- SEED EMAIL LOGS (40)
-- =====================================================

BEGIN;

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
  END::email_type,

  CURRENT_TIMESTAMP - INTERVAL '1 day',

  'SUCCESS'::email_status,
  NULL
FROM invoices i
WHERE i.status <> 'PAID'
LIMIT 40;

COMMIT;
