DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'ACCOUNTANT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_term') THEN
    CREATE TYPE payment_term AS ENUM ('NET_7', 'NET_15', 'NET_30');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_risk_level') THEN
    CREATE TYPE customer_risk_level AS ENUM ('NORMAL', 'WARNING', 'HIGH_RISK');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_status') THEN
    CREATE TYPE customer_status AS ENUM ('ACTIVE', 'INACTIVE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('PENDING', 'OVERDUE', 'PAID');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'REVERSAL');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type') THEN
    CREATE TYPE email_type AS ENUM ('BEFORE_DUE', 'OVERDUE_1', 'OVERDUE_2');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
    CREATE TYPE email_status AS ENUM ('SUCCESS', 'FAILED');
  END IF;
END $$;
