# TECH STACK - CUSTOMER DEBT MANAGEMENT SYSTEM (ARMS)

## 📋 Tổng quan

Dự án **Accounts Receivable Management System (ARMS)** được xây dựng theo kiến trúc **Full-stack JavaScript** với **Clean Architecture**, tối ưu hóa cho việc quản lý công nợ khách hàng.

---

## 🎯 Kiến trúc hệ thống

### Kiến trúc tổng thể
```
┌─────────────────────────────────────────────────┐
│         Frontend (React + Vite)                 │
│    React 18 • Redux Toolkit • React Router      │
└────────────────┬────────────────────────────────┘
                 │ REST API
                 ▼
┌─────────────────────────────────────────────────┐
│       Backend (Node.js + Express)               │
│   Clean Architecture • MVC • Use Cases          │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────┐
    ▼                         ▼              ▼
┌──────────┐          ┌──────────────┐  ┌──────────┐
│PostgreSQL│          │Email Service │  │Scheduler │
│ Database │          │  Nodemailer  │  │node-cron │
└──────────┘          └──────────────┘  └──────────┘
```

### Clean Architecture (Backend)
```
Presentation Layer (Controllers, Validators)
      ↓
Application Layer (Use Cases)
      ↓
Domain Layer (Entities, Business Rules)
      ↓
Infrastructure Layer (Database, Email, Auth)
```

---

## 🔧 BACKEND TECHNOLOGIES

### Core Framework
- **Runtime**: Node.js 20
- **Framework**: Express.js 4.18
- **Language**: JavaScript (ES Modules)
- **Architecture**: Clean Architecture + MVC Pattern

### Database
- **RDBMS**: PostgreSQL 16 Alpine
- **ORM**: Sequelize 6.37
- **Connection Pool**: Built-in Sequelize pool
- **Migration**: Custom migration scripts

### Authentication & Security
- **Auth**: JWT (JSON Web Tokens) 9.0
  - Access Token: 15 minutes
  - Refresh Token: 7 days
- **Encryption**: bcrypt 5.1 (password hashing)
- **Security Headers**: Helmet 7.1
- **CORS**: cors 2.8
- **Input Validation**: Joi 17.11

### Template & Email
- **Template Engine**: Handlebars 4.7
- **Email Service**: Nodemailer 7.0
- **SMTP**: Gmail SMTP (configurable)

### Task Scheduling
- **Cron Jobs**: node-cron 4.2
  - Auto update invoice status
  - Send reminder emails
  - Generate reports

### Middleware & Utilities
- **Logging**: Morgan 1.10
- **Cookies**: cookie-parser 1.4
- **Environment**: dotenv 16.3

### Testing (Dev Dependencies)
- **Test Framework**: Jest 29.7
- **HTTP Testing**: Supertest 6.3
- **API Testing**: Axios 1.6
- **Transpiler**: Babel 7
  - @babel/core
  - @babel/preset-env
  - babel-jest

### Development Tools
- **Auto-reload**: Nodemon 3.0

---

## 🎨 FRONTEND TECHNOLOGIES

### Core Framework
- **Library**: React 18.2
- **Build Tool**: Vite 5.0
- **Language**: JavaScript (JSX)

### State Management
- **Global State**: Redux Toolkit 2.0
- **React Integration**: react-redux 9.0
- **Async Handling**: RTK Query (built-in Redux Toolkit)

### Routing
- **Router**: React Router DOM 6.21
- **Navigation**: Declarative routing with hooks

### UI & Styling
- **CSS Framework**: Tailwind CSS 4.1
  - @tailwindcss/vite 4.1 (Vite plugin)
- **Icons**: 
  - Lucide React 0.562 (Modern icon library)
  - React Icons 5.0 (Additional icons)
- **Charts**: Recharts 3.6 (Dashboard visualizations)

### Form & Rich Text
- **Rich Text Editor**: React Quill 2.0
  - WYSIWYG email template editor
  - HTML code editor
  - Variable picker integration

### HTTP Client
- **API Client**: Axios 1.13
- **Interceptors**: Custom for auth & error handling

### Development Tools
- **Linting**: ESLint 8.55
  - eslint-plugin-react 7.33
  - eslint-plugin-react-hooks 4.6
  - eslint-plugin-react-refresh 0.4
- **Type Checking**: TypeScript types for React
  - @types/react 18.2
  - @types/react-dom 18.2

---

## 🐳 DEVOPS & DEPLOYMENT

### Containerization
- **Container**: Docker
- **Orchestration**: Docker Compose 3.8
  - Backend container
  - Frontend container (Nginx)
  - PostgreSQL container

