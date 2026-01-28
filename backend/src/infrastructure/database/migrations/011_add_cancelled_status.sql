-- Add CANCELLED status to invoice_status enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'CANCELLED' 
    AND enumtypid = 'invoice_status'::regtype
  ) THEN
    ALTER TYPE invoice_status ADD VALUE 'CANCELLED';
  END IF;
END $$;
