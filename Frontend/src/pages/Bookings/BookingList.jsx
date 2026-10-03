import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./BookingList.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("vi-VN");
}

function getStatusInfo(status) {
    switch (status) {
        case "Pending":
            return {
                className: "pending",
                text: "Chờ xác nhận",
            };

        case "Confirmed":
            return {
                className: "confirmed",
                text: "Đã xác nhận",
            };

        case "Paid":
            return {
                className: "confirmed",
                text: "Đã thanh toán",
            };

        case "Completed":
            return {
                className: "completed",
                text: "Hoàn thành",
            };

        case "Cancelled":
            return {
                className: "cancelled",
                text: "Đã hủy",
            };

        default:
            return {
                className: "pending",
                text: status || "Không xác định",
            };
    }
}

function BookingList() {
    const { user, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState("all");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !user?.userId) {
            setLoading(false);
            return;
        }

        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const userId = Number(user.userId);

                if (!userId) {
                    setError("Không xác định được tài khoản người dùng.");
                    return;
                }

                // 1. Lấy danh sách booking của user
                const bookingResponse = await api.get(
                    `/api/Bookings/user/${userId}`
                );

                const bookingData = Array.isArray(bookingResponse.data)
                    ? bookingResponse.data
                    : [];

                // 2. Lấy thông tin tour + schedule cho từng booking
                const enrichedBookings = await Promise.all(
                    bookingData.map(async (booking) => {
                        try {
                            const [
                                tourResponse,
                                scheduleResponse,
                            ] = await Promise.all([
                                api.get(`/api/Tours/${booking.tourId}`),
                                api.get(
                                    `/api/TourSchedules/tour/${booking.tourId}`
                                ),
                            ]);

                            const tour = tourResponse.data;

                            const schedules = Array.isArray(
                                scheduleResponse.data
                            )
                                ? scheduleResponse.data
                                : [];

                            const schedule = schedules.find(
                                (item) =>
                                    Number(item.id) ===
                                    Number(booking.tourScheduleId)
                            );

                            const statusInfo = getStatusInfo(
                                booking.status
                            );

                            return {
                                ...booking,

                                title:
                                    tour?.name ||
                                    "Tour VietTrip",

                                duration: tour?.durationDays
                                    ? `${tour.durationDays} ngày ${
                                          tour.durationNights || 0
                                      } đêm`
                                    : "--",

                                date: formatDate(
                                    schedule?.startDate
                                ),

                                guests:
                                    booking.numberOfPeople || 0,

                                total:
                                    booking.totalAmount || 0,

                                image:
                                    tour?.coverImageUrl ||
                                    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",

                                statusClass:
                                    statusInfo.className,

                                statusText:
                                    statusInfo.text,
                            };
                        } catch (err) {
                            console.error(
                                "Không lấy được thông tin tour:",
                                err
                            );

                            const statusInfo = getStatusInfo(
                                booking.status
                            );

                            return {
                                ...booking,

                                title: "Tour VietTrip",

                                duration: "--",

                                date: "--",

                                guests:
                                    booking.numberOfPeople || 0,

                                total:
                                    booking.totalAmount || 0,

                                image:
                                    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",

                                statusClass:
                                    statusInfo.className,

                                statusText:
                                    statusInfo.text,
                            };
                        }
                    })
                );

                setBookings(enrichedBookings);
            } catch (err) {
                console.error(
                    "Lỗi lấy danh sách booking:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                        "Không thể tải danh sách đơn đặt tour."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [isAuthenticated, user?.userId]);

    const filteredBookings =
        activeTab === "all"
            ? bookings
            : activeTab === "confirmed"
              ? bookings.filter(
                    (booking) =>
                        booking.status === "Confirmed" ||
                        booking.status === "Paid"
                )
              : bookings.filter(
                    (booking) =>
                        booking.status === activeTab
                );

    return (
        <div className="booking-list-page-ss">
            <div className="booking-list-container-ss">
                {/* HEADER */}
                <div className="booking-list-header-ss">
                    <div>
                        <h1>Đơn đặt tour của tôi</h1>

                        <p>
                            Quản lý và theo dõi các chuyến đi
                            của bạn
                        </p>
                    </div>
                </div>

                {/* TABS */}
                <div className="booking-tabs-ss">
                    <button
                        className={
                            activeTab === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("all")
                        }
                    >
                        Tất cả
                    </button>

                    <button
                        className={
                            activeTab === "confirmed"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("confirmed")
                        }
                    >
                        Sắp khởi hành
                    </button>

                    <button
                        className={
                            activeTab === "Completed"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("Completed")
                        }
                    >
                        Đã hoàn thành
                    </button>

                    <button
                        className={
                            activeTab === "Cancelled"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("Cancelled")
                        }
                    >
                        Đã hủy
                    </button>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="empty-bookings-ss">
                        <div>⏳</div>

                        <h3>
                            Đang tải đơn đặt tour...
                        </h3>

                        <p>
                            Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="empty-bookings-ss">
                        <div>⚠️</div>

                        <h3>
                            Không thể tải đơn đặt tour
                        </h3>

                        <p>{error}</p>
                    </div>
                )}

                {/* LIST */}
                {!loading &&
                    !error && (
                        <div className="booking-list-ss">
                            {filteredBookings.map(
                                (booking) => (
                                    <div
                                        className="booking-item-ss"
                                        key={booking.id}
                                    >
                                        {/* IMAGE */}
                                        <img
                                            src={
                                                booking.image
                                            }
                                            alt={
                                                booking.title
                                            }
                                        />

                                        {/* CONTENT */}
                                        <div className="booking-item-content-ss">
                                            <div className="booking-item-top-ss">
                                                <div>
                                                    <h2>
                                                        {
                                                            booking.title
                                                        }
                                                    </h2>

                                                    <span>
                                                        {
                                                            booking.duration
                                                        }
                                                    </span>
                                                </div>

                                                <span
                                                    className={`booking-status-ss ${booking.statusClass}`}
                                                >
                                                    {
                                                        booking.statusText
                                                    }
                                                </span>
                                            </div>

                                            <div className="booking-meta-ss">
                                                <div>
                                                    <span>
                                                        Ngày khởi hành
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.date
                                                        }
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Số khách
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.guests
                                                        }{" "}
                                                        người
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Mã đơn
                                                    </span>

                                                    <strong>
                                                        {
                                                            booking.bookingCode
                                                        }
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="booking-item-bottom-ss">
                                                <strong className="booking-total-ss">
                                                    {formatPrice(
                                                        booking.total
                                                    )}
                                                </strong>

                                                <div className="booking-actions-ss">
                                                    {booking.status ===
                                                        "Completed" && (
                                                        <Link
                                                            to={`/review?bookingId=${booking.id}&tourId=${booking.tourId}`}
                                                            className="review-button-ss"
                                                        >
                                                            Đánh giá
                                                        </Link>
                                                    )}

                                                    <Link
                                                        to={`/bookings/${booking.id}`}
                                                        className="detail-button-ss"
                                                    >
                                                        Xem chi tiết
                                                        →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {filteredBookings.length ===
                                0 && (
                                <div className="empty-bookings-ss">
                                    <div>📋</div>

                                    <h3>
                                        Chưa có đơn đặt
                                        tour
                                    </h3>

                                    <p>
                                        Các đơn đặt tour
                                        của bạn sẽ xuất
                                        hiện tại đây.
                                    </p>

                                    <Link to="/tours">
                                        Khám phá tour
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}

export default BookingList;