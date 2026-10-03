import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../services/api";

import "./Profile.css";

function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // =========================
    // LẤY PROFILE
    // =========================

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Bạn chưa đăng nhập.");
                return;
            }

            const response = await api.get("/api/Auth/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Profile response:", response.data);

            const profileData = response.data;

            setUser(profileData);

            setFormData({
                fullName: profileData.fullName || "",
                phone: profileData.phone || "",
                address: profileData.address || "",
            });
        } catch (error) {
            console.error("Profile error:", error);

            const message =
                error.response?.data?.message ||
                "Không thể tải thông tin tài khoản.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // XỬ LÝ INPUT PROFILE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // XỬ LÝ INPUT MẬT KHẨU
    // =========================

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // LƯU PROFILE
    // =========================

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Bạn chưa đăng nhập.");
                return;
            }

            if (!formData.fullName.trim()) {
                alert("Họ và tên không được để trống.");
                return;
            }

            setSaving(true);

            const response = await api.put(
                "/api/Auth/profile",
                {
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.trim(),
                    address: formData.address.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Update profile response:",
                response.data
            );

            setUser(response.data);

            setFormData({
                fullName: response.data.fullName || "",
                phone: response.data.phone || "",
                address: response.data.address || "",
            });

            setIsEditing(false);

            alert("Cập nhật thông tin thành công.");
        } catch (error) {
            console.error(
                "Update profile error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Không thể cập nhật thông tin."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // HỦY CHỈNH SỬA PROFILE
    // =========================

    const handleCancel = () => {
        setFormData({
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            address: user?.address || "",
        });

        setIsEditing(false);
    };

    // =========================
    // ĐỔI MẬT KHẨU
    // =========================

    const handleChangePassword = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Bạn chưa đăng nhập.");
                return;
            }

            if (!passwordForm.currentPassword) {
                alert("Vui lòng nhập mật khẩu hiện tại.");
                return;
            }

            if (!passwordForm.newPassword) {
                alert("Vui lòng nhập mật khẩu mới.");
                return;
            }

            if (!passwordForm.confirmPassword) {
                alert("Vui lòng nhập lại mật khẩu mới.");
                return;
            }

            if (
                passwordForm.newPassword !==
                passwordForm.confirmPassword
            ) {
                alert(
                    "Mật khẩu mới và xác nhận mật khẩu không khớp."
                );
                return;
            }

            if (passwordForm.newPassword.length < 6) {
                alert(
                    "Mật khẩu mới phải có ít nhất 6 ký tự."
                );
                return;
            }

            setChangingPassword(true);

            const response = await api.put(
                "/api/Auth/change-password",
                {
                    currentPassword:
                        passwordForm.currentPassword,

                    newPassword:
                        passwordForm.newPassword,

                    confirmPassword:
                        passwordForm.confirmPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Change password response:",
                response.data
            );

            alert(
                response.data?.message ||
                "Đổi mật khẩu thành công."
            );

            // Xóa dữ liệu trong form
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // Đóng khu vực đổi mật khẩu
            setShowPassword(false);
        } catch (error) {
            console.error(
                "Change password error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Không thể đổi mật khẩu."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="profile-page-j">
                <div
                    style={{
                        minHeight: "400px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                    }}
                >
                    Đang tải thông tin tài khoản...
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="profile-page-j">
                <div
                    style={{
                        minHeight: "400px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        color: "#dc2626",
                    }}
                >
                    <strong>{error}</strong>

                    <button
                        type="button"
                        className="save-button-j"
                        onClick={fetchProfile}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page-j">

            {/* =========================
                HERO
            ========================= */}

            <section className="profile-hero-j">
                <div className="profile-hero-content-j">

                    <div className="profile-breadcrumb-j">
                        <Link to="/">
                            Trang chủ
                        </Link>

                        <span>›</span>

                        <span>
                            Hồ sơ cá nhân
                        </span>
                    </div>

                    <h1>
                        Hồ sơ cá nhân
                    </h1>

                    <p>
                        Quản lý thông tin và hoạt động
                        của bạn trên VietTrip
                    </p>

                </div>
            </section>

            <main className="profile-container-j">

                {/* =========================
                    PROFILE OVERVIEW
                ========================= */}

                <section className="profile-overview-j">

                    <div className="profile-avatar-j">
                        <span>
                            {user?.fullName
                                ?.split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </span>
                    </div>

                    <div className="profile-user-info-j">

                        <h2>
                            {user?.fullName}
                        </h2>

                        <p>
                            {user?.email}
                        </p>

                        <span className="profile-member-j">
                            Thành viên VietTrip
                        </span>

                    </div>

                    <button
                        type="button"
                        className="profile-edit-button-j"
                        onClick={() =>
                            setIsEditing(true)
                        }
                    >
                        ✎ Chỉnh sửa
                    </button>

                </section>

                <div className="profile-layout-j">

                    <div className="profile-main-j">

                        {/* =========================
                            THÔNG TIN CÁ NHÂN
                        ========================= */}

                        <section className="profile-card-j">

                            <div className="profile-card-header-j">

                                <div>

                                    <h3>
                                        Thông tin cá nhân
                                    </h3>

                                    <p>
                                        Thông tin cơ bản
                                        của tài khoản
                                    </p>

                                </div>

                            </div>

                            <div className="profile-form-grid-j">

                                {/* HỌ TÊN */}

                                <div className="profile-form-group-j">

                                    <label>
                                        Họ và tên
                                    </label>

                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={
                                                formData.fullName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Nhập họ và tên"
                                        />
                                    ) : (
                                        <div className="profile-value-j">
                                            {user?.fullName ||
                                                "Chưa cập nhật"}
                                        </div>
                                    )}

                                </div>

                                {/* EMAIL */}

                                <div className="profile-form-group-j">

                                    <label>
                                        Email
                                    </label>

                                    <div className="profile-value-j">

                                        {user?.email ||
                                            "Chưa cập nhật"}

                                        <span className="verified-badge-j">
                                            ✓ Đã xác thực
                                        </span>

                                    </div>

                                </div>

                                {/* SỐ ĐIỆN THOẠI */}

                                <div className="profile-form-group-j">

                                    <label>
                                        Số điện thoại
                                    </label>

                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Nhập số điện thoại"
                                        />
                                    ) : (
                                        <div className="profile-value-j">
                                            {user?.phone ||
                                                "Chưa cập nhật"}
                                        </div>
                                    )}

                                </div>

                                {/* ĐỊA CHỈ */}

                                <div className="profile-form-group-j">

                                    <label>
                                        Địa chỉ
                                    </label>

                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={
                                                formData.address
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Nhập địa chỉ"
                                        />
                                    ) : (
                                        <div className="profile-value-j">
                                            {user?.address ||
                                                "Chưa cập nhật"}
                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* BUTTON LƯU / HỦY */}

                            {isEditing && (
                                <div className="profile-form-actions-j">

                                    <button
                                        type="button"
                                        className="cancel-button-j"
                                        onClick={
                                            handleCancel
                                        }
                                        disabled={saving}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="button"
                                        className="save-button-j"
                                        onClick={
                                            handleSave
                                        }
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Đang lưu..."
                                            : "Lưu thay đổi"}
                                    </button>

                                </div>
                            )}

                        </section>

                        {/* =========================
                            BẢO MẬT
                        ========================= */}

                        <section className="profile-card-j">

                            <div className="profile-card-header-j">

                                <div>

                                    <h3>
                                        Bảo mật tài khoản
                                    </h3>

                                    <p>
                                        Quản lý mật khẩu
                                        và bảo mật tài khoản
                                    </p>

                                </div>

                            </div>

                            <div className="security-row-j">

                                <div className="security-icon-j">
                                    🔒
                                </div>

                                <div className="security-info-j">

                                    <h4>
                                        Mật khẩu
                                    </h4>

                                    <p>
                                        Mật khẩu của bạn
                                        đã được bảo mật
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="security-button-j"
                                    onClick={() => {
                                        setShowPassword(
                                            !showPassword
                                        );
                                    }}
                                >
                                    {showPassword
                                        ? "Ẩn"
                                        : "Đổi mật khẩu"}
                                </button>

                            </div>

                            {/* FORM ĐỔI MẬT KHẨU */}

                            {showPassword && (
                                <div className="change-password-box-j">

                                    {/* MẬT KHẨU HIỆN TẠI */}

                                    <div className="profile-form-group-j">

                                        <label>
                                            Mật khẩu hiện tại
                                        </label>

                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={
                                                passwordForm.currentPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Nhập mật khẩu hiện tại"
                                            disabled={
                                                changingPassword
                                            }
                                        />

                                    </div>

                                    {/* MẬT KHẨU MỚI */}

                                    <div className="profile-form-group-j">

                                        <label>
                                            Mật khẩu mới
                                        </label>

                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={
                                                passwordForm.newPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Nhập mật khẩu mới"
                                            disabled={
                                                changingPassword
                                            }
                                        />

                                    </div>

                                    {/* XÁC NHẬN MẬT KHẨU */}

                                    <div className="profile-form-group-j">

                                        <label>
                                            Nhập lại mật khẩu mới
                                        </label>

                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={
                                                passwordForm.confirmPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Nhập lại mật khẩu mới"
                                            disabled={
                                                changingPassword
                                            }
                                        />

                                    </div>

                                    {/* BUTTON */}

                                    <button
                                        type="button"
                                        className="save-button-j"
                                        onClick={
                                            handleChangePassword
                                        }
                                        disabled={
                                            changingPassword
                                        }
                                    >
                                        {changingPassword
                                            ? "Đang cập nhật..."
                                            : "Cập nhật mật khẩu"}
                                    </button>

                                </div>
                            )}

                        </section>

                        {/* =========================
                            BOOKING GẦN ĐÂY
                        ========================= */}

                        <section className="profile-card-j">

                            <div className="profile-card-header-j">

                                <div>

                                    <h3>
                                        Booking gần đây
                                    </h3>

                                    <p>
                                        Các chuyến đi gần đây
                                        của bạn
                                    </p>

                                </div>

                                <Link
                                    to="/bookings"
                                    className="view-all-link-j"
                                >
                                    Xem tất cả →
                                </Link>

                            </div>

                            <div className="recent-bookings-j">

                                <div className="recent-booking-j">

                                    <div className="recent-booking-icon-j">
                                        🧳
                                    </div>

                                    <div className="recent-booking-info-j">

                                        <h4>
                                            Chưa kết nối dữ liệu Booking
                                        </h4>

                                        <p>
                                            Booking sẽ được lấy
                                            từ Booking Service
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>

                    </div>

                    {/* =========================
                        SIDEBAR
                    ========================= */}

                    <aside className="profile-sidebar-j">

                        <div className="profile-sidebar-card-j">

                            <h3>
                                Tài khoản
                            </h3>

                            <Link
                                to="/profile"
                                className="sidebar-menu-j active"
                            >
                                <span>👤</span>
                                Hồ sơ cá nhân
                            </Link>

                            <Link
                                to="/bookings"
                                className="sidebar-menu-j"
                            >
                                <span>📋</span>
                                Booking của tôi
                            </Link>

                            <Link
                                to="/destinations"
                                className="sidebar-menu-j"
                            >
                                <span>📍</span>
                                Khám phá điểm đến
                            </Link>

                            <Link
                                to="/tours"
                                className="sidebar-menu-j"
                            >
                                <span>🧳</span>
                                Khám phá Tour
                            </Link>

                        </div>

                        <div className="profile-help-card-j">

                            <div className="help-icon-j">
                                💬
                            </div>

                            <h3>
                                Cần hỗ trợ?
                            </h3>

                            <p>
                                Đội ngũ VietTrip luôn
                                sẵn sàng hỗ trợ bạn.
                            </p>

                            <Link to="/about">
                                Liên hệ VietTrip →
                            </Link>

                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
}

export default Profile;