import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Invoice pages
import InvoiceListPage from '../pages/invoices/InvoiceListPage.jsx';
import InvoiceFormPage from '../pages/invoices/InvoiceFormPage.jsx';
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage.jsx';

// Payment pages
import PaymentPage from '../pages/payments/PaymentPage.jsx';

/**
 * Dashboard placeholder - can be expanded later
 */
const DashboardPage = () => (
    <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-6)' }}>
            Dashboard
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)' }}>
            <div className="card">
                <p className="text-sm text-secondary mb-1">Tổng công nợ</p>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-danger)' }}>
                    Coming soon...
                </p>
            </div>
            <div className="card">
                <p className="text-sm text-secondary mb-1">Công nợ quá hạn</p>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-warning)' }}>
                    Coming soon...
                </p>
            </div>
            <div className="card">
                <p className="text-sm text-secondary mb-1">Đã thu trong tháng</p>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>
                    Coming soon...
                </p>
            </div>
            <div className="card">
                <p className="text-sm text-secondary mb-1">Khách hàng rủi ro</p>
                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-danger)' }}>
                    Coming soon...
                </p>
            </div>
        </div>
        <p className="text-secondary mt-6">
            Dashboard sẽ được hoàn thiện sau khi có backend.
        </p>
    </div>
);

/**
 * Customer placeholder
 */
const CustomersPage = () => (
    <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)' }}>
            Quản lý Khách hàng
        </h1>
        <p className="text-secondary">Module khách hàng sẽ được phát triển sau.</p>
    </div>
);

/**
 * Reports placeholder
 */
const ReportsPage = () => (
    <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)' }}>
            Báo cáo
        </h1>
        <p className="text-secondary">Module báo cáo sẽ được phát triển sau.</p>
    </div>
);

/**
 * AppRoutes Component
 * Defines all routes for the application
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Dashboard Layout */}
            <Route path="/" element={<DashboardLayout />}>
                {/* Default redirect to invoices */}
                <Route index element={<Navigate to="/invoices" replace />} />

                {/* Dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Invoice routes */}
                <Route path="invoices" element={<InvoiceListPage />} />
                <Route path="invoices/new" element={<InvoiceFormPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />

                {/* Payment routes */}
                <Route path="payments" element={<PaymentPage />} />

                {/* Customer routes (placeholder) */}
                <Route path="customers" element={<CustomersPage />} />

                {/* Report routes (placeholder) */}
                <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
