CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID REFERENCES customers(id),
  invoice_id UUID REFERENCES invoices(id),

  email_type email_type NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  status email_status NOT NULL,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_customer ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_invoice ON email_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_email_sent_at ON email_logs(sent_at);
