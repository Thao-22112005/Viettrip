
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./BookingDetail.css";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

function formatDateTime(date) {
    if (!date) return "--";

    return new Date(date).toLocaleString("vi-VN");
}

function getBookingStatus(status) {
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

function getPaymentStatus(status) {
    switch (status) {
        case "Pending":
            return "Chờ thanh toán";

        case "Paid":
            return "Đã thanh toán";

        case "Failed":
            return "Thanh toán thất bại";

        case "RefundRequested":
            return "Đang yêu cầu hoàn tiền";

        case "Refunded":
            return "Đã hoàn tiền";

        default:
            return status || "--";
    }
}

function BookingDetail() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [booking, setBooking] = useState(null);
    const [tour, setTour] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [payment, setPayment] = useState(null);
    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Trạng thái gửi yêu cầu hoàn tiền
    const [requestingRefund, setRequestingRefund] = useState(false);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                setLoading(true);
                setError("");

                // ==========================================
                // 1. LẤY BOOKING
                // ==========================================
                const bookingResponse = await api.get(
                    `/api/Bookings/${id}`
                );

                const bookingData = bookingResponse.data;

                if (!bookingData) {
                    setError("Không tìm thấy đơn đặt tour.");
                    return;
                }

                setBooking(bookingData);

                // ==========================================
                // 2. LẤY TOUR
                // ==========================================
                const tourResponse = await api.get(
                    `/api/Tours/${bookingData.tourId}`
                );

                const tourData = tourResponse.data;

                setTour(tourData);

                // ==========================================
                // 3. LẤY SCHEDULE
                // ==========================================
                const scheduleResponse = await api.get(
                    `/api/TourSchedules/tour/${bookingData.tourId}`
                );

                const schedules = Array.isArray(
                    scheduleResponse.data
                )
                    ? scheduleResponse.data
                    : [];

                const scheduleData = schedules.find(
                    (item) =>
                        Number(item.id) ===
                        Number(bookingData.tourScheduleId)
                );

                setSchedule(scheduleData || null);

                // ==========================================
                // 4. LẤY PAYMENT
                // ==========================================
                try {
                    const paymentResponse = await api.get(
                        `/api/Payments/booking/${bookingData.id}`
                    );

                    const paymentData = paymentResponse.data;

                    setPayment(
                        Array.isArray(paymentData)
                            ? paymentData[0] || null
                            : paymentData || null
                    );
                } catch (paymentError) {
                    console.warn(
                        "Không lấy được payment:",
                        paymentError
                    );

                    setPayment(null);
                }

                // ==========================================
                // 5. LẤY PROFILE
                // ==========================================
                if (
                    isAuthenticated &&
                    user?.userId
                ) {
                    try {
                        const profileResponse =
                            await api.get(
                                "/api/Auth/profile"
                            );

                        setProfile(
                            profileResponse.data
                        );
                    } catch (profileError) {
                        console.warn(
                            "Không lấy được profile:",
                            profileError
                        );
                    }
                }
            } catch (err) {
                console.error(
                    "Lỗi lấy chi tiết booking:",
                    err
                );

                if (err.response?.status === 404) {
                    setError(
                        "Không tìm thấy đơn đặt tour."
                    );
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải thông tin đơn đặt tour."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBookingDetail();
        }
    }, [id, isAuthenticated, user?.userId]);

    // ==========================================
    // YÊU CẦU HOÀN TIỀN
    // ==========================================
    const handleRefundRequest = async () => {
        if (!payment?.id) {
            alert(
                "Không tìm thấy thông tin thanh toán."
            );
            return;
        }

        if (payment.status !== "Paid") {
            alert(
                "Đơn hàng chưa đủ điều kiện yêu cầu hoàn tiền."
            );
            return;
        }

        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn yêu cầu hoàn tiền cho đơn đặt tour này?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRequestingRefund(true);
            setError("");

            const response = await api.put(
                `/api/Payments/${payment.id}/status`,
                {
                    status: "RefundRequested",
                }
            );

            const updatedPayment = response.data;

            setPayment(updatedPayment);

            alert(
                "Đã gửi yêu cầu hoàn tiền. Vui lòng chờ VietTrip xác nhận."
            );
        } catch (err) {
            console.error(
                "Lỗi yêu cầu hoàn tiền:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                "Không thể gửi yêu cầu hoàn tiền. Vui lòng thử lại.";

            setError(message);
            alert(message);
        } finally {
            setRequestingRefund(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="booking-detail-page-sss">
                <div className="booking-detail-container-sss">
                    <div className="empty-bookings-sss">
                        <div>⏳</div>

                        <h3>
                            Đang tải chi tiết đơn...
                        </h3>

                        <p>
                            Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================
    if (error || !booking) {
        return (
            <div className="booking-detail-page-sss">
                <div className="booking-detail-container-sss">
                    <div className="empty-bookings-sss">
                        <div>⚠️</div>

                        <h3>
                            Không thể tải đơn đặt tour
                        </h3>

                        <p>
                            {error ||
                                "Không tìm thấy đơn đặt tour."}
                        </p>

                        <Link to="/bookings">
                            ← Quay lại đơn đặt tour
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo = getBookingStatus(
        booking.status
    );

    const duration = tour?.durationDays
        ? `${tour.durationDays} ngày ${tour.durationNights || 0
        } đêm`
        : "--";

    const startDate = schedule?.startDate;

    const customerName =
        booking.customerName ||
        profile?.fullName ||
        "--";

    const customerPhone =
        booking.customerPhone ||
        profile?.phone ||
        "--";

    const customerEmail =
        booking.customerEmail ||
        profile?.email ||
        "--";

    const customerAddress =
        profile?.address || "--";

    const paymentMethod =
        payment?.paymentMethod || "--";

    const paymentStatus = payment
        ? getPaymentStatus(payment.status)
        : booking.status === "Paid"
            ? "Đã thanh toán"
            : booking.status === "Cancelled"
                ? "Đã hủy"
                : "Chưa thanh toán";

    const paidAt = payment?.paidAt
        ? formatDateTime(payment.paidAt)
        : "--";

    return (
        <div className="booking-detail-page-sss">
            <div className="booking-detail-container-sss">

                {/* Breadcrumb */}
                <div className="booking-breadcrumb-sss">
                    <Link to="/">
                        Trang chủ
                    </Link>

                    <span>/</span>

                    <Link to="/bookings">
                        Đơn đặt tour
                    </Link>

                    <span>/</span>

                    <span>
                        Chi tiết đơn
                    </span>
                </div>

                {/* Header */}
                <div className="booking-detail-header-sss">
                    <div>
                        <h1>
                            Chi tiết đơn đặt tour
                        </h1>

                        <p>
                            Mã đơn:{" "}
                            <strong>
                                #{booking.bookingCode}
                            </strong>
                        </p>
                    </div>

                    <span
                        className={`booking-status-sss ${statusInfo.className}`}
                    >
                        {statusInfo.text}
                    </span>
                </div>

                <div className="booking-detail-layout-sss">

                    {/* LEFT */}
                    <div className="booking-detail-main-sss">

                        {/* Tour information */}
                        <section className="detail-card-sss tour-info-card-sss">
                            <div className="card-title-sss">
                                <span className="title-icon-sss">
                                    ✈
                                </span>

                                <h2>
                                    Thông tin tour
                                </h2>
                            </div>

                            <div className="tour-detail-info-sss">
                                <img
                                    src={
                                        tour?.coverImageUrl ||
                                        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
                                    }
                                    alt={
                                        tour?.name ||
                                        "Tour VietTrip"
                                    }
                                />

                                <div className="tour-detail-content-sss">
                                    <h3>
                                        {tour?.name ||
                                            "Tour VietTrip"}
                                    </h3>

                                    <div className="tour-meta-sss">
                                        <span>
                                            🕐{" "}
                                            {duration}
                                        </span>

                                        <span>
                                            📅{" "}
                                            {formatDate(
                                                startDate
                                            )}
                                        </span>

                                        <span>
                                            👥{" "}
                                            {
                                                booking.numberOfPeople
                                            }{" "}
                                            khách
                                        </span>
                                    </div>

                                    <Link
                                        to={`/tours/${booking.tourId}`}
                                        className="view-tour-link-sss"
                                    >
                                        Xem thông tin tour
                                        →
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Trip information */}
                        <section className="detail-card-sss">
                            <div className="card-title-sss">
                                <span className="title-icon-sss">
                                    📋
                                </span>

                                <h2>
                                    Thông tin chuyến đi
                                </h2>
                            </div>

                            <div className="trip-info-grid-sss">

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Ngày khởi hành
                                    </span>

                                    <strong>
                                        {formatDate(
                                            startDate
                                        )}
                                    </strong>
                                </div>

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Số lượng khách
                                    </span>

                                    <strong>
                                        {
                                            booking.numberOfPeople
                                        }{" "}
                                        người
                                    </strong>
                                </div>

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Thời lượng
                                    </span>

                                    <strong>
                                        {duration}
                                    </strong>
                                </div>

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Ngày đặt
                                    </span>

                                    <strong>
                                        {formatDate(
                                            booking.createdAt
                                        )}
                                    </strong>
                                </div>

                            </div>
                        </section>

                        {/* Customer information */}
                        <section className="detail-card-sss">
                            <div className="card-title-sss">
                                <span className="title-icon-sss">
                                    👤
                                </span>

                                <h2>
                                    Thông tin khách hàng
                                </h2>
                            </div>

                            <div className="customer-info-grid-sss">

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Họ và tên
                                    </span>

                                    <strong>
                                        {customerName}
                                    </strong>
                                </div>

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Số điện thoại
                                    </span>

                                    <strong>
                                        {customerPhone}
                                    </strong>
                                </div>

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Email
                                    </span>

                                    <strong>
                                        {customerEmail}
                                    </strong>
                                </div>

                                <div className="info-item-sss">
                                    <span className="info-label-sss">
                                        Địa chỉ
                                    </span>

                                    <strong>
                                        {customerAddress}
                                    </strong>
                                </div>

                            </div>
                        </section>

                        {/* Payment information */}
                        <section className="detail-card-sss">
                            <div className="card-title-sss">
                                <span className="title-icon-sss">
                                    💳
                                </span>

                                <h2>
                                    Thông tin thanh toán
                                </h2>
                            </div>

                            <div className="payment-info-list-sss">

                                <div className="payment-info-row-sss">
                                    <span>
                                        Phương thức thanh toán
                                    </span>

                                    <strong>
                                        {paymentMethod}
                                    </strong>
                                </div>

                                <div className="payment-info-row-sss">
                                    <span>
                                        Trạng thái
                                    </span>

                                    <strong className="payment-success-sss">
                                        {paymentStatus}
                                    </strong>
                                </div>

                                <div className="payment-info-row-sss">
                                    <span>
                                        Thời gian thanh toán
                                    </span>

                                    <strong>
                                        {paidAt}
                                    </strong>
                                </div>

                            </div>
                        </section>
                    </div>

                    {/* RIGHT */}
                    <aside className="booking-detail-sidebar-sss">

                        {/* Order summary */}
                        <div className="detail-card-sss summary-card-sss">
                            <div className="card-title-sss">
                                <span className="title-icon-sss">
                                    🧾
                                </span>

                                <h2>
                                    Chi tiết thanh toán
                                </h2>
                            </div>

                            <div className="price-row-sss">
                                <span>
                                    Giá tour
                                </span>

                                <strong>
                                    {formatPrice(
                                        booking.unitPrice
                                    )}
                                </strong>
                            </div>

                            <div className="price-row-sss">
                                <span>
                                    Số lượng
                                </span>

                                <strong>
                                    {
                                        booking.numberOfPeople
                                    }{" "}
                                    khách
                                </strong>
                            </div>

                            <div className="summary-divider-sss"></div>

                            <div className="total-row-sss">
                                <span>
                                    Tổng thanh toán
                                </span>

                                <strong>
                                    {formatPrice(
                                        booking.totalAmount
                                    )}
                                </strong>
                            </div>

                            <div className="paid-note-sss">
                                {booking.status ===
                                    "Cancelled"
                                    ? "✓ Đơn hàng đã được hủy"
                                    : "✓ Đơn hàng đã được ghi nhận"}
                            </div>
                        </div>

                        {/* Booking status */}
                        <div className="detail-card-sss status-card-sss">
                            <div className="card-title-sss">
                                <span className="title-icon-sss">
                                    ⏱
                                </span>

                                <h2>
                                    Trạng thái đơn
                                </h2>
                            </div>

                            <div className="booking-timeline-sss">

                                <div className="timeline-item-sss completed">
                                    <div className="timeline-dot-sss">
                                        ✓
                                    </div>

                                    <div>
                                        <strong>
                                            Đã đặt tour
                                        </strong>

                                        <span>
                                            {formatDateTime(
                                                booking.createdAt
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={`timeline-item-sss ${booking.status ===
                                        "Cancelled"
                                        ? "cancelled"
                                        : "completed"
                                        }`}
                                >
                                    <div className="timeline-dot-sss">
                                        {booking.status ===
                                            "Cancelled"
                                            ? "×"
                                            : "✓"}
                                    </div>

                                    <div>
                                        <strong>
                                            {booking.status ===
                                                "Cancelled"
                                                ? "Đã hủy đơn"
                                                : booking.status ===
                                                    "Completed"
                                                    ? "Đã hoàn thành"
                                                    : booking.status ===
                                                        "Paid"
                                                        ? "Đã thanh toán"
                                                        : booking.status ===
                                                            "Pending"
                                                            ? "Chờ xác nhận"
                                                            : "Đã xác nhận"}
                                        </strong>

                                        <span>
                                            {booking.status ===
                                                "Cancelled"
                                                ? "Đơn đặt tour đã được hủy"
                                                : booking.status ===
                                                    "Completed"
                                                    ? "Chuyến đi đã hoàn thành"
                                                    : booking.status ===
                                                        "Paid"
                                                        ? "Đơn hàng đã được thanh toán"
                                                        : booking.status ===
                                                            "Pending"
                                                            ? "Đơn hàng đang chờ VietTrip xác nhận"
                                                            : "VietTrip đã xác nhận đơn"}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Actions */}
                        <div className="booking-actions-sss">

                            {(booking.status ===
                                "Confirmed" || booking.status === "Pending") && (
                                    <button
                                        type="button"
                                        className="cancel-booking-button-sss"
                                    >
                                        Hủy đơn đặt tour
                                    </button>
                                )}

                            {/* Yêu cầu hoàn tiền */}
                            {payment?.status === "Paid" && (
                                <button
                                    type="button"
                                    className="refund-booking-button-sss"
                                    onClick={
                                        handleRefundRequest
                                    }
                                    disabled={
                                        requestingRefund
                                    }

                                >
                                    {requestingRefund
                                        ? "Đang gửi yêu cầu..."
                                        : "↩ Yêu cầu hoàn tiền"}
                                </button>
                            )}

                            {/* Đang chờ Admin xử lý */}
                            {payment?.status ===
                                "RefundRequested" && (
                                    <div className="refund-pending-message-sss">
                                        ⏳ Đang chờ VietTrip xác nhận
                                        hoàn tiền
                                    </div>
                                )}

                            {/* Đã hoàn tiền */}
                            {payment?.status ===
                                "Refunded" && (
                                    <div className="refund-success-message-sss">
                                        ✓ Đã hoàn tiền
                                    </div>
                                )}

                            {/* Đánh giá */}
                            {booking.status ===
                                "Completed" && (
                                    <Link
                                        to={`/review?bookingId=${booking.id}&tourId=${booking.tourId}`}
                                        className="review-booking-button-sss"
                                    >
                                        ⭐ Đánh giá tour
                                    </Link>
                                )}

                            {/* Quay lại */}
                            <Link
                                to="/bookings"
                                className="back-bookings-button-sss"
                            >
                                ← Quay lại đơn đặt tour
                            </Link>

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default BookingDetail;

