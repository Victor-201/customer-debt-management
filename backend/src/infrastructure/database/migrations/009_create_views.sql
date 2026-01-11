CREATE OR REPLACE VIEW vw_invoice_aging_days AS
SELECT
  i.id,
  i.invoice_number,
  i.customer_id,
  i.balance_amount,
  GREATEST(0, CURRENT_DATE - i.due_date) AS days_overdue
FROM invoices i
WHERE i.balance_amount > 0;

CREATE OR REPLACE VIEW vw_aging_report AS
SELECT
  customer_id,
  CASE
    WHEN days_overdue BETWEEN 0 AND 30 THEN '0-30'
    WHEN days_overdue BETWEEN 31 AND 60 THEN '31-60'
    WHEN days_overdue BETWEEN 61 AND 90 THEN '61-90'
    ELSE '>90'
  END AS aging_bucket,
  SUM(balance_amount) AS total_amount
FROM vw_invoice_aging_days
GROUP BY customer_id, aging_bucket;

CREATE OR REPLACE VIEW vw_total_ar AS
SELECT SUM(balance_amount) AS total_receivable
FROM invoices
WHERE balance_amount > 0;

CREATE OR REPLACE VIEW vw_overdue_ar AS
SELECT SUM(balance_amount) AS overdue_receivable
FROM invoices
WHERE status = 'OVERDUE';

CREATE OR REPLACE VIEW vw_high_risk_customers AS
SELECT *
FROM customers
WHERE risk_level = 'HIGH_RISK';
