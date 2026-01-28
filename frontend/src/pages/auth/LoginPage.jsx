import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import {
  loginAsync,
  selectAccessToken,
  selectAuthLoading,
  selectAuthError,
} from "../../store/auth.slice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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
    <form onSubmit={handleSubmit} className="auth-form">
      {/* Icon */}
      <div className="auth-form__icon">
        <FiMail />
      </div>

      {/* Header */}
      <div className="auth-form__header">
        <h2 className="auth-form__title">Đăng nhập hệ thống</h2>
        <p className="auth-form__subtitle">
          Dành cho kế toán và quản lý công nợ
        </p>
      </div>

      {/* Form Body */}
      <div className="auth-form__body">
        {/* Email Field */}
        <div className="auth-form__field">
          <label className="auth-form__label">Email công ty</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="example@arms.vn"
            className="auth-form__input"
          />
        </div>

        {/* Password Field */}
        <div className="auth-form__field">
          <label className="auth-form__label">Mật khẩu</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="auth-form__input"
          />
        </div>

        {/* Options Row */}
        <div className="auth-form__options">
          <label className="auth-form__checkbox">
            <input type="checkbox" name="remember" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="auth-form__link">
            Quên mật khẩu?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-form__error">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-form__button"
        >
          {loading ? "Đang xác thực..." : (
            <>
              Đăng nhập
              <FiArrowRight />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="auth-form__divider">
          Hoặc đăng nhập với
        </div>

        {/* Google Button */}
        <button type="button" className="auth-form__google">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          Tiếp tục với Google Workspace
        </button>
      </div>
    </form>
  );
};

export default LoginPage;