### Web Server (Production)
- **Server**: Nginx Alpine
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Certbot (Let's Encrypt)

### Docker Images
```yaml
Backend:  node:20-alpine
Frontend: node:20-alpine (builder) → nginx:alpine (runtime)
Database: postgres:16-alpine
Certbot:  certbot/certbot
```

### Cloud Deployment
- **Cloud Provider**: Google Cloud Platform (GCP)
- **Service**: Compute Engine (tech-store-vm)
- **Zone**: asia-southeast1-b
- **External IP**: 34.143.161.197

### Ports Configuration
```
Frontend:       8080 (HTTP)
Backend API:    4000
PostgreSQL:     5433 (external) → 5432 (internal)
Nginx Proxy:    8888 (HTTP), 8445 (HTTPS)
```

---

## 📊 DATABASE DESIGN

### Tables
- **users** - User accounts with roles
- **customers** - Customer information
- **invoices** - Invoice records
- **payments** - Payment transactions
- **email_logs** - Email sending history
- **email_templates** - Email template configurations
- **settings** - System settings (cron schedules)

### Views (Dynamic Reports)
- **vw_invoice_aging_days** - Invoice aging calculation
- **vw_aging_report** - Aging summary report
- **vw_total_ar** - Total accounts receivable
- **vw_overdue_ar** - Overdue receivables
- **vw_high_risk_customers** - High-risk customer analysis

### Database Features
- Foreign keys with cascading
- Indexes on frequently queried columns
- ENUM types for status fields
- Triggers for automatic updates
- Views for complex queries

---

## 🔄 DEVELOPMENT WORKFLOW

### Version Control
- **VCS**: Git
- **Repository**: GitHub (Victor-201/customer-debt-management)
- **Branch**: main

### Package Managers
- **Backend**: yarn
- **Frontend**: npm

### Environment Files
```
backend/.env
  - DB credentials
  - JWT secrets
  - SMTP config

frontend/.env
  - VITE_API_URL
```

### Scripts

**Backend:**
```bash
yarn dev          # Development with nodemon
yarn start        # Production
yarn test         # Run tests
yarn migrate      # Run migrations
yarn seed         # Seed sample data
```

**Frontend:**
```bash
npm run dev       # Development server (port 5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 🎯 KEY FEATURES & TECHNOLOGIES

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Accountant)
- Refresh token rotation
- Secure cookie handling

### 2. Real-time Dashboard
- Redux state management
- Recharts data visualization
- Responsive Tailwind UI
- Glass-morphism design

### 3. Email Automation
- Handlebars email templates
- React Quill template editor
- Variable substitution system
- SMTP integration
- Cron-based scheduling

### 4. Invoice Management
- CRUD operations
- Status workflow (DRAFT → PENDING → OVERDUE → PAID)
- Payment tracking
- Aging calculation

### 5. Customer Portal
- Customer detail view
- Invoice history
- Debt summary cards
- Payment records

### 6. Reporting System
- PostgreSQL views for analytics
- Export capabilities
- Aging reports
- Risk assessment

---

## 📦 PROJECT STRUCTURE

```
customer-debt-management/
├── backend/
│   ├── src/
│   │   ├── application/        # Use Cases
│   │   ├── domain/             # Business Logic
│   │   ├── infrastructure/     # Database, Email, Auth
│   │   ├── presentation/       # Controllers, Routes
│   │   ├── shared/             # Utilities
│   │   └── main/               # Server entry point
│   ├── scripts/                # Migration & Seed
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # API clients
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Redux slices
│   │   ├── layouts/            # Layout components
│   │   └── routes/             # Route config
│   ├── public/                 # Static assets
│   └── package.json
├── deployment/
│   └── docker/
│       ├── docker-compose.yml
│       ├── Dockerfile.backend
│       ├── Dockerfile.frontend
│       └── nginx/              # Nginx configs
└── docs/                       # Documentation
```

---

## 🔐 SECURITY FEATURES

### Backend Security
- Helmet.js security headers
- CORS policy enforcement
- JWT token expiration
- Password hashing (bcrypt)
- SQL injection prevention (Sequelize)
- Input validation (Joi)

### Frontend Security
- XSS prevention (React auto-escaping)
- CSRF protection (token-based)
- Secure cookie storage
- API key protection

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### Backend
- Database connection pooling
- Query optimization with indexes
- Async/await for I/O operations
- Caching strategies (planned)

### Frontend
- Vite fast HMR
- Code splitting
- Lazy loading
- Bundle size optimization
- Tailwind CSS purging

---

## 📈 SCALABILITY

### Current Architecture Supports:
- Horizontal scaling (Docker containers)
- Load balancing (Nginx)
- Database replication (PostgreSQL)
- Microservices migration path (Clean Architecture)

### Future Enhancements:
- Redis caching
- Message queue (RabbitMQ/Redis)
- CDN for static assets
- Elasticsearch for search

---

## 🧪 TESTING STRATEGY

### Backend Testing
- Unit tests (Jest)
- Integration tests (Supertest)
- API endpoint testing
- Database transaction tests

### Frontend Testing (Planned)
- Component testing (React Testing Library)
- E2E testing (Playwright/Cypress)

---

## 📝 DOCUMENTATION

### Code Documentation
- JSDoc comments
- README files
- Architecture diagrams
- API documentation

### Deployment Documentation
- Docker setup guide
- Environment configuration
- Deployment checklist
- Troubleshooting guide

---

## 🎓 LEARNING OUTCOMES

### Technical Skills
- Full-stack JavaScript development
- Clean Architecture implementation
- RESTful API design
- Database design & optimization
- Docker containerization
- Cloud deployment (GCP)

### Business Skills
- Accounting system design
- Accounts Receivable management
- Financial reporting
- Risk assessment

---

## 📞 PROJECT METADATA

**Project Name**: Customer Debt Management System (ARMS)  
**Version**: 1.0.0  
**License**: ISC  
**Type**: Educational Project (University Coursework)  
**Course**: Xây dựng Hệ thống Thông tin Quản lý  
**Team**: Group 6  
**Repository**: https://github.com/Victor-201/customer-debt-management  
**Live Demo**: http://34.143.161.197:8080

---

## ⚡ QUICK REFERENCE

### Tech Stack Summary

| Category | Technologies |
|----------|-------------|
| **Backend** | Node.js, Express, PostgreSQL, Sequelize |
| **Frontend** | React, Redux Toolkit, Vite, Tailwind CSS |
| **Auth** | JWT, bcrypt |
| **Email** | Nodemailer, Handlebars, React Quill |
| **Scheduling** | node-cron |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Cloud** | GCP Compute Engine |
| **Testing** | Jest, Supertest |
| **Tools** | Git, GitHub, ESLint |

---

**Last Updated**: 2026-02-04  
**Status**: ✅ Production Ready
