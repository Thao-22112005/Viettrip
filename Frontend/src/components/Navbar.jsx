import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <div className="navbar-container">

                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">
                        <span></span>
                        <span></span>
                    </div>

                    <span className="logo-text">
                        Viet<span>Trip</span>
                    </span>
                </Link>

                {/* Menu */}
                <nav className="navbar-menu">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Trang chủ
                    </NavLink>

                    <NavLink
                        to="/tours"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Tour
                    </NavLink>

                    <NavLink
                        to="/destinations"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Điểm đến
                    </NavLink>

                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Về chúng tôi
                    </NavLink>
                </nav>

                {/* Actions */}
                <div className="navbar-actions">

                    {/* Search */}
                    <button
                        type="button"
                        className="navbar-search"
                        aria-label="Tìm kiếm"
                    >
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
                            <circle cx="11" cy="11" r="7" />
                            <line
                                x1="16.5"
                                y1="16.5"
                                x2="21"
                                y2="21"
                            />
                        </svg>
                    </button>

                    {/* =========================
                        CHƯA ĐĂNG NHẬP
                    ========================= */}
                    {!isAuthenticated && (
                        <>
                            <Link
                                to="/login"
                                className="btn-login"
                            >
                                Đăng nhập
                            </Link>

                            <Link
                                to="/register"
                                className="btn-register"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}

                    {/* =========================
                        ĐÃ ĐĂNG NHẬP
                    ========================= */}
                    {isAuthenticated && (
                        <>
                            <div className="navbar-account">

                                <button
                                    type="button"
                                    className="account-button"
                                >
                                    <span className="account-icon">
                                        👤
                                    </span>

                                    <span className="account-text">
                                        Tài khoản của bạn
                                    </span>

                                    <span className="account-arrow">
                                        ▾
                                    </span>
                                </button>

                                <div className="account-dropdown">

                                    <div className="account-dropdown-header">
                                        <strong>
                                            {user?.fullName ||
                                                user?.name ||
                                                "Tài khoản"}
                                        </strong>

                                        {user?.email && (
                                            <span>
                                                {user.email}
                                            </span>
                                        )}
                                    </div>

                                    <div className="account-divider"></div>

                                    <Link
                                        to="/profile"
                                        className="account-dropdown-item"
                                    >
                                        👤 Hồ sơ cá nhân
                                    </Link>

                                    <Link
                                        to="/bookings"
                                        className="account-dropdown-item"
                                    >
                                        📋 Booking của tôi
                                    </Link>

                                    <Link
                                        to="/review"
                                        className="account-dropdown-item"
                                    >
                                        ⭐ Đánh giá của tôi
                                    </Link>

                                    <div className="account-divider"></div>

                                    {/* Đăng xuất */}
                                    <button
                                        type="button"
                                        className="account-logout"
                                        onClick={handleLogout}
                                    >
                                        🚪 Đăng xuất
                                    </button>

                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </header>
    );
}

export default Navbar;