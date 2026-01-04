# ACCOUNTS RECEIVABLE MANAGEMENT SYSTEM (ARMS)

## 1. Giới thiệu chung

**Accounts Receivable Management System (ARMS)** là hệ thống quản lý công nợ khách hàng được xây dựng theo mô hình **Full-stack JavaScript**, áp dụng **Clean Architecture**, hướng tới việc **số hóa toàn bộ quy trình công nợ phải thu (Accounts Receivable)** cho doanh nghiệp vừa và nhỏ (SME).

Đây là đồ án phục vụ môn học **"Xây dựng Hệ thống Thông tin Quản lý"**, đồng thời được thiết kế đủ thực tế để có thể triển khai thử nghiệm trong môi trường doanh nghiệp.

---

## 2. Mục tiêu hệ thống

### 2.1. Mục tiêu nghiệp vụ

* Quản lý tập trung thông tin khách hàng
* Theo dõi công nợ phát sinh từ hóa đơn
* Phân loại tuổi nợ (Aging)
* Tự động nhắc nợ theo lịch
* Cảnh báo rủi ro tài chính
* Hỗ trợ ra quyết định cho kế toán và quản lý

### 2.2. Mục tiêu học thuật

* Áp dụng mô hình **Clean Architecture**
* Phân tách rõ **Business Logic – Application – Infrastructure**
* Thiết kế hệ thống đúng chuẩn ERP/Accounting
* Dễ demo, dễ thuyết trình, dễ bảo vệ đồ án

---

## 3. Phạm vi hệ thống

### Người dùng hệ thống

* **Admin**: quản lý người dùng, cấu hình hệ thống
* **Kế toán**: quản lý khách hàng, hóa đơn, công nợ, báo cáo

### Đối tượng quản lý

* Khách hàng
* Hóa đơn bán hàng
* Thanh toán
* Công nợ phải thu
* Email nhắc nợ

---

## 4. Tổng quan kiến trúc hệ thống

Hệ thống được thiết kế theo mô hình **Client – Server – Services**:

```
[ React Client ]
        |
        v
[ REST API - Node.js / Express ]
        |
        v
[ PostgreSQL Database ]
        |
        +--> Email Service (Nodemailer)
        +--> Scheduler (Cron Jobs)
```

### Vai trò các thành phần

* **Frontend (React)**: giao diện người dùng, dashboard, báo cáo
* **Backend (Node.js)**: xử lý nghiệp vụ, API, bảo mật
* **Database (PostgreSQL)**: lưu trữ dữ liệu kế toán
* **Email Service**: gửi email nhắc nợ
* **Scheduler**: cập nhật trạng thái hóa đơn, gửi email tự động

---

## 5. Công nghệ sử dụng

### Backend

* Node.js + Express
* PostgreSQL
* Sequelize / Prisma
* JWT Authentication
* Role-based Authorization
* Nodemailer
* node-cron

### Frontend

* React + Vite
* Redux Toolkit
* Axios
* Chart Library (Dashboard)

---

## 6. Thiết kế nghiệp vụ cốt lõi

### 6.1. Nguyên tắc nghiệp vụ

* **Không lưu công nợ trực tiếp ở Customer**
* Công nợ phát sinh từ **Invoice**
* **Payment chỉ làm giảm công nợ**
* Aging & Risk được **tính toán động**

### 6.2. Luồng quản lý công nợ

1. Tạo khách hàng
2. Tạo hóa đơn
3. Phát sinh công nợ
4. Theo dõi đến hạn
5. Quá hạn → Overdue
6. Gửi email nhắc nợ
7. Đánh giá rủi ro khách hàng

---

## 7. Thiết kế cơ sở dữ liệu

### Các bảng chính

* Users
* Customers
* Invoices
* Payments
* EmailLogs

### Các View phục vụ báo cáo

* vw_invoice_aging_days
* vw_aging_report
* vw_total_ar
* vw_overdue_ar
* vw_high_risk_customers

Thiết kế tuân thủ chuẩn **kế toán – ERP**, đảm bảo dữ liệu chính xác và dễ mở rộng.

---

## 8. Clean Architecture trong hệ thống

### Các tầng chính

```
Presentation (Controllers, Validators)
Application (Use Cases)
Domain (Entities, Business Rules)
Infrastructure (DB, Email, Auth, Scheduler)
```

### Ý nghĩa

* Business Logic **độc lập framework**
* Dễ test, dễ bảo trì
* Dễ mở rộng nghiệp vụ

---

## 9. Cấu trúc thư mục dự án

Hệ thống được tổ chức theo **Full-stack Clean Architecture**, gồm:

* Frontend (React)
* Backend (Node.js)
* Docs (tài liệu đồ án)

> Chi tiết xem trong phần cây thư mục của đồ án.

---

## 10. Dashboard & Báo cáo

* Tổng công nợ phải thu
* Tổng công nợ quá hạn
* Biểu đồ phân bố tuổi nợ
* Danh sách khách hàng rủi ro cao

Dashboard được thiết kế trực quan, phù hợp demo và thuyết trình.

---

## 11. Tính mở rộng của hệ thống

Hệ thống có thể mở rộng thêm:

* Phân quyền chi tiết hơn
* Tích hợp SMS/Zalo nhắc nợ
* Kết nối hệ thống kế toán khác
* Xuất báo cáo Excel/PDF

---

## 12. Giá trị thực tế cho doanh nghiệp

* Giảm thất thoát công nợ
* Tăng tốc thu hồi tiền
* Minh bạch tài chính
* Hỗ trợ ra quyết định quản lý

---

## 13. Kết luận

Accounts Receivable Management System là đồ án kết hợp **tính học thuật và tính thực tế**, phản ánh đúng nghiệp vụ kế toán doanh nghiệp, áp dụng kiến trúc phần mềm hiện đại, phù hợp cho việc **demo, thuyết trình và bảo vệ đồ án đại học**.

---
