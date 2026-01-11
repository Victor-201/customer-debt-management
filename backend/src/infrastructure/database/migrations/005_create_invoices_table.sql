CREATE TABLE IF NOT EXISTS invoices (
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

CREATE INDEX IF NOT EXISTS idx_invoice_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);
