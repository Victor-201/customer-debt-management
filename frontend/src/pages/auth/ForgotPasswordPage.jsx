import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheck } from "react-icons/fi";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Simulate API call - TODO: Implement actual password reset
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // For now, just show success message
            setSuccess(true);
        } catch (err) {
            setError("Không thể gửi email. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            {/* Icon */}
            <div className="auth-form__icon">
                <FiMail />
            </div>

            {/* Header */}
            <div className="auth-form__header">
                <h2 className="auth-form__title">Quên mật khẩu?</h2>
                <p className="auth-form__subtitle">
                    Nhập email đăng ký để nhận liên kết đặt lại mật khẩu.
                    Chúng tôi sẽ gửi hướng dẫn khôi phục cho bạn.
                </p>
            </div>

            {/* Form Body */}
            <div className="auth-form__body">
                {/* Success Message */}
                {success ? (
                    <>
                        <div className="auth-form__success">
                            <FiCheck size={18} />
                            <span>
                                Đã gửi email! Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                            </span>
                        </div>

                        <Link to="/login" className="auth-form__button" style={{ textDecoration: 'none' }}>
                            <FiArrowLeft />
                            Quay lại đăng nhập
                        </Link>
                    </>
                ) : (
                    <>
                        {/* Email Field */}
                        <div className="auth-form__field">
                            <label className="auth-form__label">Email đăng ký</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@arms.com"
                                className="auth-form__input"
                            />
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
                            {loading ? "Đang gửi..." : "Gửi liên kết →"}
                        </button>
                    </>
                )}

                {/* Back Link */}
                {!success && (
                    <Link to="/login" className="auth-form__back">
                        <FiArrowLeft size={16} />
                        Quay lại trang đăng nhập
                    </Link>
                )}
            </div>
        </form>
    );
};

export default ForgotPasswordPage;
