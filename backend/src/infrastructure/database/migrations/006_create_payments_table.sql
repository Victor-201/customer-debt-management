CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),

  payment_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),

  method payment_method NOT NULL,
  reference VARCHAR(100),

  recorded_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_date ON payments(payment_date);
