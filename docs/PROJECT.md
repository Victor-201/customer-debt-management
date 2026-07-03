
## 1. TỔNG QUAN DỰ ÁN

### 1.1. Thông tin cơ bản
- **Tên dự án**: Accounts Receivable Management System (ARMS) - Hệ thống Quản lý Công nợ Khách hàng
- **Môn học**: Xây dựng Hệ thống Thông tin Quản lý
- **Nhóm thực hiện**: Group 6 (FA Credit)
- **Repository**: https://github.com/Victor-201/customer-debt-management
- **Demo URL**: http://34.143.161.197:8080
- **Tài khoản demo**: admin@company.com / admin123

### 1.2. Mô tả ngắn
ARMS là hệ thống quản lý công nợ phải thu (Accounts Receivable) dành cho doanh nghiệp vừa và nhỏ (SME). Hệ thống giúp:
- Quản lý thông tin khách hàng
- Theo dõi hóa đơn và công nợ
- Tự động gửi email nhắc nợ
- Phân tích rủi ro tín dụng
- Báo cáo tuổi nợ (Aging Report)

### 1.3. Vấn đề giải quyết
Doanh nghiệp SME thường gặp các vấn đề:
1. **Thất thoát công nợ**: Không theo dõi được ai nợ, nợ bao nhiêu
2. **Chậm thu hồi tiền**: Không biết hóa đơn nào đã quá hạn
3. **Thiếu minh bạch**: Thông tin phân tán, không tập trung
4. **Đánh giá rủi ro sai**: Không biết khách hàng nào rủi ro cao

**ARMS giải quyết** bằng cách số hóa toàn bộ quy trình, tự động cảnh báo và phân tích dữ liệu.

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Kiến trúc tổng thể (Client-Server-Database)
```
┌─────────────────────────────────────────────────┐
│         FRONTEND (React + Vite)                 │
│         Port: 8080 (Production)                 │
└────────────────────┬────────────────────────────┘
                     │ REST API (/api/*)
                     ▼
┌─────────────────────────────────────────────────┐
│         BACKEND (Node.js + Express)             │
│         Port: 4000                              │
└────────────────────┬────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌──────────┐  ┌──────────────┐  ┌──────────┐
│PostgreSQL│  │Email Service │  │Scheduler │
│Port: 5432│  │  Nodemailer  │  │node-cron │
└──────────┘  └──────────────┘  └──────────┘
```

### 2.2. Clean Architecture (Kiến trúc sạch)

**Tại sao chọn Clean Architecture?**
- Tách biệt business logic khỏi framework
- Dễ test, dễ bảo trì
- Dễ thay đổi database hoặc framework mà không ảnh hưởng logic

**4 Tầng chính:**

```
┌─────────────────────────────────────────────────┐
│ PRESENTATION LAYER (Controllers, Validators)   │
│ → Nhận request HTTP, validate input            │
├─────────────────────────────────────────────────┤
│ APPLICATION LAYER (Use Cases)                  │
│ → Xử lý business logic, điều phối các service  │
├─────────────────────────────────────────────────┤
│ DOMAIN LAYER (Entities, Business Rules)        │
│ → Định nghĩa entities, quy tắc nghiệp vụ       │
├─────────────────────────────────────────────────┤
│ INFRASTRUCTURE LAYER (DB, Email, Auth)         │
│ → Tương tác với database, gửi email, xác thực  │
└─────────────────────────────────────────────────┘
```

### 2.3. Cấu trúc thư mục Backend

