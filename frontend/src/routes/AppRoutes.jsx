import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import PrivateRoute from "./PrivateRoute";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import UserListPage from "../pages/users/UserListPage";
import UserFormPage from "../pages/users/UserFormPage";
import DeletedUserPage from "../pages/users/DeletedUserPage";

// Invoice & Payment Pages (Frontend 3)
import InvoiceListPage from "../pages/invoices/InvoiceListPage";
import InvoiceFormPage from "../pages/invoices/InvoiceFormPage";
import InvoiceDetailPage from "../pages/invoices/InvoiceDetailPage";
import PaymentPage from "../pages/payments/PaymentPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* PRIVATE */}
      <Route
        element={
          //<PrivateRoute>
          <DashboardLayout />
          //</PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* USERS */}
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/create" element={<UserFormPage />} />
        <Route path="/users/:userId/edit" element={<UserFormPage />} />
        <Route path="/users/deleted" element={<DeletedUserPage />} />

        {/* INVOICES (Frontend 3) */}
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/new" element={<InvoiceFormPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/invoices/:id/edit" element={<InvoiceFormPage />} />

        {/* PAYMENTS (Frontend 3) */}
        <Route path="/payments" element={<PaymentPage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
};

export default AppRoutes;
