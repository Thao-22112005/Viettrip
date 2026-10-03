import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./VerifyForgotPassword.css";

function VerifyForgotPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(120);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        return `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        newOtp[index] = value.slice(-1);

        setOtp(newOtp);
        setError("");
        setSuccess("");

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedData) return;

        const newOtp = ["", "", "", "", "", ""];

        pastedData.split("").forEach((number, index) => {
            newOtp[index] = number;
        });

        setOtp(newOtp);
        setError("");
        setSuccess("");

        const nextIndex = Math.min(
            pastedData.length,
            5
        );

        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const otpValue = otp.join("");

        if (!email) {
            setError(
                "Không tìm thấy email. Vui lòng thực hiện lại từ bước quên mật khẩu."
            );
            return;
        }

        if (otpValue.length !== 6) {
            setError("Vui lòng nhập đầy đủ 6 số OTP.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/api/Auth/verify-forgot-password",
                {
                    email: email,
                    code: otpValue,
                }
            );

            console.log(
                "Verify forgot password response:",
                response.data
            );

            setSuccess(
                response.data?.message ||
                    "Xác thực OTP thành công."
            );

            setTimeout(() => {
                navigate("/reset-password", {
                    state: {
                        email: email,
                    },
                });
            }, 700);
        } catch (error) {
            console.error(
                "Verify forgot password error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Không thể xác thực OTP. Vui lòng thử lại.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0 || resending || !email) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            setResending(true);

            const response = await api.post(
                "/api/Auth/forgot-password",
                {
                    email: email,
                }
            );

            console.log(
                "Resend forgot password OTP response:",
                response.data
            );

            setOtp(["", "", "", "", "", ""]);
            setTimeLeft(120);

            setSuccess(
                response.data?.message ||
                    "Mã OTP mới đã được gửi đến email."
            );

            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error(
                "Resend forgot password OTP error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Không thể gửi lại OTP. Vui lòng thử lại.";

            setError(message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="verify-forgot-page">
            <div className="verify-forgot-card">

                {/* Logo */}
                <Link
                    to="/"
                    className="verify-forgot-logo"
                >
                    Viet<span>Trip</span>
                </Link>

                {/* Icon */}
                <div className="verify-forgot-icon">
                    ✉
                </div>

                {/* Header */}
                <div className="verify-forgot-header">
                    <h1>Xác thực OTP</h1>

                    <p>
                        Mã xác thực đã được gửi đến
                    </p>

                    <strong>
                        {email || "Email không xác định"}
                    </strong>
                </div>

                {/* Form */}
                <form
                    className="verify-forgot-form"
                    onSubmit={handleSubmit}
                >
                    <label className="otp-label">
                        Nhập mã OTP
                    </label>

                    <div
                        className="otp-inputs"
                        onPaste={handlePaste}
                    >
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputRefs.current[index] =
                                        element;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={value}
                                onChange={(e) =>
                                    handleChange(
                                        e.target.value,
                                        index
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleKeyDown(
                                        e,
                                        index
                                    )
                                }
                                autoFocus={index === 0}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="verify-message error">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="verify-message success">
                            <span>✓</span>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="verify-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang xác thực..."
                            : "Xác nhận OTP"}
                    </button>
                </form>

                {/* Resend */}
                <div className="resend-section">
                    <span>
                        Chưa nhận được mã?
                    </span>

                    {timeLeft > 0 ? (
                        <span className="resend-countdown">
                            Gửi lại sau {formatTime()}
                        </span>
                    ) : (
                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResend}
                            disabled={resending}
                        >
                            {resending
                                ? "Đang gửi..."
                                : "Gửi lại mã"}
                        </button>
                    )}
                </div>

                {/* Back */}
                <Link
                    to="/forgot-password"
                    className="verify-back"
                >
                    ← Thay đổi email
                </Link>
            </div>
        </div>
    );
}

export default VerifyForgotPassword;