```
backend/src/
├── main/                    # Entry point
│   ├── server.js           # Khởi động server
│   ├── app.js              # Express app setup
│   └── config/             # Cấu hình (DB, JWT, Scheduler)
│
├── presentation/            # TẦNG 1: Giao diện
│   ├── controllers/        # Xử lý HTTP request
│   ├── routes/             # Định nghĩa routes
│   ├── validators/         # Validate input (Joi)
│   └── middleware/         # Auth, error handling
│
├── application/             # TẦNG 2: Use Cases
│   └── use-cases/          # Business logic
│       ├── customer/       # Quản lý khách hàng
│       ├── invoice/        # Quản lý hóa đơn
│       ├── payment/        # Quản lý thanh toán
│       └── email-log/      # Lịch sử email
│
├── domain/                  # TẦNG 3: Domain
│   ├── entities/           # Entity classes
│   └── enums/              # Enums (Status, PaymentTerm)
│
├── infrastructure/          # TẦNG 4: Hạ tầng
│   ├── database/           # Sequelize models, repositories
│   ├── auth/               # JWT authentication
│   ├── email/              # Nodemailer service
│   └── scheduler/          # Cron jobs
│
└── shared/                  # Utilities dùng chung
    ├── errors/             # Custom errors
    └── utils/              # Helper functions
```

### 2.4. Cấu trúc thư mục Frontend

```
frontend/src/
├── api/                     # API clients (axios)
│   ├── axiosClient.js      # Base axios config
│   ├── customer.api.js     # Customer API
│   ├── invoice.api.js      # Invoice API
│   ├── payment.api.js      # Payment API
│   └── email.api.js        # Email API
│
├── components/              # Reusable components
│   ├── Sidebar.jsx         # Menu sidebar
│   ├── Header.jsx          # Header với user info
│   └── ProtectedRoute.jsx  # Route authentication
│
├── pages/                   # Page components
│   ├── auth/               # Login, Register
│   ├── dashboard/          # Dashboard với charts
│   ├── customers/          # CRUD Customers
│   ├── invoices/           # CRUD Invoices
│   ├── payments/           # CRUD Payments
│   ├── reports/            # Aging Report, Email History
│   └── settings/           # Email Settings
│
├── store/                   # Redux slices
│   ├── authSlice.js        # Auth state
│   ├── customer.slice.js   # Customer state
│   ├── invoice.slice.js    # Invoice state
│   └── dashboard.slice.js  # Dashboard state
│
├── layouts/                 # Layout wrappers
│   └── MainLayout.jsx      # Sidebar + Header layout
│
└── routes/                  # Route configuration
    ├── AppRoutes.jsx       # Public routes
    └── ProtectedRoutes.jsx # Private routes
```

---

## 3. CÔNG NGHỆ SỬ DỤNG

### 3.1. Backend Technologies

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Node.js** | 20 | Runtime JavaScript server-side |
| **Express.js** | 4.18 | Web framework cho REST API |
| **PostgreSQL** | 16 | Relational Database (ACID, Views) |
| **Sequelize** | 6.37 | ORM - Object Relational Mapping |
| **JWT** | 9.0 | Xác thực người dùng (stateless) |
| **bcrypt** | 5.1 | Hash mật khẩu (one-way encryption) |
| **Nodemailer** | 7.0 | Gửi email SMTP |
| **Handlebars** | 4.7 | Template engine cho email |
| **node-cron** | 4.2 | Lập lịch tự động (scheduler) |
| **Joi** | 17.11 | Validate input data |
| **Helmet** | 7.1 | Security headers HTTP |
| **CORS** | 2.8 | Cross-Origin Resource Sharing |
| **Morgan** | 1.10 | HTTP request logging |
| **Jest** | 29.7 | Testing framework |

### 3.2. Frontend Technologies

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 18.2 | UI Library (component-based) |
| **Vite** | 5.0 | Build tool (nhanh hơn Webpack) |
| **Redux Toolkit** | 2.0 | State management |
| **React Router** | 6.21 | Client-side routing |
| **Tailwind CSS** | 4.1 | Utility-first CSS framework |
| **Axios** | 1.13 | HTTP client |
| **Recharts** | 3.6 | Chart library cho Dashboard |
| **React Quill** | 2.0 | Rich text editor (email template) |
| **Lucide React** | 0.562 | Icon library |

### 3.3. DevOps & Deployment

