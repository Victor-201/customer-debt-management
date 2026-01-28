import { Outlet } from "react-router-dom";
import { FiPieChart } from "react-icons/fi";
import "./AuthLayout.css";

const AuthLayout = () => {
  return (
    <div className="auth-container">
      {/* Left Panel - Branding */}
      <div className="auth-branding">
        <div className="auth-branding__content">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo__icon">
              <FiPieChart />
            </div>
            <span className="auth-logo__text">ARMS</span>
          </div>

          {/* Hero Text */}
          <div className="auth-hero">
            <h1 className="auth-hero__title">
              Quản lý hiệu quả,
              <br />
              <span className="auth-hero__gradient">Vận hành tối ưu.</span>
            </h1>
            <p className="auth-hero__subtitle">
              Hệ thống Quản lý Tài nguyên Doanh nghiệp giúp
              bạn kiểm soát mọi khía cạnh của quy trình kinh
              doanh từ một nền tảng duy nhất.
            </p>
          </div>

          {/* Decorative Pattern */}
          <div className="auth-pattern">
            <div className="auth-pattern__grid"></div>
          </div>

          {/* Footer */}
          <div className="auth-branding__footer">
            <p>Tin cậy bởi hơn 500 doanh nghiệp.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          <Outlet />

          {/* Footer */}
          <div className="auth-footer">
            <p>© 2026 ARMS – Internal Use Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
