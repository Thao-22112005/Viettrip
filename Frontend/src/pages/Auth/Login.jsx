import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../services/authService";

import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const verified = location.state?.verified;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await loginApi({
                email,
                password,
            });

            console.log("Login response:", response.data);

            const data = response.data;

            /*
             * BE trả:
             *
             * {
             *   message,
             *   userId,
             *   fullName,
             *   email,
             *   token
             * }
             */

            const loggedInUser = login({
                userId: data.userId,
                fullName: data.fullName,
                email: data.email,
                token: data.token,

                // Tạm thời BE chưa trả role
                role: data.role,
            });

            console.log("Logged in user:", loggedInUser);

            if (loggedInUser.role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);

            const message =
                error.response?.data?.message ||
                "Đăng nhập thất bại. Vui lòng thử lại.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                {/* Image */}
                <div className="auth-image login-image">
                    <div className="auth-image-overlay"></div>

                    <div className="auth-image-content">
                        <span className="auth-image-badge">
                            ✦ VietTrip
                        </span>

                        <h1>
                            Mỗi chuyến đi
                            <br />
                            là một câu chuyện
                        </h1>

                        <p>
                            Đăng nhập để tiếp tục hành trình
                            khám phá những vùng đất mới.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="auth-form-wrapper">
                    <div className="auth-form">

                        <Link
                            to="/"
                            className="auth-logo"
                        >
                            Viet<span>Trip</span>
                        </Link>

                        <div className="auth-heading">
                            <h2>Chào mừng trở lại</h2>

                            <p>
                                Đăng nhập vào tài khoản VietTrip
                            </p>
                        </div>

                        {verified && (
                            <div className="success-message">
                                ✓ Email đã được xác thực.
                                Bạn có thể đăng nhập.
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {/* Email */}
                            <div className="form-group">
                                <label>Email</label>

                                <input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label>Mật khẩu</label>

                                <div className="password-input">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Nhập mật khẩu"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Ẩn mật khẩu"
                                                : "Hiện mật khẩu"
                                        }
                                    >
                                        {showPassword ? (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="3"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 3l18 18" />
                                                <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
                                                <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.2 18.2 0 0 1-3.2 4.5" />
                                                <path d="M6.2 6.2C3.6 8.2 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 2.1-.2" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Quên mật khẩu */}
                                <div className="forgot-password">
                                    <Link to="/forgot-password">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang đăng nhập..."
                                    : "Đăng nhập"}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>hoặc</span>
                        </div>

                        <p className="auth-switch">
                            Chưa có tài khoản?{" "}

                            <Link to="/register">
                                Đăng ký ngay
                            </Link>
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;