| Công nghệ | Mục đích |
|-----------|----------|
| **Docker** | Container hóa ứng dụng |
| **Docker Compose** | Orchestration multi-container |
| **Nginx** | Reverse proxy, static file serving |
| **Google Cloud** | Cloud hosting (Compute Engine) |
| **Certbot** | SSL/TLS certificates |
| **Git/GitHub** | Version control |

---

## 4. DATABASE DESIGN

### 4.1. ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    USERS     │       │  CUSTOMERS   │       │  INVOICES    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │──┐    │ id (PK)      │
│ email        │       │ name         │  │    │ invoiceNumber│
│ password     │       │ email        │  │    │ customer_id  │──┐
│ name         │       │ phone        │  └───→│ (FK)         │  │
│ role         │       │ address      │       │ issueDate    │  │
│ status       │       │ paymentTerm  │       │ dueDate      │  │
│ createdAt    │       │ creditLimit  │       │ totalAmount  │  │
│ updatedAt    │       │ status       │       │ status       │  │
└──────────────┘       └──────────────┘       └──────────────┘  │
                                                                │
┌──────────────┐       ┌──────────────┐                         │
│  PAYMENTS    │       │ EMAIL_LOGS   │                         │
├──────────────┤       ├──────────────┤                         │
│ id (PK)      │       │ id (PK)      │                         │
│ invoice_id   │◄──────│ invoice_id   │◄────────────────────────┘
│ (FK)         │       │ (FK)         │
│ amount       │       │ customer_id  │
│ method       │       │ (FK)         │
│ reference    │       │ type         │
│ paidAt       │       │ recipient    │
│ notes        │       │ subject      │
└──────────────┘       │ status       │
                       │ sentAt       │
                       └──────────────┘
```

### 4.2. Chi tiết các bảng

#### Bảng USERS (Người dùng)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hash
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ACCOUNTANT',  -- ADMIN, ACCOUNTANT
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bảng CUSTOMERS (Khách hàng)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    payment_term VARCHAR(20) DEFAULT 'NET_30',  -- NET_7, NET_15, NET_30
    credit_limit DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bảng INVOICES (Hóa đơn)
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,  -- INV-2026-001
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',  -- DRAFT, PENDING, OVERDUE, PAID, CANCELLED
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bảng PAYMENTS (Thanh toán)
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(50),  -- CASH, BANK_TRANSFER, CREDIT_CARD, OTHER
    reference VARCHAR(100),  -- Mã giao dịch
    paid_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bảng EMAIL_LOGS (Lịch sử email)
```sql
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    type VARCHAR(50) NOT NULL,  -- REMINDER, OVERDUE, CONFIRMATION
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    status VARCHAR(20) DEFAULT 'SENT',  -- SENT, FAILED, PENDING
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);
```

### 4.3. Database Views (Báo cáo)

#### View: Tính số ngày quá hạn của hóa đơn
```sql
CREATE VIEW vw_invoice_aging_days AS
SELECT 
    i.*,
    CASE 
        WHEN i.status = 'OVERDUE' THEN 
            EXTRACT(DAY FROM (CURRENT_DATE - i.due_date))
        ELSE 0
    END AS days_overdue,
    CASE 
        WHEN i.status = 'PENDING' AND i.due_date < CURRENT_DATE THEN 'OVERDUE'
        ELSE i.status
    END AS calculated_status
FROM invoices i;
```

#### View: Báo cáo tuổi nợ (Aging Report)
```sql
CREATE VIEW vw_aging_report AS
SELECT 
    CASE 
        WHEN days_overdue = 0 THEN 'Current'
        WHEN days_overdue BETWEEN 1 AND 30 THEN '1-30 days'
        WHEN days_overdue BETWEEN 31 AND 60 THEN '31-60 days'
        WHEN days_overdue BETWEEN 61 AND 90 THEN '61-90 days'
        ELSE '90+ days'
    END AS aging_bucket,
    COUNT(*) AS invoice_count,
    SUM(total_amount) AS total_amount
