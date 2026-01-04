customer-debt-management/
│   frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   ├── .env.example
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── main.jsx                  # Entry point
│   │   ├── App.jsx                   # Root component
│   │
│   │   ├── api/                      # GIAO TIẾP BACKEND (REST)
│   │   │   ├── axiosClient.js        # Axios + JWT interceptor
│   │   │   │
│   │   │   ├── auth.api.js
│   │   │   ├── customer.api.js
│   │   │   ├── invoice.api.js
│   │   │   ├── payment.api.js
│   │   │   └── report.api.js
│   │
│   │   ├── store/                    # REDUX STATE
│   │   │   ├── index.js              # Configure store
│   │   │
│   │   │   ├── auth.slice.js
│   │   │   ├── customer.slice.js
│   │   │   ├── invoice.slice.js
│   │   │   ├── payment.slice.js
│   │   │   └── report.slice.js
│   │
│   │   ├── routes/                   # ROUTING
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── PrivateRoute.jsx      # Require login
│   │   │   └── RoleRoute.jsx         # Admin / Kế toán
│   │
│   │   ├── layouts/                  # KHUNG GIAO DIỆN
│   │   │   ├── AuthLayout.jsx        # Login layout
│   │   │   └── DashboardLayout.jsx   # Sidebar + Header
│   │
│   │   ├── pages/                    # CÁC TRANG WEB (LEVEL ROUTE)
│   │   │
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   ├── CustomerListPage.jsx
│   │   │   │   ├── CustomerDetailPage.jsx
│   │   │   │   └── CustomerFormPage.jsx
│   │   │   │
│   │   │   ├── invoices/
│   │   │   │   ├── InvoiceListPage.jsx
│   │   │   │   ├── InvoiceDetailPage.jsx
│   │   │   │   └── InvoiceFormPage.jsx
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   └── PaymentPage.jsx
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── AgingReportPage.jsx
│   │   │       ├── OverdueARPage.jsx
│   │   │       └── HighRiskCustomerPage.jsx
│   │
│   │   ├── components/               # COMPONENT TÁI SỬ DỤNG
│   │   │   ├── PageHeader.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── StatusTag.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── charts/
│   │   │       ├── AgingBarChart.jsx
│   │   │       └── ARPieChart.jsx
│   │
│   │   ├── hooks/                    # CUSTOM HOOKS
│   │   │   ├── useAuth.js
│   │   │   ├── usePermission.js
│   │   │   └── useDebounce.js
│   │
│   │   ├── utils/                    # XỬ LÝ DỮ LIỆU PHỤ TRỢ
│   │   │   ├── date.util.js
│   │   │   ├── money.util.js
│   │   │   └── aging.util.js
│   │
│   │   ├── constants/                # ENUM / MAP HIỂN THỊ
│   │   │   ├── roles.js
│   │   │   ├── invoiceStatus.js
│   │   │   ├── paymentTerms.js
│   │   │   └── riskLevels.js
│   │
│   │   ├── styles/
│   │   │   └── global.css
│   │
│   │   └── assets/
│   │       └── images/
│   │
│   └── docs/
│       ├── ui-flow.png
│       ├── screen-dashboard.png
│       └── demo-screens.png
│   
│   Backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── docker-compose.yml            # (Optional) Demo nhanh hệ thống
│   │
│   ├── src/
│   │   │
│   │   ├── main/                     # FRAMEWORK & BOOTSTRAP
│   │   │   ├── server.js             # Start HTTP server
│   │   │   ├── app.js                # Express app, global middleware
│   │   │   │
│   │   │   ├── routes/               # Định nghĩa REST API
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── customer.routes.js
│   │   │   │   ├── invoice.routes.js
│   │   │   │   ├── payment.routes.js
│   │   │   │   └── report.routes.js
│   │   │   │
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── role.middleware.js
│   │   │   │   ├── validate.middleware.js
│   │   │   │   └── error.middleware.js
│   │   │   │
│   │   │   └── config/
│   │   │       ├── database.js
│   │   │       ├── orm.config.js     # Sequelize / Prisma config
│   │   │       ├── jwt.config.js
│   │   │       ├── mail.config.js
│   │   │       ├── cron.config.js
│   │   │       └── env.config.js
│   │
│   │   ├── presentation/             # INTERFACE ADAPTERS (CONTROLLER)
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── customer.controller.js
│   │   │   │   ├── invoice.controller.js
│   │   │   │   ├── payment.controller.js
│   │   │   │   └── report.controller.js
│   │   │   │
│   │   │   ├── presenters/           # Format response cho client
│   │   │   │   ├── customer.presenter.js
│   │   │   │   ├── invoice.presenter.js
│   │   │   │   └── aging.presenter.js
│   │   │   │
│   │   │   └── validators/
│   │   │       ├── auth.schema.js
│   │   │       ├── customer.schema.js
│   │   │       ├── invoice.schema.js
│   │   │       └── payment.schema.js
│   │
│   │   ├── application/              # USE CASES – TRÁI TIM ĐỒ ÁN
│   │   │   ├── use-cases/
│   │   │   │   │
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login.usecase.js
│   │   │   │   │   └── refreshToken.usecase.js
│   │   │   │   │
│   │   │   │   ├── customer/
│   │   │   │   │   ├── createCustomer.usecase.js
│   │   │   │   │   ├── updateCustomer.usecase.js
│   │   │   │   │   ├── updateCustomerStatus.usecase.js
│   │   │   │   │   │
│   │   │   │   │   ├── assessCustomerRisk.usecase.js
│   │   │   │   │   └── listCustomers.usecase.js
│   │   │   │   │
│   │   │   │   ├── invoice/
│   │   │   │   │   ├── createInvoice.usecase.js
│   │   │   │   │   ├── validateCreditLimit.usecase.js
│   │   │   │   │   ├── updateInvoice.usecase.js
│   │   │   │   │   ├── markInvoicePaid.usecase.js
│   │   │   │   │   ├── recalcInvoiceBalance.usecase.js
│   │   │   │   │   └── updateOverdueInvoices.usecase.js
│   │   │   │   │
│   │   │   │   ├── payment/
│   │   │   │   │   ├── recordPayment.usecase.js
│   │   │   │   │   └── reversePayment.usecase.js
│   │   │   │   │
│   │   │   │   ├── report/
│   │   │   │   │   ├── generateAgingReport.usecase.js
│   │   │   │   │   ├── getTotalAR.usecase.js
│   │   │   │   │   ├── getOverdueAR.usecase.js
│   │   │   │   │   └── getHighRiskCustomers.usecase.js
│   │   │   │   │
│   │   │   │   └── notification/
│   │   │   │       ├── sendReminderEmail.usecase.js
│   │   │   │       └── logEmailHistory.usecase.js
│   │   │   │
│   │   │   └── interfaces/
│   │   │       ├── repositories/
│   │   │       │   ├── user.repository.interface.js
│   │   │       │   ├── customer.repository.interface.js
│   │   │       │   ├── invoice.repository.interface.js
│   │   │       │   ├── payment.repository.interface.js
│   │   │       │   └── emailLog.repository.interface.js
│   │   │       │
│   │   │       └── services/
│   │   │           ├── email.service.interface.js
│   │   │           └── clock.service.interface.js
│   │
│   │   ├── domain/                   # CORE DOMAIN – NGHIỆP VỤ KẾ TOÁN
│   │   │   ├── entities/
│   │   │   │   ├── User.js
│   │   │   │   ├── Customer.js
│   │   │   │   ├── Invoice.js
│   │   │   │   ├── Payment.js
│   │   │   │   └── EmailLog.js
│   │   │   │
│   │   │   ├── value-objects/
│   │   │   │   ├── Money.js
│   │   │   │   ├── PaymentTerm.js
│   │   │   │   ├── InvoiceStatus.js
│   │   │   │   ├── CustomerRiskLevel.js
│   │   │   │   └── EmailType.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── AgingService.js
│   │   │   │   ├── CreditLimitService.js
│   │   │   │   └── RiskAssessmentService.js
│   │   │   │
│   │   │   └── events/
│   │   │       ├── InvoiceOverdue.event.js
│   │   │       └── PaymentReceived.event.js
│   │
│   │   ├── infrastructure/           # TRIỂN KHAI KỸ THUẬT
│   │   │   ├── database/
│   │   │   │   ├── migrations/
│   │   │   │   ├── seeders/
│   │   │   │   ├── models/
│   │   │   │   │   ├── user.model.js
│   │   │   │   │   ├── customer.model.js
│   │   │   │   │   ├── invoice.model.js
│   │   │   │   │   ├── payment.model.js
│   │   │   │   │   └── emailLog.model.js
│   │   │   │   │
│   │   │   │   └── repositories/
│   │   │   │       ├── user.repository.js
│   │   │   │       ├── customer.repository.js
│   │   │   │       ├── invoice.repository.js
│   │   │   │       ├── payment.repository.js
│   │   │   │       └── emailLog.repository.js
│   │   │   │
│   │   │   ├── email/
│   │   │   │   ├── nodemailer.service.js
│   │   │   │   └── emailTemplate.factory.js
│   │   │   │
│   │   │   ├── scheduler/
│   │   │   │   ├── cron.registry.js
│   │   │   │   ├── updateInvoiceStatus.job.js
│   │   │   │   └── sendReminderEmail.job.js
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── jwt.service.js
│   │   │       └── passwordHasher.js
│   │
│   │   ├── shared/                   # DÙNG CHUNG TOÀN HỆ THỐNG
│   │   │   ├── utils/
│   │   │   │   ├── date.util.js
│   │   │   │   ├── money.util.js
│   │   │   │   └── aging.util.js
│   │   │   │
│   │   │   ├── constants/
│   │   │   │   ├── roles.js
│   │   │   │   └── enums.js
│   │   │   │
│   │   │   └── errors/
│   │   │       ├── AppError.js
│   │   │       ├── ValidationError.js
│   │   │       └── BusinessRuleError.js
│   │
│   │   └── tests/
│   │       ├── unit/
│   │       │   ├── domain/
│   │       │   └── application/
│   │       └── integration/
│   │           └── api/
│   │
│   └── docs/                         # TÀI LIỆU ĐỒ ÁN
│       ├── system-architecture.png
│       ├── clean-architecture-diagram.png
│       ├── erd-diagram.png
│       ├── business-flow.png
│       ├── api-specification.md
│       └── thesis-report.docx
│
└── README.md                     # Thuyết minh tổng quan đồ án