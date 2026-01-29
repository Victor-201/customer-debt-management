import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  loginAsync,
  selectAccessToken,
  selectAuthLoading,
  selectAuthError,
} from "../../store/auth.slice";
import "./LoginPage.css";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const accessToken = useSelector(selectAccessToken);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (accessToken) {
      navigate(from, { replace: true });
    }
  }, [accessToken, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    dispatch(
      loginAsync({
        email: form.get("email"),
        password: form.get("password"),
      })
    );
  };

  return (
    <div className="login-page">
      {/* Background Effects */}
      <div className="login-bg">
        <div className="login-bg__blob login-bg__blob--1"></div>
        <div className="login-bg__blob login-bg__blob--2"></div>
        <div className="login-bg__blob login-bg__blob--3"></div>
        <div className="login-bg__watermark">FA Credit</div>
      </div>

      {/* Main Content */}
      <div className="login-container">
        <div className="login-grid">
          {/* Left Side - Form */}
          <div className="login-form-section">
            {/* Logo */}
            <div className="login-logo">
              <img
                src="/fa-credit-logo.png"
                alt="FA Credit Logo"
                className="login-logo__icon"
              />
              <div className="login-logo__text">
                <span className="login-logo__name">FA Credit</span>
                <span className="login-logo__tagline">Enterprise</span>
              </div>
            </div>

            {/* Headline */}
            <div className="login-headline">
              <h1>
                Fluidity in <br />
                <span className="login-headline__accent">Financial Data.</span>
              </h1>
              <p>
                Hệ thống quản lý công nợ thông minh. Seamlessly integrated for modern accounting teams.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="login-field">
                <label htmlFor="email">Email Access</label>
                <div className="login-field__wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="accounting@facredit.vn"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="login-field">
                <label htmlFor="password">Security Key</label>
                <div className="login-field__wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="login-field__toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="login-options">
                <label className="login-checkbox">
                  <input type="checkbox" name="remember" />
                  <span>Keep me logged in</span>
                </label>
                <Link to="/forgot-password" className="login-link">Recovery?</Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="login-submit">
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Authenticate</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              {/* Footer */}
              <p className="login-footer">
                © 2026 FA Credit by Group 6 XDHTTTQL
              </p>
            </form>
          </div>

          {/* Right Side - Visual */}
          <div className="login-visual">
            <div className="login-visual__container">
              {/* Glow Effect */}
              <div className="login-visual__glow"></div>

              {/* Glass Cards */}
              <div className="login-visual__card login-visual__card--1"></div>

              <div className="login-visual__card login-visual__card--2">
                <div className="login-visual__lines">
                  <div className="login-visual__line" style={{ width: '100%' }}></div>
                  <div className="login-visual__line" style={{ width: '75%' }}></div>
                  <div className="login-visual__line" style={{ width: '50%' }}></div>
                </div>
                <div className="login-visual__chart">
                  <div className="login-visual__bar" style={{ height: '40%' }}></div>
                  <div className="login-visual__bar" style={{ height: '70%' }}></div>
                  <div className="login-visual__bar" style={{ height: '55%' }}></div>
                  <div className="login-visual__bar" style={{ height: '90%' }}></div>
                </div>
              </div>

              {/* Floating Circle */}
              <div className="login-visual__circle"></div>

              {/* Stats Card */}
              <div className="login-visual__stats">
                <div className="login-visual__stats-label">Daily Revenue</div>
                <div className="login-visual__stats-value">+24.5%</div>
              </div>

              {/* Ring */}
              <div className="login-visual__ring"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
