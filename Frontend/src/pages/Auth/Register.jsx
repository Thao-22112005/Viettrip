import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import api from "../../services/api";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Xóa lỗi khi người dùng nhập lại
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // Kiểm tra mật khẩu
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/api/Auth/register", {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            console.log("Register response:", response.data);

            // Đăng ký thành công → sang trang nhập OTP
            navigate("/verify-otp", {
                state: {
                    email: response.data.email || formData.email.trim(),
                },
            });
        } catch (error) {
            console.error("Register error:", error);

            const message =
                error.response?.data?.message ||
                "Đăng ký thất bại. Vui lòng thử lại.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">

                {/* Left - Image */}
                <div className="auth-image">
                    <div className="auth-image-overlay"></div>

                    <div className="auth-image-content">
                        <span className="auth-image-badge">
                            ✦ VietTrip
                        </span>

                        <h1>
                            Bắt đầu hành trình
                            <br />
                            của bạn
                        </h1>

                        <p>
                            Khám phá những điểm đến tuyệt vời
                            và tạo nên những chuyến đi đáng nhớ.
                        </p>
                    </div>
                </div>

                {/* Right - Form */}
                <div className="auth-form-wrapper">
                    <div className="auth-form">

                        <Link to="/" className="auth-logo">
                            Viet<span>Trip</span>
                        </Link>

                        <div className="auth-heading">
                            <h2>Tạo tài khoản</h2>

                            <p>
                                Đăng ký để bắt đầu khám phá VietTrip
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Full name */}
                            <div className="form-group">
                                <label>Họ và tên</label>

                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Nhập họ và tên"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label>Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="example@gmail.com"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                        name="password"
                                        placeholder="Nhập mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? "Ẩn" : "Hiện"}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div className="form-group">
                                <label>Nhập lại mật khẩu</label>

                                <div className="password-input">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword
                                            ? "Ẩn"
                                            : "Hiện"}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            {/* Terms */}
                            <label className="terms-checkbox">
                                <input
                                    type="checkbox"
                                    required
                                />

                                <span>
                                    Tôi đồng ý với{" "}
                                    <Link to="/terms">
                                        Điều khoản sử dụng
                                    </Link>{" "}
                                    và{" "}
                                    <Link to="/privacy">
                                        Chính sách bảo mật
                                    </Link>
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang đăng ký..."
                                    : "Đăng ký"}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>hoặc</span>
                        </div>

                        <p className="auth-switch">
                            Bạn đã có tài khoản?{" "}
                            <Link to="/login">
                                Đăng nhập
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;