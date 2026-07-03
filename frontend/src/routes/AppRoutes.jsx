import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
/* ================= AUTH ================= */
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
/* ================= DASHBOARD ================= */
import DashboardPage from "../pages/dashboard/DashboardPage";
/* ================= USERS ================= */
import UserListPage from "../pages/users/UserListPage";
import UserFormPage from "../pages/users/UserFormPage";
import DeletedUserPage from "../pages/users/DeletedUserPage";
/* ================= CUSTOMERS ================= */
import CustomerListPage from "../pages/customers/CustomerListPage";
import CustomerDetailPage from "../pages/customers/CustomerDetailPage";
import CustomerFormPage from "../pages/customers/CustomerFormPage";
/* ================= INVOICES ================= */
import InvoiceListPage from "../pages/invoices/InvoiceListPage";
import InvoiceFormPage from "../pages/invoices/InvoiceFormPage";
import InvoiceDetailPage from "../pages/invoices/InvoiceDetailPage";
/* ================= PAYMENTS ================= */
import PaymentPage from "../pages/payments/PaymentPage";
/* ================= REPORTS ================= */
import AgingReportPage from "../pages/reports/AgingReportPage";
import HighRiskCustomerPage from "../pages/reports/HighRiskCustomerPage";
import OverdueARPage from "../pages/reports/OverdueARPage";
import EmailHistoryPage from "../pages/reports/EmailHistoryPage";
/* ================= SETTINGS ================= */
import EmailSettingsPage from "../pages/settings/EmailSettingsPage";
/* ================= ERRORS ================= */
import NotFoundPage from "../pages/NotFoundPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to login - ĐẶT TRƯỚC TIÊN */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ================= AUTH ================= */}
      {/* LoginPage renders directly with its own full-page design */}
      <Route path="/login" element={<LoginPage />} />

      {/* Other auth pages still use AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* ================= PRIVATE ================= */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* DASHBOARD */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ================= USERS ================= */}
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/create" element={<UserFormPage />} />
        <Route path="/users/:userId/edit" element={<UserFormPage />} />
        <Route path="/users/deleted" element={<DeletedUserPage />} />

        {/* ================= CUSTOMERS ================= */}
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />

        {/* ================= INVOICES ================= */}
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/new" element={<InvoiceFormPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />

        {/* ================= PAYMENTS ================= */}
        <Route path="/payments" element={<PaymentPage />} />

        {/* ================= REPORTS ================= */}
        <Route path="/reports/aging" element={<AgingReportPage />} />
        <Route path="/reports/high-risk" element={<HighRiskCustomerPage />} />
        <Route path="/reports/overdue" element={<OverdueARPage />} />
        <Route path="/reports/email-history" element={<EmailHistoryPage />} />

        {/* ================= SETTINGS ================= */}
        <Route path="/settings" element={<EmailSettingsPage />} />
        <Route path="/settings/email" element={<EmailSettingsPage />} />

        {/* ================= 404 INSIDE DASHBOARD ================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* ================= FALLBACK - 404 PAGE ================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;