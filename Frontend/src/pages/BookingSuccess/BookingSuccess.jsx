import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import api from "../../services/api";
import "./BookingSuccess.css";

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("vi-VN");
}

function BookingSuccess() {
    const location = useLocation();

    const [booking, setBooking] = useState(
        location.state?.booking ||
        JSON.parse(
            localStorage.getItem("viettrip_booking") || "null"
        )
    );

    const [payment, setPayment] = useState(
        location.state?.payment ||
        JSON.parse(
            localStorage.getItem("viettrip_payment") || "null"
        )
    );

    const [tour, setTour] = useState(null);
    const [schedule, setSchedule] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBookingInfo = async () => {
            if (!booking) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // ==============================
                // 1. LẤY THÔNG TIN TOUR
                // ==============================
                const tourResponse = await api.get(
                    `/api/Tours/${booking.tourId}`
                );

                setTour(tourResponse.data);

                // ==============================
                // 2. LẤY DANH SÁCH SCHEDULE
                // ==============================
                const scheduleResponse = await api.get(
                    `/api/TourSchedules/tour/${booking.tourId}`
                );

                const schedules = Array.isArray(
                    scheduleResponse.data
                )
                    ? scheduleResponse.data
                    : [];

                const currentSchedule = schedules.find(
                    (item) =>
                        Number(item.id) ===
                        Number(booking.tourScheduleId)
                );

                setSchedule(currentSchedule || null);

            } catch (err) {
                console.error(
                    "Lỗi lấy thông tin BookingSuccess:",
                    err
                );

                console.log(
                    "STATUS:",
                    err.response?.status
                );

                console.log(
                    "DATA:",
                    err.response?.data
                );

                setError(
                    "Không thể tải đầy đủ thông tin tour."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBookingInfo();
    }, [booking]);

    // ==========================================
    // KHÔNG CÓ BOOKING
    // ==========================================

    if (!booking) {
        return (
            <div className="success-page">
                <div className="success-container">

                    <div className="success-icon">
                        !
                    </div>

                    <h1>
                        Không tìm thấy thông tin đặt tour
                    </h1>

                    <p className="success-description">
                        Thông tin booking không còn khả dụng.
                        Bạn có thể kiểm tra lại trong mục
                        đơn đặt tour.
                    </p>

                    <div className="success-actions">

                        <Link
                            to="/"
                            className="home-button"
                        >
                            Về trang chủ
                        </Link>

                        <Link
                            to="/bookings"
                            className="booking-button"
                        >
                            Xem đơn đặt tour
                        </Link>

                    </div>

                </div>
            </div>
        );
    }

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="success-page">
                <div className="success-container">

                    <div className="success-icon">
                        ✓
                    </div>

                    <h1>
                        Đặt tour thành công!
                    </h1>

                    <p className="success-description">
                        Đang tải thông tin tour...
                    </p>

                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="success-page">
            <div className="success-container">

                {/* SUCCESS ICON */}
                <div className="success-icon">
                    ✓
                </div>

                {/* TITLE */}
                <h1>
                    Đặt tour thành công!
                </h1>

                <p className="success-description">
                    Cảm ơn bạn đã lựa chọn VietTrip.
                    Thông tin đặt tour của bạn đã được ghi nhận.
                </p>

                {/* BOOKING CODE */}
                <div className="booking-code-box">

                    <span>
                        Mã đặt tour
                    </span>

                    <strong>
                        {booking.bookingCode ||
                            `VT${booking.id}`}
                    </strong>

                </div>

                {/* ERROR */}
                {error && (
                    <p
                        style={{
                            marginTop: "15px",
                            color: "#e74c3c",
                            fontSize: "12px",
                        }}
                    >
                        {error}
                    </p>
                )}

                {/* BOOKING INFO */}
                <div className="success-card">

                    <h2>
                        Thông tin đặt tour
                    </h2>

                    {/* TOUR */}
                    <div className="success-tour">

                        <div className="tour-placeholder">

                            {tour?.coverImageUrl ? (
                                <img
                                    src={tour.coverImageUrl}
                                    alt={tour.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "5px",
                                    }}
                                />
                            ) : (
                                "🏞️"
                            )}

                        </div>

                        <div>

                            <h3>
                                {tour?.name ||
                                    "Tour VietTrip"}
                            </h3>

                            <span>
                                {tour
                                    ? `${tour.durationDays || 0} ngày ${tour.durationNights || 0} đêm`
                                    : "Đang cập nhật"}
                            </span>

                        </div>

                    </div>

                    {/* DETAILS */}
                    <div className="success-details">

                        {/* START DATE */}
                        <div>

                            <span>
                                Ngày khởi hành
                            </span>

                            <strong>
                                {formatDate(
                                    schedule?.startDate
                                )}
                            </strong>

                        </div>

                        {/* GUESTS */}
                        <div>

                            <span>
                                Số lượng khách
                            </span>

                            <strong>
                                {booking.numberOfPeople} người
                            </strong>

                        </div>

                        {/* TOTAL */}
                        <div>

                            <span>
                                Tổng thanh toán
                            </span>

                            <strong className="success-price">
                                {formatPrice(
                                    booking.totalAmount
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* PAYMENT STATUS */}
                {payment && (
                    <div className="success-notice">

                        <div className="notice-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Thanh toán đã được ghi nhận
                            </strong>

                            <p>
                                Mã thanh toán:{" "}
                                {payment.paymentCode ||
                                    `#${payment.id}`}
                            </p>

                            <p>
                                Phương thức:{" "}
                                {payment.paymentMethod ===
                                    "Online"
                                    ? "Thanh toán online"
                                    : payment.paymentMethod ===
                                        "BankTransfer"
                                        ? "Chuyển khoản ngân hàng"
                                        : "Thanh toán tại điểm"}
                            </p>

                        </div>

                    </div>
                )}

                {/* EMAIL NOTICE */}
                <div className="success-notice">

                    <div className="notice-icon">
                        ✉
                    </div>

                    <div>

                        <strong>
                            Kiểm tra email của bạn
                        </strong>

                        <p>
                            VietTrip sẽ gửi thông tin xác nhận
                            đặt tour đến email của bạn.
                        </p>

                    </div>

                </div>

                {/* ACTIONS */}
                <div className="success-actions">

                    <Link
                        to="/"
                        className="home-button"
                    >
                        Về trang chủ
                    </Link>

                    <Link
                        to="/bookings"
                        className="booking-button"
                    >
                        Xem đơn đặt tour
                    </Link>

                </div>

            </div>
        </div>
    );
}

export default BookingSuccess;