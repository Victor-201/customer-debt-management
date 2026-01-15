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
import {
  logoutAsync,
  selectUser,
  selectAccessToken,
} from "../store/auth.slice";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);

  const accessToken = useSelector(selectAccessToken);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: "/dashboard", icon: <FiHome />, label: "Dashboard" },
    { to: "/invoices", icon: <FiFileText />, label: "Hóa đơn" },
    { to: "/payments", icon: <FiDollarSign />, label: "Thanh toán" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
    { to: "/reports", icon: <FiPieChart />, label: "Báo cáo" },
  ];

  const handleLogout = async () => {
    await dispatch(logoutAsync()).unwrap();
    navigate("/login", { replace: true });
  };

  if (!accessToken) {
    navigate("/login", { replace: true });
    return null;
  }

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
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
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
              color: "var(--color-text-inverse)",
              cursor: "pointer",
              padding: "var(--spacing-2)",
            }}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

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
                  ? "rgba(59, 130, 246, 0.2)"
                  : "transparent",
                textDecoration: "none",
                transition: "all var(--transition-fast)",
                borderLeft: isActive
                  ? "3px solid var(--color-primary)"
                  : "3px solid transparent",
                fontSize: "var(--font-size-sm)",
              })}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            padding: "var(--spacing-4)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {sidebarOpen && user && (
            <div style={{ marginBottom: "var(--spacing-3)" }}>
              <p style={{ fontWeight: 500, fontSize: "var(--font-size-sm)" }}>
                {user.name}
              </p>
              <p style={{ fontSize: "var(--font-size-xs)", opacity: 0.7 }}>
                {user.email}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              width: "100%",
              padding: "var(--spacing-2) var(--spacing-3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-inverse)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              transition: "background-color var(--transition-fast)",
            }}
          >
            <FiLogOut />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "260px" : "70px",
          transition: "margin-left var(--transition-normal)",
          backgroundColor: "var(--color-background)",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            height: "60px",
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
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            Quản lý Công nợ Khách hàng
          </span>

          <button className="btn btn-ghost btn-icon">
            <FiSettings />
          </button>
        </header>

        <div style={{ padding: "var(--spacing-6)" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
