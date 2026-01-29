import { Outlet } from "react-router-dom";
import "./AuthLayout.css";

const AuthLayout = () => {
  return (
    <div className="auth-container">
      {/* Left Panel - Branding */}
      <div className="auth-branding">
        <div className="auth-branding__content">
          {/* Logo */}
          <div className="auth-logo">
            <img
              src="/fa-credit-logo.png"
              alt="FA Credit Logo"
              className="auth-logo__image"
            />
            <span className="auth-logo__text">FA Credit</span>
          </div>

          {/* Hero Text */}
          <div className="auth-hero">
            <h1 className="auth-hero__title">
              Quản lý hiệu quả,
              <br />
              <span className="auth-hero__gradient">Vận hành tối ưu.</span>
            </h1>
            <p className="auth-hero__subtitle">
              Hệ thống Quản lý Công nợ Khách hàng giúp
              bạn theo dõi, kiểm soát và thu hồi nợ
              một cách hiệu quả và chuyên nghiệp.
            </p>
          </div>

          {/* Decorative Pattern */}
          <div className="auth-pattern">
            <div className="auth-pattern__grid"></div>
          </div>

          {/* Footer */}
          <div className="auth-branding__footer">
            <p>Giải pháp quản lý công nợ hàng đầu.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          <Outlet />

          {/* Footer */}
          <div className="auth-footer">
            <p>© 2026 FA Credit by Group 6 XDHTTTQL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
