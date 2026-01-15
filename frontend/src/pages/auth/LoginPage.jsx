import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAsync,
  selectAccessToken,
  selectAuthLoading,
  selectAuthError,
} from "../../store/auth.slice";
import { useNavigate, useLocation } from "react-router-dom";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Đăng nhập hệ thống
        </h2>
        <p className="text-sm text-slate-500">
          Dành cho kế toán và quản lý công nợ
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">
          Email người dùng
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2
                   rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                   hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Đang xác thực..." : "Đăng nhập"}
      </button>
    </form>
  );
};

export default LoginPage;
