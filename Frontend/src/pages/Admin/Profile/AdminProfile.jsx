
import { useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import "./AdminProfile.css";

function AdminProfile() {
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "",
        avatarUrl: "",
    });

    const [password, setPassword] = useState({
        current: "",
        newPassword: "",
        confirm: "",
    });

    const [notifications, setNotifications] = useState({
        newBooking: true,
        refundRequest: true,
        payment: true,
        review: false,
    });

    const [systemSettings, setSystemSettings] = useState({
        maintenance: false,
        emailNotification: true,
    });

    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const fileInputRef = useRef(null);

    // =========================
    // LẤY PROFILE THẬT
    // =========================
    const fetchProfile = async () => {
        try {
            setLoading(true);

            const response = await api.get("/api/Auth/profile");

            setProfile({
                fullName: response.data.fullName || "",
                email: response.data.email || "",
                phone: response.data.phone || "",
                address: response.data.address || "",
                role: response.data.role || "",
                avatarUrl: response.data.avatarUrl || "",
            });
        } catch (error) {
            console.error("Lỗi lấy thông tin Admin:", error);

            alert(
                error.response?.data?.message ||
                "Không thể lấy thông tin tài khoản."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // =========================
    // PROFILE
    // =========================
    const handleProfileChange = (field, value) => {
        setProfile((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!profile.fullName.trim()) {
            alert("Họ và tên không được để trống.");
            return;
        }

        try {
            const response = await api.put("/api/Auth/profile", {
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address,
                avatarUrl: profile.avatarUrl,
            });

            setProfile((current) => ({
                ...current,
                fullName: response.data.fullName || "",
                phone: response.data.phone || "",
                address: response.data.address || "",
                avatarUrl:
                    response.data.avatarUrl ||
                    current.avatarUrl ||
                    "",
            }));

            alert(
                response.data.message ||
                "Cập nhật thông tin cá nhân thành công."
            );
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);

            alert(
                error.response?.data?.message ||
                "Không thể cập nhật thông tin."
            );
        }
    };

    // =========================
    // PASSWORD
    // =========================
    const handlePasswordChange = (field, value) => {
        setPassword((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (
            !password.current ||
            !password.newPassword ||
            !password.confirm
        ) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (password.newPassword !== password.confirm) {
            alert("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (password.newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        try {
            const response = await api.put(
                "/api/Auth/change-password",
                {
                    currentPassword: password.current,
                    newPassword: password.newPassword,
                    confirmPassword: password.confirm,
                }
            );

            alert(
                response.data.message ||
                "Đổi mật khẩu thành công."
            );

            setPassword({
                current: "",
                newPassword: "",
                confirm: "",
            });
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);

            alert(
                error.response?.data?.message ||
                "Không thể đổi mật khẩu."
            );
        }
    };

    // =========================
    // NOTIFICATIONS
    // =========================
    const handleNotificationChange = (field) => {
        setNotifications((current) => ({
            ...current,
            [field]: !current[field],
        }));
    };

    // =========================
    // SYSTEM
    // =========================
    const handleSystemChange = (field) => {
        setSystemSettings((current) => ({
            ...current,
            [field]: !current[field],
        }));
    };

    const handleSaveSettings = () => {
        alert("Đã lưu cài đặt hệ thống.");
    };

    // =========================
    // AVATAR
    // =========================

    // Mở cửa sổ chọn file
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // Upload ảnh lên Media Service -> Cloudinary
    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // Kiểm tra định dạng
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Chỉ hỗ trợ JPG, JPEG, PNG và WEBP.");
            event.target.value = "";
            return;
        }

        // Kiểm tra dung lượng
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh không được vượt quá 5 MB.");
            event.target.value = "";
            return;
        }

        try {
            setUploadingAvatar(true);

            // =========================
            // 1. UPLOAD MEDIA
            // =========================
            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await api.post(
                "/api/Media/upload?folder=viettrip/admin",
                formData
            );

            const avatarUrl = uploadResponse.data.url;

            if (!avatarUrl) {
                throw new Error(
                    "Media Service không trả về URL ảnh."
                );
            }

            // =========================
            // 2. LƯU URL VÀO AUTH
            // =========================
            const profileResponse = await api.put(
                "/api/Auth/profile",
                {
                    fullName: profile.fullName,
                    phone: profile.phone,
                    address: profile.address,
                    avatarUrl: avatarUrl,
                }
            );

            // =========================
            // 3. CẬP NHẬT GIAO DIỆN
            // =========================
            setProfile((current) => ({
                ...current,
                avatarUrl:
                    profileResponse.data.avatarUrl ||
                    avatarUrl,
            }));

            alert("Cập nhật ảnh đại diện thành công.");
        } catch (error) {
            console.error("Lỗi upload ảnh đại diện:", error);

            alert(
                error.response?.data?.message ||
                error.message ||
                "Upload ảnh đại diện thất bại."
            );
        } finally {
            setUploadingAvatar(false);

            // Cho phép chọn lại cùng một file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // =========================
    // AVATAR LETTER
    // =========================
    const getAvatarLetter = () => {
        if (!profile.fullName) {
            return "A";
        }

        return profile.fullName
            .trim()
            .charAt(0)
            .toUpperCase();
    };

    // =========================
    // AVATAR COMPONENT
    // =========================
    const renderAvatar = (className) => {
        if (profile.avatarUrl) {
            return (
                <img
                    className={className}
                    src={profile.avatarUrl}
                    alt="Ảnh đại diện"
                />
            );
        }

        return getAvatarLetter();
    };

    return (
        <div className="admin-profile-page">
            <div className="page-heading">
                <div>
                    <h2>Admin Profile & Settings</h2>
                    <p>
                        Quản lý thông tin tài khoản và cài đặt hệ thống
                    </p>
                </div>
            </div>

            <div className="profile-layout">
                {/* =========================
                    SIDEBAR
                ========================= */}
                <aside className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt="Ảnh đại diện"
                                />
                            ) : (
                                getAvatarLetter()
                            )}
                        </div>

                        <h3>
                            {loading
                                ? "Đang tải..."
                                : profile.fullName || "Admin"}
                        </h3>

                        <p>
                            {loading
                                ? "..."
                                : profile.email || ""}
                        </p>

                        <span className="profile-role">
                            {profile.role || "Admin"}
                        </span>
                    </div>

                    <nav className="profile-menu">
                        <button
                            type="button"
                            className={
                                activeTab === "profile"
                                    ? "profile-menu-item active"
                                    : "profile-menu-item"
                            }
                            onClick={() => setActiveTab("profile")}
                        >
                            <span>👤</span>
                            <span>Thông tin Admin</span>
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "password"
                                    ? "profile-menu-item active"
                                    : "profile-menu-item"
                            }
                            onClick={() => setActiveTab("password")}
                        >
                            <span>🔐</span>
                            <span>Đổi mật khẩu</span>
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "notifications"
                                    ? "profile-menu-item active"
                                    : "profile-menu-item"
                            }
                            onClick={() =>
                                setActiveTab("notifications")
                            }
                        >
                            <span>🔔</span>
                            <span>Thông báo</span>
                        </button>

                        <button
                            type="button"
                            className={
                                activeTab === "system"
                                    ? "profile-menu-item active"
                                    : "profile-menu-item"
                            }
                            onClick={() => setActiveTab("system")}
                        >
                            <span>⚙</span>
                            <span>Hệ thống</span>
                        </button>
                    </nav>
                </aside>

                {/* =========================
                    CONTENT
                ========================= */}
                <section className="profile-content">
                    {/* =========================
                        PROFILE
                    ========================= */}
                    {activeTab === "profile" && (
                        <div className="settings-section">
                            <div className="section-heading">
                                <div>
                                    <h3>Thông tin Admin</h3>
                                    <p>
                                        Cập nhật thông tin tài khoản quản trị
                                    </p>
                                </div>
                            </div>

                            <form
                                className="profile-form"
                                onSubmit={handleSaveProfile}
                            >
                                <div className="form-avatar-section">
                                    <div className="form-large-avatar">
                                        {profile.avatarUrl ? (
                                            <img
                                                src={profile.avatarUrl}
                                                alt="Ảnh đại diện"
                                            />
                                        ) : (
                                            getAvatarLetter()
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            Ảnh đại diện
                                        </strong>

                                        <p>
                                            Avatar hiện tại của tài khoản
                                            Admin
                                        </p>

                                        {/* Input file ẩn */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleAvatarChange}
                                            style={{
                                                display: "none",
                                            }}
                                        />

                                        <button
                                            type="button"
                                            className="change-avatar-button"
                                            onClick={handleAvatarClick}
                                            disabled={uploadingAvatar}
                                        >
                                            {uploadingAvatar
                                                ? "Đang tải ảnh..."
                                                : "Thay đổi ảnh"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>
                                            Họ và tên
                                        </label>

                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "fullName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                        />

                                        <small>
                                            Email tài khoản không thể
                                            thay đổi tại đây.
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Số điện thoại
                                        </label>

                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) =>
                                                handleProfileChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Vai trò
                                        </label>

                                        <input
                                            type="text"
                                            value={profile.role}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="save-button"
                                        disabled={loading}
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* =========================
                        PASSWORD
                    ========================= */}
                    {activeTab === "password" && (
                        <div className="settings-section">
                            <div className="section-heading">
                                <div>
                                    <h3>
                                        Đổi mật khẩu
                                    </h3>

                                    <p>
                                        Thay đổi mật khẩu đăng nhập của
                                        tài khoản Admin
                                    </p>
                                </div>
                            </div>

                            <form
                                className="password-form"
                                onSubmit={handleChangePassword}
                            >
                                <div className="form-group">
                                    <label>
                                        Mật khẩu hiện tại
                                    </label>

                                    <input
                                        type="password"
                                        value={password.current}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                "current",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Mật khẩu mới
                                    </label>

                                    <input
                                        type="password"
                                        value={password.newPassword}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                "newPassword",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Xác nhận mật khẩu mới
                                    </label>

                                    <input
                                        type="password"
                                        value={password.confirm}
                                        onChange={(e) =>
                                            handlePasswordChange(
                                                "confirm",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>

                                <div className="password-note">
                                    <span>ℹ</span>

                                    <p>
                                        Mật khẩu nên có ít nhất 6 ký tự,
                                        bao gồm chữ và số để tăng bảo mật.
                                    </p>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="save-button"
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* =========================
                        NOTIFICATIONS
                    ========================= */}
                    {activeTab === "notifications" && (
                        <div className="settings-section">
                            <div className="section-heading">
                                <div>
                                    <h3>Thông báo</h3>

                                    <p>
                                        Chọn các loại thông báo Admin muốn
                                        nhận
                                    </p>
                                </div>
                            </div>

                            <div className="settings-list">
                                <div className="setting-item">
                                    <div>
                                        <strong>
                                            Booking mới
                                        </strong>

                                        <span>
                                            Thông báo khi khách hàng tạo
                                            booking mới
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notifications.newBooking
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "newBooking"
                                            )
                                        }
                                    >
                                        <span></span>
                                    </button>
                                </div>

                                <div className="setting-item">
                                    <div>
                                        <strong>
                                            Yêu cầu hoàn tiền
                                        </strong>

                                        <span>
                                            Thông báo khi khách hàng yêu
                                            cầu hoàn tiền
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notifications.refundRequest
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "refundRequest"
                                            )
                                        }
                                    >
                                        <span></span>
                                    </button>
                                </div>

                                <div className="setting-item">
                                    <div>
                                        <strong>
                                            Thanh toán
                                        </strong>

                                        <span>
                                            Thông báo về trạng thái thanh
                                            toán
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notifications.payment
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "payment"
                                            )
                                        }
                                    >
                                        <span></span>
                                    </button>
                                </div>

                                <div className="setting-item">
                                    <div>
                                        <strong>
                                            Review mới
                                        </strong>

                                        <span>
                                            Thông báo khi khách hàng gửi
                                            đánh giá
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            notifications.review
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            handleNotificationChange(
                                                "review"
                                            )
                                        }
                                    >
                                        <span></span>
                                    </button>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="save-button"
                                    onClick={handleSaveSettings}
                                >
                                    Lưu cài đặt
                                </button>
                            </div>
                        </div>
                    )}

                    {/* =========================
                        SYSTEM
                    ========================= */}
                    {activeTab === "system" && (
                        <div className="settings-section">
                            <div className="section-heading">
                                <div>
                                    <h3>
                                        Cài đặt hệ thống
                                    </h3>

                                    <p>
                                        Quản lý các thiết lập chung của
                                        VietTrip
                                    </p>
                                </div>
                            </div>

                            <div className="settings-list">
                                <div className="setting-item">
                                    <div>
                                        <strong>
                                            Chế độ bảo trì
                                        </strong>

                                        <span>
                                            Tạm thời ngăn người dùng truy
                                            cập hệ thống
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            systemSettings.maintenance
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            handleSystemChange(
                                                "maintenance"
                                            )
                                        }
                                    >
                                        <span></span>
                                    </button>
                                </div>

                                <div className="setting-item">
                                    <div>
                                        <strong>
                                            Email thông báo
                                        </strong>

                                        <span>
                                            Cho phép hệ thống gửi email
                                            thông báo tự động
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            systemSettings.emailNotification
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            handleSystemChange(
                                                "emailNotification"
                                            )
                                        }
                                    >
                                        <span></span>
                                    </button>
                                </div>
                            </div>

                            <div className="system-info">
                                <div className="system-info-row">
                                    <span>Environment</span>
                                    <strong>Development</strong>
                                </div>

                                <div className="system-info-row">
                                    <span>Frontend</span>
                                    <strong>React + Vite</strong>
                                </div>

                                <div className="system-info-row">
                                    <span>Backend</span>
                                    <strong>ASP.NET Core</strong>
                                </div>

                                <div className="system-info-row">
                                    <span>Database</span>
                                    <strong>SQL Server</strong>
                                </div>

                                <div className="system-info-row">
                                    <span>Storage</span>
                                    <strong>Cloudinary</strong>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="save-button"
                                    onClick={handleSaveSettings}
                                >
                                    Lưu cài đặt
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminProfile;

