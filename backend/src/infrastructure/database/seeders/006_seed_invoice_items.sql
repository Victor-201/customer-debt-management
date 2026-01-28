-- =====================================================
-- SEED INVOICE ITEMS
-- =====================================================
-- This seed creates invoice items for all existing invoices
-- Each invoice gets 2-4 random items with realistic product data

BEGIN;

-- Product templates for randomization
WITH product_data AS (
  SELECT * FROM (VALUES
    ('Laptop Dell XPS 13', 15000000),
    ('Màn hình LG 27 inch', 5000000),
    ('Bàn phím cơ Keychron K2', 2000000),
    ('Chuột Logitech MX Master 3', 1800000),
    ('Tai nghe Sony WH-1000XM5', 7000000),
    ('Webcam Logitech C920', 1500000),
    ('USB Hub Anker 7-Port', 800000),
    ('Adapter USB-C to HDMI', 300000),
    ('Ổ cứng SSD Samsung 1TB', 3000000),
    ('RAM DDR4 16GB Corsair', 1500000),
    ('CPU Intel Core i7', 8000000),
    ('Mainboard ASUS ROG', 5000000),
    ('Card màn hình RTX 3060', 10000000),
    ('Nguồn máy tính Cooler Master 650W', 2000000),
    ('Case máy tính NZXT H510', 1800000)
  ) AS t(description, unit_price)
),
invoice_items_data AS (
  SELECT 
    i.id as invoice_id,
    pd.description,
    (FLOOR(RANDOM() * 5) + 1)::integer as quantity,
    pd.unit_price,
    ROW_NUMBER() OVER (PARTITION BY i.id ORDER BY RANDOM()) as item_rank
  FROM invoices i
  CROSS JOIN product_data pd
  WHERE RANDOM() < 0.3  -- 30% chance for each product-invoice combination
)
INSERT INTO invoice_items (
  invoice_id,
  description,
  quantity,
  unit_price,
  total_price,
  created_at,
  updated_at
)
SELECT 
  invoice_id,
  description,
  quantity,
  unit_price,
  (quantity * unit_price) as total_price,
  NOW(),
  NOW()
FROM invoice_items_data
WHERE item_rank <= 4;  -- Limit to max 4 items per invoice

-- Update invoice totals based on items
-- For PAID invoices, set paid_amount = total_amount and balance = 0
-- For others, ensure balance is not negative
UPDATE invoices i
SET 
  total_amount = COALESCE(items_total.total, 0),
  paid_amount = CASE 
    WHEN i.status = 'PAID' THEN COALESCE(items_total.total, 0)
    ELSE LEAST(COALESCE(i.paid_amount, 0), COALESCE(items_total.total, 0))
  END,
  balance_amount = CASE 
    WHEN i.status = 'PAID' THEN 0
    ELSE GREATEST(0, COALESCE(items_total.total, 0) - COALESCE(i.paid_amount, 0))
  END,
  updated_at = NOW()
FROM (
  SELECT 
    invoice_id,
    SUM(total_price) as total
  FROM invoice_items
  GROUP BY invoice_id
) items_total
WHERE i.id = items_total.invoice_id;

COMMIT;
