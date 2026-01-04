-- =====================================================
-- ACCOUNTS RECEIVABLE MANAGEMENT SYSTEM
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM DEFINITIONS
-- =====================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'ACCOUNTANT');

CREATE TYPE payment_term AS ENUM ('NET_7', 'NET_15', 'NET_30');

CREATE TYPE customer_risk_level AS ENUM (
  'NORMAL',
  'WARNING',
  'HIGH_RISK'
);

CREATE TYPE customer_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE invoice_status AS ENUM (
  'PENDING',
  'OVERDUE',
  'PAID'
);

CREATE TYPE payment_method AS ENUM (
  'CASH',
  'BANK_TRANSFER'
);

CREATE TYPE email_type AS ENUM (
  'BEFORE_DUE',
  'OVERDUE_1',
  'OVERDUE_2'
);

CREATE TYPE email_status AS ENUM (
  'SUCCESS',
  'FAILED'
);

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CUSTOMERS (TRUNG TÂM CÔNG NỢ)
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,

  payment_term payment_term NOT NULL,
  credit_limit NUMERIC(15,2) NOT NULL CHECK (credit_limit >= 0),

  risk_level customer_risk_level DEFAULT 'NORMAL',
  status customer_status DEFAULT 'ACTIVE',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INVOICES – LINH HỒN HỆ AR
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),

  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,

  total_amount NUMERIC(15,2) NOT NULL CHECK (total_amount > 0),
  paid_amount NUMERIC(15,2) DEFAULT 0 CHECK (paid_amount >= 0),
  balance_amount NUMERIC(15,2) NOT NULL CHECK (balance_amount >= 0),

  status invoice_status NOT NULL,

  created_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT invoice_balance_rule
    CHECK (balance_amount = total_amount - paid_amount)
);

-- =====================================================
-- PAYMENTS – GIẢM CÔNG NỢ
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),

  payment_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),

  method payment_method NOT NULL,
  reference VARCHAR(100),

  recorded_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMAIL LOGS – NHẮC NỢ & AUDIT
-- =====================================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID REFERENCES customers(id),
  invoice_id UUID REFERENCES invoices(id),

  email_type email_type NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  status email_status NOT NULL,
  error_message TEXT
);

-- =====================================================
-- INDEXES (HIỆU NĂNG REPORT & DASHBOARD)
-- =====================================================
CREATE INDEX idx_invoice_customer ON invoices(customer_id);
CREATE INDEX idx_invoice_due_date ON invoices(due_date);
CREATE INDEX idx_invoice_status ON invoices(status);

CREATE INDEX idx_payment_invoice ON payments(invoice_id);

CREATE INDEX idx_email_customer ON email_logs(customer_id);
CREATE INDEX idx_email_invoice ON email_logs(invoice_id);

-- =====================================================
-- TRIGGER: CẬP NHẬT INVOICE KHI CÓ PAYMENT
-- =====================================================
CREATE OR REPLACE FUNCTION fn_recalc_invoice_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    paid_amount = paid_amount + NEW.amount,
    balance_amount = total_amount - (paid_amount + NEW.amount),
    status = CASE
      WHEN total_amount - (paid_amount + NEW.amount) = 0 THEN 'PAID'
      ELSE status
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION fn_recalc_invoice_after_payment();

-- =====================================================
-- VIEW: AGING DAYS (CƠ SỞ TÍNH TUỔI NỢ)
-- =====================================================
CREATE OR REPLACE VIEW vw_invoice_aging_days AS
SELECT
  i.id,
  i.invoice_number,
  i.customer_id,
  i.balance_amount,
  GREATEST(0, CURRENT_DATE - i.due_date) AS days_overdue
FROM invoices i
WHERE i.balance_amount > 0;

-- =====================================================
-- VIEW: AGING BUCKET REPORT
-- =====================================================
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

-- =====================================================
-- VIEW: TOTAL AR
-- =====================================================
CREATE OR REPLACE VIEW vw_total_ar AS
SELECT SUM(balance_amount) AS total_receivable
FROM invoices
WHERE balance_amount > 0;

-- =====================================================
-- VIEW: OVERDUE AR
-- =====================================================
CREATE OR REPLACE VIEW vw_overdue_ar AS
SELECT SUM(balance_amount) AS overdue_receivable
FROM invoices
WHERE status = 'OVERDUE';

-- =====================================================
-- VIEW: HIGH RISK CUSTOMERS (PHỤC VỤ DASHBOARD)
-- =====================================================
CREATE OR REPLACE VIEW vw_high_risk_customers AS
SELECT *
FROM customers
WHERE risk_level = 'HIGH_RISK';

-- =====================================================
-- BUSINESS NOTE (ĐỂ THUYẾT TRÌNH)
-- =====================================================
-- 1. KHÔNG lưu công nợ trực tiếp ở customer
-- 2. Công nợ phát sinh từ invoice
-- 3. Payment chỉ làm giảm công nợ
-- 4. Aging & Risk là kết quả tính toán
-- 5. Thiết kế đúng chuẩn ERP & Clean Architecture
