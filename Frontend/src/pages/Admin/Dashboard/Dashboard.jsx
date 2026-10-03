import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../../services/api";
import "./Dashboard.css";

function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [tours, setTours] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formatCurrency = (value) => {
        const number = Number(value) || 0;

        return number.toLocaleString("vi-VN") + "₫";
    };

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("vi-VN");
    };

    const getTourName = (tourId) => {
        const tour = tours.find(
            (item) =>
                Number(item.id) === Number(tourId)
        );

        if (!tour) {
            return `Tour #${tourId}`;
        }

        return (
            tour.name ||
            tour.title ||
            tour.tourName ||
            `Tour #${tourId}`
        );
    };

    const getUserName = (booking) => {
        if (booking.customerName) {
            return booking.customerName;
        }

        const user = users.find(
            (item) =>
                Number(item.id) === Number(booking.userId)
        );

        if (!user) {
            return "Khách hàng";
        }

        return (
            user.fullName ||
            user.name ||
            user.userName ||
            user.username ||
            user.email ||
            "Khách hàng"
        );
    };

    const getBookingStatus = (status) => {
        switch (String(status || "").toLowerCase()) {
            case "paid":
                return {
                    text: "Đã thanh toán",
                    type: "success",
                };

            case "completed":
                return {
                    text: "Hoàn thành",
                    type: "success",
                };

            case "confirmed":
                return {
                    text: "Đã xác nhận",
                    type: "success",
                };

            case "pending":
                return {
                    text: "Chờ thanh toán",
                    type: "pending",
                };

            case "cancelled":
                return {
                    text: "Đã hủy",
                    type: "cancelled",
                };

            default:
                return {
                    text: status || "Không xác định",
                    type: "pending",
                };
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                bookingsResponse,
                toursResponse,
                usersResponse,
            ] = await Promise.all([
                api.get("/api/Bookings"),
                api.get("/api/Tours"),
                api.get("/api/Auth/internal/users"),
            ]);

            const bookingData =
                Array.isArray(bookingsResponse.data)
                    ? bookingsResponse.data
                    : bookingsResponse.data?.data || [];

            const tourData =
                Array.isArray(toursResponse.data)
                    ? toursResponse.data
                    : toursResponse.data?.data || [];

            const userData =
                Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : usersResponse.data?.data || [];

            setBookings(bookingData);
            setTours(tourData);
            setUsers(userData);

        } catch (err) {
            console.error(
                "Lỗi tải dữ liệu Dashboard:",
                err
            );

            setError(
                "Không thể tải dữ liệu Dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // =========================
    // STATISTICS
    // =========================

    const totalTours = tours.length;

    const totalBookings = bookings.length;

    const totalUsers = users.length;

    const totalRevenue = useMemo(() => {
        return bookings
            .filter((booking) => {
                const status =
                    String(booking.status || "")
                        .toLowerCase();

                return (
                    status === "paid" ||
                    status === "completed"
                );
            })
            .reduce(
                (total, booking) =>
                    total +
                    (Number(booking.totalAmount) || 0),
                0
            );
    }, [bookings]);

    // =========================
    // RECENT BOOKINGS
    // =========================

    const recentBookings = useMemo(() => {
        return [...bookings]
            .sort((a, b) => {
                return (
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
                );
            })
            .slice(0, 5);
    }, [bookings]);

    // =========================
    // TOP TOURS
    // =========================

    const topTours = useMemo(() => {
        const tourMap = {};

        bookings.forEach((booking) => {
            const tourId = booking.tourId;

            if (!tourId) {
                return;
            }

            if (!tourMap[tourId]) {
                tourMap[tourId] = {
                    tourId,
                    bookings: 0,
                };
            }

            tourMap[tourId].bookings += 1;
        });

        return Object.values(tourMap)
            .map((item) => {
                const tour = tours.find(
                    (tour) =>
                        Number(tour.id) ===
                        Number(item.tourId)
                );

                return {
                    tourId: item.tourId,
                    bookings: item.bookings,
                    price: Number(
                        tour?.price ??
                        tour?.Price ??
                        0
                    ),
                };
            })
            .sort(
                (a, b) =>
                    b.bookings - a.bookings
            )
            .slice(0, 4);
    }, [bookings, tours]);

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-page-header">
                    <div>
                        <h2>Dashboard</h2>
                        <p>
                            Đang tải dữ liệu hệ thống VietTrip...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="dashboard-page-header">
                <div>
                    <h2>Dashboard</h2>

                    <p>
                        Tổng quan hoạt động của hệ thống VietTrip
                    </p>

                    {error && (
                        <p
                            style={{
                                color: "#dc2626",
                                marginTop: "8px",
                            }}
                        >
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    className="dashboard-refresh-btn"
                    onClick={fetchDashboardData}
                >
                    ↻ Làm mới
                </button>
            </div>

            {/* =========================
                STATISTICS
            ========================= */}

            <div className="dashboard-stats">

                <div className="dashboard-stat-card">
                    <div className="stat-icon blue">
                        ✈
                    </div>

                    <div className="stat-content">
                        <span className="stat-title">
                            Tổng số Tours
                        </span>

                        <strong className="stat-value">
                            {totalTours}
                        </strong>

                        <span className="stat-change">
                            <span>✓</span>{" "}
                            Dữ liệu thực tế
                        </span>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon green">
                        ▤
                    </div>

                    <div className="stat-content">
                        <span className="stat-title">
                            Tổng Booking
                        </span>

                        <strong className="stat-value">
                            {totalBookings}
                        </strong>

                        <span className="stat-change">
                            <span>✓</span>{" "}
                            Dữ liệu thực tế
                        </span>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon purple">
                        ♙
                    </div>

                    <div className="stat-content">
                        <span className="stat-title">
                            Người dùng
                        </span>

                        <strong className="stat-value">
                            {totalUsers}
                        </strong>

                        <span className="stat-change">
                            <span>✓</span>{" "}
                            Dữ liệu thực tế
                        </span>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon orange">
                        ₫
                    </div>

                    <div className="stat-content">
                        <span className="stat-title">
                            Doanh thu
                        </span>

                        <strong className="stat-value">
                            {(
                                totalRevenue / 1000000
                            ).toLocaleString("vi-VN", {
                                maximumFractionDigits: 1,
                            })}
                            M
                        </strong>

                        <span className="stat-change">
                            <span>✓</span>{" "}
                            Đã thanh toán
                        </span>
                    </div>
                </div>

            </div>

            {/* =========================
                MAIN GRID
            ========================= */}

            <div className="dashboard-main-grid">

                {/* =========================
                    RECENT BOOKINGS
                ========================= */}

                <section className="dashboard-card recent-bookings-card">

                    <div className="dashboard-card-header">
                        <div>
                            <h3>
                                Booking gần đây
                            </h3>

                            <p>
                                Các booking mới nhất trong hệ thống
                            </p>
                        </div>

                        <Link
                            to="/admin/bookings"
                            className="view-all-btn"
                        >
                            Xem tất cả →
                        </Link>
                    </div>

                    <div className="booking-table-wrapper">

                        <table className="dashboard-table">

                            <thead>
                                <tr>
                                    <th>Mã Booking</th>
                                    <th>Khách hàng</th>
                                    <th>Tour</th>
                                    <th>Ngày đặt</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>

                            <tbody>

                                {recentBookings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            style={{
                                                textAlign: "center",
                                                padding: "30px",
                                            }}
                                        >
                                            Chưa có booking nào.
                                        </td>
                                    </tr>
                                ) : (
                                    recentBookings.map(
                                        (booking) => {
                                            const status =
                                                getBookingStatus(
                                                    booking.status
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        booking.id
                                                    }
                                                >
                                                    <td>
                                                        <strong className="booking-id">
                                                            {booking.bookingCode
                                                                ? `#${booking.bookingCode}`
                                                                : `#BK${String(
                                                                    booking.id
                                                                ).padStart(
                                                                    3,
                                                                    "0"
                                                                )}`}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <div className="customer-name">
                                                            {getUserName(
                                                                booking
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="tour-name">
                                                            {getTourName(
                                                                booking.tourId
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            booking.createdAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatCurrency(
                                                                booking.totalAmount
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`booking-status ${status.type}`}
                                                        >
                                                            {
                                                                status.text
                                                            }
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

                {/* =========================
                    TOP TOURS
                ========================= */}

                <section className="dashboard-card top-tours-card">

                    <div className="dashboard-card-header">
                        <div>
                            <h3>
                                Tour nổi bật
                            </h3>

                            <p>
                                Tour có nhiều booking nhất
                            </p>
                        </div>
                    </div>

                    <div className="top-tour-list">
                        {topTours.length === 0 ? (
                            <div
                                style={{
                                    padding: "30px",
                                    textAlign: "center",
                                }}
                            >
                                Chưa có dữ liệu booking.
                            </div>
                        ) : (
                            topTours.map((tour, index) => (
                                <div
                                    className="top-tour-item"
                                    key={tour.tourId}
                                >
                                    <div className="top-tour-rank">
                                        {index + 1}
                                    </div>

                                    <div className="top-tour-info">
                                        <strong>
                                            {getTourName(tour.tourId)}
                                        </strong>

                                        <span>
                                            {tour.bookings} booking
                                        </span>
                                    </div>

                                    <strong className="top-tour-revenue">
                                        {formatCurrency(tour.price)}
                                    </strong>
                                </div>
                            ))
                        )}

                    </div>

                </section>

            </div>

            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <section className="dashboard-card quick-actions-card">

                <div className="dashboard-card-header">
                    <div>
                        <h3>
                            Thao tác nhanh
                        </h3>

                        <p>
                            Truy cập nhanh các chức năng quản lý
                        </p>
                    </div>
                </div>

                <div className="quick-actions">

                    <Link
                        to="/admin/tours"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            ✈
                        </span>

                        <div>
                            <strong>
                                Thêm Tour
                            </strong>

                            <span>
                                Tạo tour mới
                            </span>
                        </div>

                        <span className="quick-action-arrow">
                            →
                        </span>
                    </Link>

                    <Link
                        to="/admin/categories"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            ▣
                        </span>

                        <div>
                            <strong>
                                Thêm Category
                            </strong>

                            <span>
                                Tạo danh mục mới
                            </span>
                        </div>

                        <span className="quick-action-arrow">
                            →
                        </span>
                    </Link>

                    <Link
                        to="/admin/destinations"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            ⌖
                        </span>

                        <div>
                            <strong>
                                Thêm Destination
                            </strong>

                            <span>
                                Thêm điểm đến
                            </span>
                        </div>

                        <span className="quick-action-arrow">
                            →
                        </span>
                    </Link>

                    <Link
                        to="/admin/media"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            ▧
                        </span>

                        <div>
                            <strong>
                                Quản lý Media
                            </strong>

                            <span>
                                Quản lý hình ảnh
                            </span>
                        </div>

                        <span className="quick-action-arrow">
                            →
                        </span>
                    </Link>

                </div>

            </section>

        </div>
    );
}

export default Dashboard;