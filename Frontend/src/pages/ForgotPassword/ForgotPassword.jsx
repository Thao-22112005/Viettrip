import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Vui lòng nhập email.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            setError("Email không hợp lệ.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/api/Auth/forgot-password",
                {
                    email: trimmedEmail,
                }
            );

            console.log(
                "Forgot password response:",
                response.data
            );

            setSuccess(
                response.data?.message ||
                "Mã OTP đã được gửi đến email của bạn."
            );

            // Chuyển sang màn hình nhập OTP
            setTimeout(() => {
                navigate("/forgot-password/verify", {
                    state: {
                        email: response.data?.email || trimmedEmail,
                    },
                });
            }, 800);
        } catch (error) {
            console.error(
                "Forgot password error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Không thể gửi mã OTP. Vui lòng thử lại.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">

                {/* Logo */}
                <Link
                    to="/"
                    className="forgot-password-logo"
                >
                    Viet<span>Trip</span>
                </Link>

                {/* Icon */}
                <div className="forgot-password-icon">
                    🔐
                </div>

                {/* Heading */}
                <div className="forgot-password-header">
                    <h1>Quên mật khẩu?</h1>

                    <p>
                        Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                    </p>
                </div>

                {/* Form */}
                <form
                    className="forgot-password-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <div className="input-wrapper">
                            <span className="input-iconn">
                                ✉
                            </span>

                            <input
                                id="email"
                                type="email"
                                placeholder="Nhập email của bạn"
                                className="forgot-password-input"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);

                                    if (error) {
                                        setError("");
                                    }

                                    if (success) {
                                        setSuccess("");
                                    }
                                }}
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="forgot-message error">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="forgot-message success">
                            <span>✓</span>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="forgot-password-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang gửi OTP..."
                            : "Gửi mã OTP"}
                    </button>
                </form>

                {/* Back to login */}
                <div className="back-to-login">
                    <span>Nhớ mật khẩu rồi?</span>

                    <Link to="/login">
                        Đăng nhập
                    </Link>
                </div>

                {/* Home */}
                <Link
                    to="/"
                    className="back-home"
                >
                    ← Về trang chủ
                </Link>

            </div>
        </div>
    );
}

export default ForgotPassword;