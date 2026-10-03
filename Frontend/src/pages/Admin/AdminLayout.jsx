import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import api from "../../services/api";

import "./AdminLayout.css";

function AdminLayout() {
    const { logout } = useAuth();

    const navigate = useNavigate();

    const [showAccountMenu, setShowAccountMenu] =
        useState(false);

    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        role: "",
        avatarUrl: "",
    });

    // =========================
    // LẤY THÔNG TIN ADMIN
    // =========================

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response =
                    await api.get("/api/Auth/profile");

                setProfile({
                    fullName:
                        response.data.fullName || "",
                    email:
                        response.data.email || "",
                    role:
                        response.data.role || "",
                    avatarUrl:
                        response.data.avatarUrl || "",
                });
            } catch (error) {
                console.error(
                    "Lỗi lấy thông tin Admin:",
                    error
                );
            }
        };

        fetchProfile();
    }, []);

    // =========================
    // LẤY CHỮ CÁI ĐẠI DIỆN
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
    // HIỂN THỊ ROLE
    // =========================

    const getRoleName = () => {
        if (profile.role === "Admin") {
            return "Administrator";
        }

        return profile.role || "Administrator";
    };

    // =========================
    // ĐĂNG XUẤT ADMIN
    // =========================

    const handleLogout = () => {
        logout();

        setShowAccountMenu(false);

        navigate("/login");
    };

    return (
        <div className="admin-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="admin-sidebar">

                <Link
                    to="/admin"
                    className="admin-logo"
                >
                    <div className="admin-logo-icon">
                        <span></span>
                        <span></span>
                    </div>

                    <div className="admin-logo-text">
                        <strong>VietTrip</strong>
                        <span>ADMIN</span>
                    </div>
                </Link>

                <nav className="admin-menu">

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ⌂
                        </span>

                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/admin/tours"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ✈
                        </span>

                        <span>Tours</span>
                    </NavLink>

                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ▣
                        </span>

                        <span>Category</span>
                    </NavLink>

                    <NavLink
                        to="/admin/destinations"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ⌖
                        </span>

                        <span>Destination</span>
                    </NavLink>

                    <NavLink
                        to="/admin/bookings"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ▤
                        </span>

                        <span>Booking</span>
                    </NavLink>

                    <NavLink
                        to="/admin/payments"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ▣
                        </span>

                        <span>Payment</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ♙
                        </span>

                        <span>Users</span>
                    </NavLink>

                    <NavLink
                        to="/admin/reviews"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ★
                        </span>

                        <span>Reviews</span>
                    </NavLink>

                    <NavLink
                        to="/admin/media"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ▧
                        </span>

                        <span>Media</span>
                    </NavLink>

                </nav>

                {/* =========================
                    SIDEBAR BOTTOM
                ========================= */}

                <div className="admin-sidebar-bottom">

                    <NavLink
                        to="/admin/profile"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-link active"
                                : "admin-nav-link"
                        }
                    >
                        <span className="admin-nav-icon">
                            ⚙
                        </span>

                        <span>Settings</span>
                    </NavLink>

                </div>

            </aside>

            {/* =========================
                ADMIN MAIN
            ========================= */}

            <div className="admin-main">

                {/* =========================
                    HEADER
                ========================= */}

                <header className="admin-header">

                    <div className="admin-header-left">

                        <button
                            type="button"
                            className="admin-menu-toggle"
                        >
                            ☰
                        </button>

                        <div>
                            <h1>
                                VietTrip Admin
                            </h1>

                            <p>
                                Hệ thống quản lý du lịch VietTrip
                            </p>
                        </div>

                    </div>

                    <div className="admin-header-right">

                        {/* Notification */}

                        <button
                            type="button"
                            className="admin-notification"
                            aria-label="Thông báo"
                        >
                            🔔

                            <span className="notification-dot"></span>
                        </button>

                        {/* =========================
                            ADMIN ACCOUNT
                        ========================= */}

                        <div className="admin-account-wrapper">

                            <button
                                type="button"
                                className="admin-account"
                                onClick={() =>
                                    setShowAccountMenu(
                                        !showAccountMenu
                                    )
                                }
                            >

                                <div className="admin-avatar">
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt="Ảnh đại diện"
                                        />
                                    ) : (
                                        getAvatarLetter()
                                    )}
                                </div>

                                <div className="admin-account-info">

                                    <strong>
                                        {profile.fullName ||
                                            "Admin"}
                                    </strong>

                                    <span>
                                        {getRoleName()}
                                    </span>

                                </div>

                                <span className="admin-account-arrow">
                                    {showAccountMenu
                                        ? "▴"
                                        : "▾"}
                                </span>

                            </button>

                            {/* =========================
                                DROPDOWN
                            ========================= */}

                            {showAccountMenu && (

                                <div className="admin-account-dropdown">

                                    <div className="admin-dropdown-header">

                                        <div className="admin-dropdown-avatar">

                                            {profile.avatarUrl ? (
                                                <img
                                                    src={
                                                        profile.avatarUrl
                                                    }
                                                    alt="Ảnh đại diện"
                                                />
                                            ) : (
                                                getAvatarLetter()
                                            )}

                                        </div>

                                        <div>

                                            <strong>
                                                {profile.fullName ||
                                                    "Admin"}
                                            </strong>

                                            <span>
                                                {profile.email ||
                                                    ""}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="admin-dropdown-divider"></div>

                                    <Link
                                        to="/admin/profile"
                                        className="admin-dropdown-item"
                                        onClick={() =>
                                            setShowAccountMenu(
                                                false
                                            )
                                        }
                                    >
                                        👤 Hồ sơ Admin
                                    </Link>

                                    <Link
                                        to="/admin/profile"
                                        className="admin-dropdown-item"
                                        onClick={() =>
                                            setShowAccountMenu(
                                                false
                                            )
                                        }
                                    >
                                        ⚙️ Cài đặt
                                    </Link>

                                    <div className="admin-dropdown-divider"></div>

                                    {/* =========================
                                        LOGOUT
                                    ========================= */}

                                    <button
                                        type="button"
                                        className="admin-dropdown-logout"
                                        onClick={
                                            handleLogout
                                        }
                                    >
                                        🚪 Đăng xuất
                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </header>

                {/* =========================
                    CONTENT
                ========================= */}

                <main className="admin-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;