FROM vw_invoice_aging_days
WHERE status IN ('PENDING', 'OVERDUE')
GROUP BY aging_bucket;
```

### 4.4. Quy tắc nghiệp vụ Database

1. **Công nợ không lưu trực tiếp**: Công nợ = Tổng Invoice - Tổng Payment
2. **Invoice status tự động cập nhật**: Scheduler chạy hàng ngày kiểm tra due_date
3. **Cascade delete**: Xóa customer sẽ xóa invoices, payments liên quan
4. **Unique constraints**: email customer, invoice_number phải unique

---

## 5. AUTHENTICATION & AUTHORIZATION

### 5.1. JWT Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │ Backend │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │ POST /api/auth/login                  │
     │ {email, password} │                   │
     ├──────────────────►│                   │
     │                   │ Find user by email│
     │                   ├──────────────────►│
     │                   │◄──────────────────┤
     │                   │                   │
     │                   │ Compare password  │
     │                   │ (bcrypt.compare)  │
     │                   │                   │
     │                   │ Generate tokens   │
     │                   │ - Access (15min)  │
     │                   │ - Refresh (7days) │
     │                   │                   │
     │ {accessToken, refreshToken, user}     │
     │◄──────────────────┤                   │
     │                   │                   │
     │ GET /api/customers                    │
     │ Authorization: Bearer <accessToken>   │
     ├──────────────────►│                   │
     │                   │ Verify JWT        │
     │                   │ Extract user info │
     │                   │                   │
     │ {data}            │                   │
     │◄──────────────────┤                   │
```

### 5.2. Token Configuration
```javascript
// Access Token: Ngắn hạn, dùng cho mỗi request
{
  expiresIn: '15m',
  secret: JWT_SECRET
}

// Refresh Token: Dài hạn, dùng để lấy access token mới
{
  expiresIn: '7d',
  secret: JWT_REFRESH_SECRET
}
```

### 5.3. Role-Based Access Control (RBAC)

| Role | Quyền hạn |
|------|-----------|
| **ADMIN** | Full access: Quản lý users, customers, invoices, settings |
| **ACCOUNTANT** | Limited: CRUD customers, invoices, payments, xem reports |

### 5.4. Password Security
- Hash algorithm: **bcrypt** với salt rounds = 10
- Password không lưu plaintext
- So sánh bằng `bcrypt.compare()`

---

## 6. API ENDPOINTS

### 6.1. Authentication APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập, nhận tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

### 6.2. Customer APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/customers` | Danh sách customers (pagination, search) |
| GET | `/api/customers/:id` | Chi tiết 1 customer |
| POST | `/api/customers` | Tạo customer mới |
| PATCH | `/api/customers/:id` | Cập nhật customer |
| DELETE | `/api/customers/:id` | Xóa customer |
| GET | `/api/customers/summary` | Thống kê tổng quan |

### 6.3. Invoice APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/invoices` | Danh sách invoices (filter by status, customer) |
| GET | `/api/invoices/:id` | Chi tiết 1 invoice |
| POST | `/api/invoices` | Tạo invoice mới |
| PATCH | `/api/invoices/:id` | Cập nhật invoice |
| DELETE | `/api/invoices/:id` | Xóa invoice |
| GET | `/api/invoices/summary` | Thống kê (total, overdue, paid) |
| GET | `/api/invoices/aging` | Báo cáo Aging Report |

### 6.4. Payment APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/payments` | Danh sách payments |
| GET | `/api/payments/:id` | Chi tiết 1 payment |
| POST | `/api/payments` | Ghi nhận thanh toán mới |
| PATCH | `/api/payments/:id` | Sửa payment |
| DELETE | `/api/payments/:id` | Xóa payment |

