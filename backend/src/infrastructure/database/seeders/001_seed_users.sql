-- =====================================================
-- SEED USERS
-- =====================================================

BEGIN;

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('System Admin', 'admin@ar-system.com', 'hashed_admin_password', 'ADMIN'),
  ('Main Accountant', 'accountant@ar-system.com', 'hashed_accountant_password', 'ACCOUNTANT')
ON CONFLICT (email) DO NOTHING;

COMMIT;
