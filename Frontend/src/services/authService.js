import api from "./api";

// Đăng nhập
export const loginApi = (data) => {
    return api.post("/api/Auth/login", data);
};

// Đăng ký
export const registerApi = (data) => {
    return api.post("/api/Auth/register", data);
};

// Xác thực OTP đăng ký
export const verifyOtpApi = (data) => {
    return api.post("/api/Auth/verify-otp", data);
};

// Gửi lại OTP đăng ký
export const resendOtpApi = (data) => {
    return api.post("/api/Auth/resend-otp", data);
};

// Quên mật khẩu
export const forgotPasswordApi = (data) => {
    return api.post("/api/Auth/forgot-password", data);
};

// Xác thực OTP quên mật khẩu
export const verifyForgotPasswordApi = (data) => {
    return api.post("/api/Auth/verify-forgot-password", data);
};

// Đặt lại mật khẩu
export const resetPasswordApi = (data) => {
    return api.post("/api/Auth/reset-password", data);
};

// Lấy thông tin profile
export const getProfileApi = () => {
    return api.get("/api/Auth/profile");
};