### 6.5. Email & Settings APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/email-logs` | Lịch sử email đã gửi |
| GET | `/api/email-templates` | Danh sách email templates |
| PUT | `/api/email-templates/:type` | Cập nhật template |
| GET | `/api/settings` | Lấy settings (cron schedule) |
| PUT | `/api/settings` | Cập nhật settings |

### 6.6. Dashboard APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/dashboard/summary` | Tổng quan AR |
| GET | `/api/dashboard/aging` | Dữ liệu Aging Chart |
| GET | `/api/dashboard/trend` | Dữ liệu trend theo tháng |

---

## 7. TÍNH NĂNG CHI TIẾT

### 7.1. Dashboard (Bảng điều khiển)

**Mục đích**: Cung cấp cái nhìn tổng quan về tình hình công nợ.

**Hiển thị**:
- **4 KPI Cards**:
  - Tổng công nợ phải thu (Total AR)
  - Công nợ quá hạn (Overdue)
  - Số khách hàng hoạt động
  - Số hóa đơn chờ thanh toán

- **Aging Chart** (Biểu đồ tuổi nợ):
  - Current (chưa đến hạn)
  - 1-30 ngày
  - 31-60 ngày
  - 61-90 ngày
  - 90+ ngày

- **Recent Activities**:
  - Hóa đơn mới tạo
  - Thanh toán gần đây
  - Khách hàng quá hạn

**Công nghệ**: React + Redux + Recharts

### 7.2. Quản lý Khách hàng

**CRUD Operations**:
- **Create**: Thêm khách hàng mới với thông tin: tên, email, SĐT, địa chỉ, payment term, credit limit
- **Read**: Xem danh sách, tìm kiếm, filter theo status
- **Update**: Sửa thông tin, thay đổi status
- **Delete**: Xóa khách hàng (cascade xóa invoices)

**Trang Chi tiết Khách hàng**:
- Thông tin cơ bản
- **Debt Summary Cards**: Tổng nợ, chờ thanh toán, quá hạn, đã thanh toán
- **Danh sách hóa đơn** của khách hàng
- Lịch sử thanh toán

### 7.3. Quản lý Hóa đơn

**Invoice Status Flow**:
```
DRAFT → PENDING → OVERDUE → PAID
                    ↓
                CANCELLED
```

**Tự động chuyển trạng thái**:
- PENDING → OVERDUE: Khi qua due_date (Cron job chạy hàng ngày)
- PENDING/OVERDUE → PAID: Khi thanh toán đủ 100%

**Invoice Number Format**: `INV-YYYY-XXXX` (VD: INV-2026-0001)

### 7.4. Quản lý Thanh toán

**Payment Methods**:
- CASH (Tiền mặt)
- BANK_TRANSFER (Chuyển khoản)
- CREDIT_CARD (Thẻ tín dụng)
- OTHER (Khác)

**Quy trình ghi nhận thanh toán**:
1. Chọn hóa đơn cần thanh toán
2. Nhập số tiền, phương thức, mã giao dịch
3. Hệ thống kiểm tra: Nếu tổng payment ≥ invoice amount → Chuyển status PAID

### 7.5. Email Automation

**Email Template Editor**:
- Rich text editor (React Quill)
- 3 chế độ: Editor (WYSIWYG), HTML Code, Preview
- **Variable picker**: Click để chèn biến vào template

**Biến có sẵn**:
| Biến | Mô tả |
|------|-------|
| `{{customerName}}` | Tên khách hàng |
| `{{customerEmail}}` | Email khách hàng |
| `{{invoiceNumber}}` | Số hóa đơn |
| `{{invoiceAmount}}` | Số tiền |
| `{{dueDate}}` | Ngày đến hạn |
| `{{daysOverdue}}` | Số ngày quá hạn |
| `{{companyName}}` | Tên công ty |

**Lịch gửi tự động** (node-cron):
- Cấu hình: Daily/Weekly/Monthly
- Cron expression: VD `0 8 * * *` (8h sáng hàng ngày)

### 7.6. Báo cáo Aging Report

