-- =====================================================
-- SEED USERS
-- =====================================================

BEGIN;

-- Password for both users is: Admin@123
-- Hash generated with bcrypt, 10 rounds
INSERT INTO users (name, email, password_hash, role)
VALUES
  ('System Admin', 'admin@ar-system.com', '$2b$10$gVJIoF2qetVPXrWaSBYNSe6rtYMM2KgSyb0L1C.lOwPUxhqQfhMha', 'ADMIN'),
  ('Main Accountant', 'accountant@ar-system.com', '$2b$10$gVJIoF2qetVPXrWaSBYNSe6rtYMM2KgSyb0L1C.lOwPUxhqQfhMha', 'ACCOUNTANT')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

COMMIT;
