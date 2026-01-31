import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  FiChevronDown,
  FiChevronRight,
  FiBriefcase,
  FiAlertTriangle,
  FiClock,
  FiMail,
  FiBarChart2,
  FiUser,
} from "react-icons/fi";
import {
  logoutAsync,
  selectUser,
  selectAccessToken,
} from "../store/auth.slice";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(
    location.pathname.startsWith("/reports")
  );

  // Navigation items grouped by section
  const navSections = [
    {
      title: "TỔNG QUAN",
      items: [
        { to: "/dashboard", icon: <FiHome />, label: "Dashboard" },
      ],
    },
    {
      title: "QUẢN LÝ",
      items: [
        { to: "/customers", icon: <FiBriefcase />, label: "Khách hàng" },
        { to: "/invoices", icon: <FiFileText />, label: "Hóa đơn" },
        { to: "/payments", icon: <FiDollarSign />, label: "Thanh toán" },
        { to: "/users", icon: <FiUser />, label: "Nhân viên" },
      ],
    },
    {
      title: "BÁO CÁO",
      expandable: true,
      expanded: reportsExpanded,
      onToggle: () => setReportsExpanded(!reportsExpanded),
      items: [
        { to: "/reports/aging", icon: <FiBarChart2 />, label: "Tuổi nợ" },
        { to: "/reports/high-risk", icon: <FiAlertTriangle />, label: "Rủi ro cao" },
        { to: "/reports/overdue", icon: <FiClock />, label: "Quá hạn" },
        { to: "/reports/email-history", icon: <FiMail />, label: "Lịch sử gửi mail" },
      ],
    },
    {
      title: "CÀI ĐẶT",
      items: [
        { to: "/settings/email", icon: <FiSettings />, label: "Cấu hình Email" },
      ],
    },
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
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--collapsed"}`}>
        {/* Logo Section */}
        <div className="sidebar__header">
          {sidebarOpen && (
            <div className="sidebar__logo">
              <img
                src="/fa-credit-logo.png"
                alt="FA Credit"
                className="sidebar__logo-icon"
                style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }}
              />
              <div className="sidebar__logo-text">
                <span className="sidebar__logo-name">FA Credit</span>
                <span className="sidebar__logo-subtitle">Quản lý công nợ</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar__toggle"
            aria-label={sidebarOpen ? "Thu gọn" : "Mở rộng"}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              {sidebarOpen && (
                <div
                  className={`nav-section__title ${section.expandable ? "nav-section__title--clickable" : ""}`}
                  onClick={section.expandable ? section.onToggle : undefined}
                >
                  <span>{section.title}</span>
                  {section.expandable && (
                    <span className="nav-section__chevron">
                      {section.expanded ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                  )}
                </div>
              )}

              {(!section.expandable || section.expanded || !sidebarOpen) && (
                <div className="nav-section__items">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? "nav-item--active" : ""} ${!sidebarOpen ? "nav-item--collapsed" : ""}`
                      }
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <span className="nav-item__icon">{item.icon}</span>
                      {sidebarOpen && <span className="nav-item__label">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar__footer">
          {sidebarOpen && user && (
            <div className="user-info">
              <div className="user-info__avatar">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="user-info__details">
                <p className="user-info__name">{user.name}</p>
                <p className="user-info__email">{user.email}</p>
              </div>
            </div>
          )}

          <button onClick={handleLogout} className="logout-btn" title="Đăng xuất">
            <FiLogOut />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`main-content ${sidebarOpen ? "main-content--sidebar-open" : "main-content--sidebar-collapsed"}`}>
        <div className="main-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
