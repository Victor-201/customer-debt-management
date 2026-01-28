import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiArrowRight } from "react-icons/fi";
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
            placeholder="example@facredit.vn"
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
      </div>
    </form>
  );
};

export default LoginPage;
