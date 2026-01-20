import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiFileText,
  FiDollarSign,
  FiUsers,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
} from "react-icons/fi";
import { logoutAsync, selectUser } from "../store/auth.slice";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: "/dashboard", icon: <FiHome />, label: "Dashboard" },
    { to: "/users", icon: <FiUsers />, label: "Nhân viên" },
    { to: "/invoices", icon: <FiFileText />, label: "Hóa đơn" },
    { to: "/payments", icon: <FiDollarSign />, label: "Thanh toán" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
    { to: "/reports", icon: <FiPieChart />, label: "Báo cáo" },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: sidebarOpen ? "260px" : "70px",
          backgroundColor: "var(--color-neutral-900)",
          color: "var(--color-text-inverse)",
          display: "flex",
          flexDirection: "column",
          transition: "width var(--transition-normal)",
          position: "fixed",
          inset: 0,
          zIndex: 100,
        }}
      >
        {/* Logo + Toggle */}
        <div
          style={{
            padding: "var(--spacing-4)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
          }}
        >
          {sidebarOpen && (
            <span style={{ fontWeight: 700, fontSize: "var(--font-size-lg)" }}>
              ARMS
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "var(--spacing-4) 0" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-3)",
                padding: sidebarOpen
                  ? "var(--spacing-3) var(--spacing-4)"
                  : "var(--spacing-3)",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                color: isActive
                  ? "var(--color-primary-light)"
                  : "rgba(255,255,255,0.7)",
                backgroundColor: isActive
                  ? "rgba(59,130,246,0.2)"
                  : "transparent",
                textDecoration: "none",
                borderLeft: isActive
                  ? "3px solid var(--color-primary)"
                  : "3px solid transparent",
              })}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div
          style={{
            padding: "var(--spacing-4)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {sidebarOpen && user && (
            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <p>{user.name}</p>
              <small style={{ opacity: 0.7 }}>{user.email}</small>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: "var(--spacing-2)",
              padding: "var(--spacing-2)",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <FiLogOut />
            {sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "260px" : "70px",
          transition: "margin-left var(--transition-normal)",
          backgroundColor: "var(--color-background)",
        }}
      >
        <header
          style={{
            height: 60,
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 var(--spacing-6)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <span>Quản lý Công nợ Khách hàng</span>
          <FiSettings />
        </header>

        <div style={{ padding: "var(--spacing-6)" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
