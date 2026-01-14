import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        {/* SYSTEM HEADER */}
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-wide text-slate-800">
            ARMS
          </h1>
          <p className="text-sm text-slate-500">
            Accounts Receivable Management System
          </p>
        </div>

        {/* CONTENT */}
        <Outlet />

        {/* FOOTER */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Hệ thống quản lý công nợ nội bộ doanh nghiệp
          </p>
          <p className="text-xs text-slate-400">
            © 2026 ARMS – Internal Use Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
