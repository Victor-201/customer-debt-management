-- =====================================================
-- SEED INVOICES (75) - Improved for Demo
-- Mix of pending, paid, overdue, and draft invoices
-- Some with future due dates for realistic demo
-- =====================================================

BEGIN;

-- Helper: Get customer IDs for reference
WITH customer_ids AS (
  SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM customers
),
accountant_id AS (
  SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1
)

-- Create realistic invoices with varied statuses and dates
INSERT INTO invoices (
  customer_id,
  invoice_number,
  issue_date,
  due_date,
  total_amount,
  paid_amount,
  balance_amount,
  status,
  notes,
  created_by
)
SELECT
  c.id,
  'INV-' || TO_CHAR(CURRENT_DATE - (i.offset_days || ' days')::interval, 'YYYYMM') || '-' || LPAD(i.seq::text, 3, '0'),
  CURRENT_DATE - (i.offset_days || ' days')::interval,
  CURRENT_DATE + (i.due_offset || ' days')::interval,
  i.amount,
  CASE 
    WHEN i.status_type = 'PAID' THEN i.amount
    WHEN i.status_type = 'PARTIAL' THEN FLOOR(i.amount * 0.3)
    ELSE 0
  END,
  CASE 
    WHEN i.status_type = 'PAID' THEN 0
    WHEN i.status_type = 'PARTIAL' THEN i.amount - FLOOR(i.amount * 0.3)
    ELSE i.amount
  END,
  i.status_type::invoice_status,
  i.notes,
  (SELECT id FROM accountant_id)
FROM customer_ids c
CROSS JOIN (
  VALUES
    -- Recent invoices (this month) - Various statuses
    (1, 1, 5, 25, 15000000, 'PENDING', 'Đơn hàng thiết bị văn phòng'),
    (2, 2, 3, 27, 28500000, 'PENDING', 'Laptop và phụ kiện'),
    (3, 3, 7, 23, 45000000, 'PAID', 'Máy chủ Dell PowerEdge'),
    (4, 4, 10, 20, 12000000, 'PENDING', 'Màn hình và bàn phím'),
    (5, 5, 2, 28, 8500000, 'DRAFT', 'Đang chờ xác nhận'),
    
    -- Invoices due soon (next 7 days)
    (6, 6, 20, 5, 22000000, 'PENDING', 'Thiết bị mạng Cisco'),
    (7, 7, 25, 3, 18500000, 'PENDING', 'Camera an ninh'),
    (8, 8, 28, 2, 9000000, 'PENDING', 'Ổ cứng SSD Samsung'),
    
    -- Partially paid
    (9, 9, 30, -5, 35000000, 'PARTIAL', 'Đã thanh toán 30% đợt 1'),
    (10, 10, 35, -10, 42000000, 'PARTIAL', 'Đang chờ đợt thanh toán cuối'),
    
    -- Overdue invoices (negative due_offset = past due)
    (11, 11, 45, -15, 25000000, 'OVERDUE', 'Quá hạn - cần theo dõi'),
    (12, 12, 50, -20, 18000000, 'OVERDUE', 'Đã liên hệ khách hàng'),
    (13, 13, 60, -30, 55000000, 'OVERDUE', 'Chuyển bộ phận thu hồi nợ'),
    
    -- Old paid invoices (for history)
    (14, 14, 90, -60, 32000000, 'PAID', 'Thanh toán đầy đủ'),
    (15, 15, 85, -55, 28000000, 'PAID', 'Thanh toán đúng hạn'),
    (16, 16, 80, -50, 15500000, 'PAID', NULL),
    (17, 17, 75, -45, 22500000, 'PAID', NULL),
    (18, 18, 70, -40, 19000000, 'PAID', NULL),
    
    -- Cancelled invoices
    (19, 19, 40, -10, 8000000, 'CANCELLED', 'Khách hàng hủy đơn'),
    
    -- More recent pending/draft for demo
    (20, 20, 1, 29, 67000000, 'PENDING', 'Dự án IT lớn'),
    (21, 21, 0, 30, 125000000, 'DRAFT', 'Chờ ký hợp đồng'),
    (22, 22, 4, 26, 38000000, 'PENDING', 'Nội thất văn phòng'),
    (23, 23, 6, 24, 16500000, 'PENDING', 'Thiết bị điện'),
    (24, 24, 8, 22, 21000000, 'PENDING', 'Máy in và mực in'),
    (25, 25, 12, 18, 9500000, 'PENDING', 'Phần mềm license')
) AS i(customer_rn, seq, offset_days, due_offset, amount, status_type, notes)
WHERE c.rn = i.customer_rn;

-- Add more invoices for customers with multiple orders
INSERT INTO invoices (
  customer_id,
  invoice_number,
  issue_date,
  due_date,
  total_amount,
  paid_amount,
  balance_amount,
  status,
  notes,
  created_by
)
SELECT
  c.id,
  'INV-' || TO_CHAR(CURRENT_DATE - (i.offset_days || ' days')::interval, 'YYYYMM') || '-' || LPAD((50 + i.seq)::text, 3, '0'),
  CURRENT_DATE - (i.offset_days || ' days')::interval,
  CURRENT_DATE + (i.due_offset || ' days')::interval,
  i.amount,
  CASE WHEN i.status_type = 'PAID' THEN i.amount ELSE 0 END,
  CASE WHEN i.status_type = 'PAID' THEN 0 ELSE i.amount END,
  i.status_type::invoice_status,
  i.notes,
  (SELECT id FROM users WHERE role = 'ACCOUNTANT' LIMIT 1)
FROM customer_ids c
CROSS JOIN (
  VALUES
    -- Second orders from good customers
    (1, 1, 60, -30, 12000000, 'PAID', 'Đơn hàng bổ sung Q3'),
    (2, 2, 45, -15, 8500000, 'PAID', 'Phụ kiện laptop'),
    (3, 3, 30, 0, 25000000, 'PENDING', 'Đơn hàng Q4'),
    (4, 4, 15, 15, 18000000, 'PENDING', 'Thiết bị mới'),
    (5, 5, 55, -25, 11000000, 'PAID', 'Đơn hàng tháng 10'),
    
    -- Third orders
    (1, 6, 120, -90, 20000000, 'PAID', 'Đơn hàng Q2'),
    (2, 7, 100, -70, 15000000, 'PAID', 'Đơn hàng Q2'),
    (3, 8, 85, -55, 30000000, 'PAID', 'Đơn hàng lớn Q2')
) AS i(customer_rn, seq, offset_days, due_offset, amount, status_type, notes)
WHERE c.rn = i.customer_rn;

COMMIT;
