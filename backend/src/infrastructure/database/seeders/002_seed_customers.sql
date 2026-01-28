-- =====================================================
-- SEED CUSTOMERS (25) - Improved for Demo
-- Vietnamese company names for realistic demo
-- =====================================================

BEGIN;

-- Clear existing customers if any
DELETE FROM customers WHERE name LIKE 'Customer %';

INSERT INTO customers (
  name,
  email,
  phone,
  address,
  payment_term,
  credit_limit,
  risk_level,
  status
) VALUES
  -- Large Enterprises (High Credit Limit)
  ('Công ty TNHH Thép Việt Nam', 'ketoan@thepvietnam.vn', '0901234001', 'Quận 7, TP.HCM', 'NET_30', 500000000, 'NORMAL', 'ACTIVE'),
  ('CTCP Điện tử Phong Vũ', 'congno@phongvu.vn', '0901234002', 'Quận 1, TP.HCM', 'NET_15', 300000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Xây dựng Hòa Bình', 'finance@hoabinh.com.vn', '0901234003', 'Quận Bình Thạnh, TP.HCM', 'NET_30', 800000000, 'NORMAL', 'ACTIVE'),
  ('CTCP Thực phẩm Masan', 'accounting@masan.com.vn', '0901234004', 'Quận 2, TP.HCM', 'NET_30', 1000000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Nội thất IKEA', 'ketoan@ikea.vn', '0901234005', 'Quận 7, TP.HCM', 'NET_15', 450000000, 'NORMAL', 'ACTIVE'),

  -- Medium Enterprises  
  ('CTCP Vật liệu Xây dựng Miền Nam', 'congno@vlxdmiennam.vn', '0901234006', 'Quận Gò Vấp, TP.HCM', 'NET_15', 150000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Công nghệ FPT Software', 'ar@fpt.com.vn', '0901234007', 'Quận Cầu Giấy, Hà Nội', 'NET_30', 200000000, 'NORMAL', 'ACTIVE'),
  ('CTCP Dược phẩm Hậu Giang', 'finance@dhg.com.vn', '0901234008', 'TP. Cần Thơ', 'NET_30', 180000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Điện máy Nguyễn Kim', 'ketoan@nguyenkim.com', '0901234009', 'Quận 10, TP.HCM', 'NET_7', 250000000, 'NORMAL', 'ACTIVE'),
  ('CTCP Bán lẻ Thế Giới Di Động', 'ar@thegioididong.com', '0901234010', 'Quận 4, TP.HCM', 'NET_15', 350000000, 'NORMAL', 'ACTIVE'),

  -- Small Companies (Some with warning/high risk)
  ('Công ty TNHH Vận tải Minh Phát', 'minhphat.ketoan@gmail.com', '0901234011', 'Quận 12, TP.HCM', 'NET_7', 80000000, 'WARNING', 'ACTIVE'),
  ('DNTN Cửa hàng Kim Khí Thành Đạt', 'thanhdat.kimkhi@gmail.com', '0901234012', 'Quận Tân Bình, TP.HCM', 'NET_7', 50000000, 'HIGH_RISK', 'ACTIVE'),
  ('Công ty TNHH TM Hoàng Long', 'hoanglong.tm@gmail.com', '0901234013', 'Quận Bình Tân, TP.HCM', 'NET_15', 60000000, 'WARNING', 'ACTIVE'),
  ('CTCP May mặc Xuất khẩu Việt Tiến', 'finance@viettien.com.vn', '0901234014', 'Quận Tân Phú, TP.HCM', 'NET_30', 120000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Nhựa Đại Phát', 'ketoan@nhuadaiphat.vn', '0901234015', 'Bình Dương', 'NET_15', 90000000, 'HIGH_RISK', 'ACTIVE'),

  -- Additional companies
  ('CTCP Gạch men Viglacera', 'ar@viglacera.com.vn', '0901234016', 'Hà Nội', 'NET_30', 220000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Kính Việt Nhật', 'kinhvietnhat.fn@gmail.com', '0901234017', 'Đồng Nai', 'NET_15', 75000000, 'NORMAL', 'ACTIVE'),
  ('CTCP Sữa Việt Nam Vinamilk', 'congno@vinamilk.com.vn', '0901234018', 'Quận 7, TP.HCM', 'NET_30', 500000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH Giày dép Biti''s', 'ar@bitis.com.vn', '0901234019', 'Quận 6, TP.HCM', 'NET_15', 160000000, 'NORMAL', 'ACTIVE'),
  ('CTCP Nhà thép tiền chế Zamil', 'accounting@zamil.vn', '0901234020', 'Bình Dương', 'NET_30', 280000000, 'NORMAL', 'ACTIVE'),

  -- Companies with issues (for demo overdue scenarios)
  ('Công ty TNHH Thương mại ABC', 'abc.thuongmai@gmail.com', '0901234021', 'Quận 3, TP.HCM', 'NET_7', 40000000, 'HIGH_RISK', 'ACTIVE'),
  ('DNTN Điện tử Minh Tuấn', 'minhtuan.dt@gmail.com', '0901234022', 'Quận Phú Nhuận, TP.HCM', 'NET_7', 35000000, 'WARNING', 'ACTIVE'),
  ('Công ty TNHH Cơ khí Thành Công', 'cokhi.thanhcong@gmail.com', '0901234023', 'Đồng Nai', 'NET_15', 55000000, 'WARNING', 'ACTIVE'),
  ('CTCP Thép không gỉ Inox Việt', 'inoxviet.ketoan@gmail.com', '0901234024', 'Long An', 'NET_30', 95000000, 'NORMAL', 'ACTIVE'),
  ('Công ty TNHH DV Du lịch Saigontourist', 'ar@saigontourist.com.vn', '0901234025', 'Quận 1, TP.HCM', 'NET_30', 180000000, 'NORMAL', 'ACTIVE');

COMMIT;
