import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";
import "./VerifyOTP.css";

function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const [otp, setOtp] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);

    const [timeLeft, setTimeLeft] = useState(120);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState("");

    // Nếu không có email thì quay lại Register
    useEffect(() => {
        if (!email) {
            navigate("/register", { replace: true });
        }
    }, [email, navigate]);

    // Đếm ngược 120 giây
    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];

        newOtp[index] = value.slice(-1);

        setOtp(newOtp);
        setError("");

        if (value && index < 5) {
            document
                .getElementById(`otp-${index + 1}`)
                ?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            document
                .getElementById(`otp-${index - 1}`)
                ?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setError("Vui lòng nhập đủ 6 số OTP!");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.post(
                "/api/Auth/verify-otp",
                {
                    email: email,
                    code: otpValue,
                }
            );

            console.log(
                "Verify OTP response:",
                response.data
            );

            // Xác thực thành công → Login
            navigate("/login", {
                state: {
                    verified: true,
                },
            });
        } catch (error) {
            console.error(
                "Verify OTP error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Xác thực OTP thất bại. Vui lòng thử lại.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            setError("");

            const response = await api.post(
                "/api/Auth/resend-otp",
                {
                    email: email,
                }
            );

            console.log(
                "Resend OTP response:",
                response.data
            );

            setOtp([
                "",
                "",
                "",
                "",
                "",
                "",
            ]);

            setTimeLeft(120);

            document
                .getElementById("otp-0")
                ?.focus();
        } catch (error) {
            console.error(
                "Resend OTP error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Không thể gửi lại OTP. Vui lòng thử lại.";

            setError(message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="otp-page">
            <div className="otp-card">

                <Link
                    to="/"
                    className="otp-logo"
                >
                    Viet<span>Trip</span>
                </Link>

                <div className="otp-icon">
                    ✉
                </div>

                <div className="otp-heading">
                    <h1>Xác thực email</h1>

                    <p>
                        Mã OTP đã được gửi đến
                    </p>

                    <strong>
                        {email}
                    </strong>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="otp-inputs">
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={value}
                                onChange={(e) =>
                                    handleChange(
                                        index,
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) =>
                                    handleKeyDown(
                                        index,
                                        e
                                    )
                                }
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="otp-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="otp-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang xác thực..."
                            : "Xác nhận OTP"}
                    </button>
                </form>

                <div className="otp-resend">
                    <span>
                        Không nhận được mã?
                    </span>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={
                            timeLeft > 0 ||
                            resendLoading
                        }
                    >
                        {resendLoading
                            ? "Đang gửi..."
                            : timeLeft > 0
                                ? `Gửi lại sau ${timeLeft}s`
                                : "Gửi lại mã"}
                    </button>
                </div>

                <Link
                    to="/register"
                    className="otp-back"
                >
                    ← Quay lại đăng ký
                </Link>

            </div>
        </div>
    );
}

export default VerifyOTP;