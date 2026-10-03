import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./ResetPassword.css";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email) {
            setError(
                "Không tìm thấy email. Vui lòng thực hiện lại quá trình quên mật khẩu."
            );
            return;
        }

        if (!password) {
            setError("Vui lòng nhập mật khẩu mới.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Mật khẩu phải có ít nhất 6 ký tự."
            );
            return;
        }

        if (!confirmPassword) {
            setError("Vui lòng nhập lại mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Mật khẩu nhập lại không khớp."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/api/Auth/reset-password",
                {
                    email: email,
                    newPassword: password,
                }
            );

            console.log(
                "Reset password response:",
                response.data
            );

            setSuccess(
                response.data?.message ||
                    "Đặt lại mật khẩu thành công."
            );

            setTimeout(() => {
                navigate("/login", {
                    state: {
                        resetSuccess:
                            "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
                    },
                });
            }, 1000);
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Không thể đặt lại mật khẩu. Vui lòng thử lại.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="reset-password-card">

                {/* Logo */}
                <Link
                    to="/"
                    className="reset-password-logo"
                >
                    Viet<span>Trip</span>
                </Link>

                {/* Icon */}
                <div className="reset-password-icon">
                    🔑
                </div>

                {/* Header */}
                <div className="reset-password-header">
                    <h1>Đặt lại mật khẩu</h1>

                    <p>
                        Tạo mật khẩu mới cho tài khoản
                    </p>

                    <strong>
                        {email || "Email không xác định"}
                    </strong>
                </div>

                {/* Form */}
                <form
                    className="reset-password-form"
                    onSubmit={handleSubmit}
                >

                    {/* New password */}
                    <div className="reset-form-group">
                        <label htmlFor="new-password">
                            Mật khẩu mới
                        </label>

                        <div className="reset-input-wrapper">
                            <span className="reset-input-icon">
                                🔒
                            </span>

                            <input
                                id="new-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Nhập mật khẩu mới"
                                value={password}
                                onChange={(e) => {
                                    setPassword(
                                        e.target.value
                                    );
                                    setError("");
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showPassword
                                    ? "◉"
                                    : "○"}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div className="reset-form-group">
                        <label htmlFor="confirm-password">
                            Nhập lại mật khẩu
                        </label>

                        <div className="reset-input-wrapper">
                            <span className="reset-input-icon">
                                🔒
                            </span>

                            <input
                                id="confirm-password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(
                                        e.target.value
                                    );
                                    setError("");
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showConfirmPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showConfirmPassword
                                    ? "◉"
                                    : "○"}
                            </button>
                        </div>
                    </div>

                    {/* Password rules */}
                    <div className="password-rules">
                        <div
                            className={
                                password.length >= 6
                                    ? "rule valid"
                                    : "rule"
                            }
                        >
                            <span>
                                {password.length >= 6
                                    ? "✓"
                                    : "•"}
                            </span>

                            Ít nhất 6 ký tự
                        </div>

                        <div
                            className={
                                password &&
                                password ===
                                    confirmPassword
                                    ? "rule valid"
                                    : "rule"
                            }
                        >
                            <span>
                                {password &&
                                password ===
                                    confirmPassword
                                    ? "✓"
                                    : "•"}
                            </span>

                            Hai mật khẩu trùng nhau
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="reset-message error">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="reset-message success">
                            <span>✓</span>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="reset-password-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang đặt lại..."
                            : "Đặt lại mật khẩu"}
                    </button>
                </form>

                {/* Back login */}
                <div className="reset-back-login">
                    <span>Nhớ mật khẩu rồi?</span>

                    <Link to="/login">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;