**Mô tả**: Phân tích công nợ theo độ tuổi nợ.

**Aging Buckets**:
| Bucket | Định nghĩa |
|--------|------------|
| Current | Chưa đến hạn |
| 1-30 days | Quá hạn 1-30 ngày |
| 31-60 days | Quá hạn 31-60 ngày |
| 61-90 days | Quá hạn 61-90 ngày |
| 90+ days | Quá hạn trên 90 ngày |

**Ý nghĩa nghiệp vụ**:
- Bucket càng cao → Rủi ro mất tiền càng lớn
- Dùng để ưu tiên thu hồi nợ
- Đánh giá hiệu quả chính sách tín dụng

---

## 8. SCHEDULER (Tác vụ tự động)

### 8.1. Các tác vụ định kỳ

| Tác vụ | Schedule | Mô tả |
|--------|----------|-------|
| **Update Invoice Status** | 0 1 * * * (1h sáng) | Chuyển PENDING → OVERDUE nếu qua due_date |
| **Send Reminder Emails** | 0 8 * * * (8h sáng) | Gửi email nhắc nợ cho invoices quá hạn |
| **Generate Daily Report** | 0 7 * * * (7h sáng) | Tạo báo cáo tổng hợp hàng ngày |

### 8.2. Cron Expression Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
* * * * *
```

---

## 9. SECURITY (Bảo mật)

### 9.1. Backend Security
- **Helmet.js**: Set security headers (X-Frame-Options, X-XSS-Protection, etc.)
- **CORS**: Chỉ cho phép origin được cấu hình
- **JWT**: Stateless authentication, token có thời hạn
- **bcrypt**: Hash password với salt
- **Joi validation**: Validate tất cả input trước khi xử lý
- **Sequelize**: Prevent SQL injection (parameterized queries)

### 9.2. Frontend Security
- **React auto-escaping**: Prevent XSS
- **HTTPS**: Encrypt data in transit (production)
- **Token storage**: Lưu trong memory/httpOnly cookie

### 9.3. Environment Variables
```
# Không commit vào git
JWT_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>
DB_PASSWORD=<db-password>
SMTP_PASSWORD=<email-password>
```

---

## 10. DEPLOYMENT

### 10.1. Docker Containers

| Container | Image | Port | Mô tả |
|-----------|-------|------|-------|
| cdm-frontend | nginx:alpine | 8080 | Serve static React build |
| cdm-backend | node:20-alpine | 4000 | Express API server |
| cdm-postgres | postgres:16-alpine | 5433 | Database |

### 10.2. Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5433:5432"]
    healthcheck: pg_isready

  backend:
    build: ./Dockerfile.backend
    ports: ["4000:4000"]
    depends_on: postgres

  frontend:
    build: ./Dockerfile.frontend
    ports: ["8080:80"]
    depends_on: backend
```

### 10.3. GCP Deployment
- **Platform**: Google Cloud Compute Engine
- **VM**: tech-store-vm
- **Zone**: asia-southeast1-b
- **External IP**: 34.143.161.197

---

## 11. TESTING

### 11.1. Backend Testing
- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Coverage**: Unit tests cho use cases, integration tests cho API

### 11.2. Test Examples
```javascript
// Integration test
describe('POST /api/auth/login', () => {
  it('should return tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'admin123' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
```

---

## 12. CÂU HỎI THƯỜNG GẶP (FAQ)

### Q1: Tại sao chọn Clean Architecture?
**A**: Clean Architecture giúp:
- Tách biệt business logic khỏi framework
- Dễ test (có thể mock dependencies)
- Dễ thay đổi database (PostgreSQL → MongoDB) mà không sửa logic
- Dễ maintain và scale

### Q2: Tại sao dùng PostgreSQL thay vì MySQL?
**A**: PostgreSQL có:
- JSONB support tốt hơn
- Full-text search native
- Views, Materialized Views mạnh mẽ
- Better compliance với SQL standards
- Tốt cho financial/accounting systems

