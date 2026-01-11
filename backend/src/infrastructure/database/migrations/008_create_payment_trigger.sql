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

DROP TRIGGER IF EXISTS trg_after_payment_insert ON payments;

CREATE TRIGGER trg_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION fn_recalc_invoice_after_payment();
