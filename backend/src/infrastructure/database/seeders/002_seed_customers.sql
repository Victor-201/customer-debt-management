-- =====================================================
-- SEED CUSTOMERS (25)
-- =====================================================

BEGIN;

INSERT INTO customers (
  name,
  email,
  phone,
  address,
  payment_term,
  credit_limit,
  risk_level,
  status
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
  END::payment_term,

  30000000 + (i * 1000000),

  CASE
    WHEN i % 7 = 0 THEN 'HIGH_RISK'
    WHEN i % 4 = 0 THEN 'WARNING'
    ELSE 'NORMAL'
  END::customer_risk_level,

  'ACTIVE'::customer_status
FROM generate_series(1, 25) i;

COMMIT;