### Q3: JWT hay Session-based auth?
**A**: Chọn JWT vì:
- Stateless - không cần lưu session trên server
- Dễ scale horizontally
- Phù hợp với REST API
- Có thể dùng cho mobile app sau này

### Q4: Tại sao chọn Vite thay vì CRA (Create React App)?
**A**: Vite nhanh hơn:
- Dev server khởi động tức thì (ESM native)
- HMR (Hot Module Replacement) nhanh
- Build production nhanh hơn
- CRA đã deprecated

### Q5: Công nợ được tính như thế nào?
**A**: Công nợ = Tổng Invoice (status PENDING/OVERDUE) - Tổng Payment
- Không lưu trực tiếp field "debt" trong customer
- Tính toán động từ invoices và payments
- Đảm bảo data consistency

### Q6: Aging Report dùng để làm gì?
**A**: Aging Report giúp:
- Biết invoice nào quá hạn bao lâu
- Ưu tiên thu hồi nợ (90+ days trước)
- Đánh giá rủi ro khách hàng
- Lập kế hoạch tài chính

### Q7: Email automation hoạt động thế nào?
**A**: 
1. Cron job chạy theo schedule (VD: 8h sáng)
2. Query invoices có status OVERDUE
3. Với mỗi invoice, render template với biến thực
4. Gửi email qua SMTP (Nodemailer)
5. Log kết quả vào email_logs

### Q8: Hệ thống có thể scale như thế nào?
**A**:
- **Horizontal**: Thêm container backend (load balancer)
- **Database**: Read replicas, connection pooling
- **Caching**: Redis cho session, query cache
- **Queue**: RabbitMQ cho background jobs

### Q9: Bảo mật password thế nào?
**A**:
- Hash bằng bcrypt với salt rounds = 10
- Password không bao giờ lưu plaintext
- Login so sánh bằng bcrypt.compare()
- Không gửi password trong response

### Q10: Tại sao dùng Redux Toolkit?
**A**:
- Giảm boilerplate so với Redux thuần
- Built-in Immer (immutable updates dễ hơn)
- DevTools integration
- RTK Query cho data fetching

---

## 13. GLOSSARY (Thuật ngữ)

| Thuật ngữ | Giải thích |
|-----------|------------|
| **AR (Accounts Receivable)** | Công nợ phải thu - số tiền khách hàng nợ doanh nghiệp |
| **Aging Report** | Báo cáo phân tích tuổi nợ theo thời gian quá hạn |
| **JWT** | JSON Web Token - chuẩn xác thực stateless |
| **ORM** | Object Relational Mapping - ánh xạ object với database |
| **REST API** | Kiến trúc API sử dụng HTTP methods (GET, POST, PUT, DELETE) |
| **Clean Architecture** | Kiến trúc phần mềm tách biệt các tầng logic |
| **Use Case** | Đơn vị logic xử lý 1 nghiệp vụ cụ thể |
| **CRUD** | Create, Read, Update, Delete - các thao tác cơ bản |
| **Cron Job** | Tác vụ chạy tự động theo lịch |
| **SMTP** | Simple Mail Transfer Protocol - giao thức gửi email |

---

## 14. METRICS & STATISTICS

- **Tổng số customers**: ~100 sample records
- **Tổng số invoices**: ~500 sample records
- **Tổng email logs**: ~15 records (cleaned up)
- **API endpoints**: 30+ endpoints
- **React components**: 50+ components
- **Lines of code**: ~15,000 LOC

---

## 15. FUTURE ENHANCEMENTS (Mở rộng)

1. **SMS/Zalo notifications**: Thêm kênh nhắc nợ
2. **Excel/PDF export**: Xuất báo cáo
3. **Mobile app**: React Native
4. **Multi-tenant**: Hỗ trợ nhiều công ty
5. **AI predictions**: Dự đoán rủi ro thanh toán
6. **Payment gateway**: Tích hợp thanh toán online

