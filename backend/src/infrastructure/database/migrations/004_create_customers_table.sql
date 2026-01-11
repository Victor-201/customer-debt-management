CREATE TABLE IF NOT EXISTS customers (
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

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
