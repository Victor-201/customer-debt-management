import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../../store/auth.slice';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import '../../styles/global.css';
import FloatingIcons from "../../components/FloatingIcons";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/dashboard';
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  const handleSignIn = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const form = new FormData(e.target);

      const { data } = await apiClient.post('/auth/login', {
        email: form.get('email'),
        password: form.get('password'),
      });    
      dispatch(loginSuccess(data));
    } catch (err) {
      dispatch(
        loginFailure(
          err.response?.data?.error || 'Đăng nhập thất bại'
        )
      );
    }
  };
  const handleGoogleLogin = async () => {
    dispatch(loginStart());

    try {      
      const { data } = await apiClient.post('/auth/login', {
        email: 'google.user@gmail.com',
        password: 'google-oauth',
      });

      dispatch(loginSuccess(data));
    } catch (err) {
      dispatch(
        loginFailure(
          err.response?.data?.error || 'Google login thất bại'
        )
      );
    }
  };
  const handleRegisterClick = () => {
    containerRef.current.classList.add('active');
  };

  const handleLoginClick = () => {
    containerRef.current.classList.remove('active');
  };

 return (
  <>
    <FloatingIcons />

    <div className="login-page">
      <div className="container" ref={containerRef}>
        <div className="form-container sign-in">
          <form onSubmit={handleSignIn}>
            <h1>Đăng nhập</h1>

            <input
              name="email"
              type="email"
              placeholder="Email"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              required
            />

            <button type="submit" className="btn-login">
              ĐĂNG NHẬP
            </button>

            <a className="forgot-password">
              Quên mật khẩu
            </a>

            <div className="or-divider">
              <span>Hoặc</span>
            </div>
            <div className="social-login">
              <button
                type="button"
                className="social-btn google"
                onClick={handleGoogleLogin}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                />
                Đăng nhập bằng Google
              </button>
            </div>

            <p className="register-text">
              Bạn mới biết đến hệ thống?{" "}
              <span onClick={handleRegisterClick}>
                Đăng ký
              </span>
            </p>
          </form>
        </div>
        <div className="form-container sign-up">
          <form>
            <h1>Tạo tài khoản</h1>
            <input placeholder="Họ tên" />
            <input placeholder="Email" />
            <input placeholder="Mật khẩu" />
            <button type="button">Đăng ký</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Chào mừng quay lại!</h1>
              <p>Vui lòng đăng nhập để tiếp tục</p>
              <button
                type="button"
                className="hidden"
                onClick={handleLoginClick}
              >
                Đăng nhập
              </button>
            </div>

            <div className="toggle-panel toggle-right">
              <h1>Xin chào!</h1>
              <p>Tạo tài khoản để bắt đầu sử dụng</p>
              <button
                type="button"
                className="hidden"
                onClick={handleRegisterClick}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export default LoginPage;
