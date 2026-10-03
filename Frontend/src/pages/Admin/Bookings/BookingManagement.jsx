
import { useEffect, useMemo, useState } from "react";

import api from "../../../services/api";

import "./BookingManagement.css";

function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [tourData, setTourData] = useState({});
    const [scheduleData, setScheduleData] = useState({});
    const [paymentData, setPaymentData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [processingRefund, setProcessingRefund] = useState(false);

    // =========================
    // LOAD BOOKINGS
    // =========================

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError("");

            // =========================
            // LOAD BOOKINGS
            // =========================

            const response = await api.get("/api/Bookings");

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setBookings(data);

            // =========================
            // LOAD TOUR DATA
            // =========================

            const tourIds = [
                ...new Set(
                    data
                        .map((booking) => Number(booking.tourId))
                        .filter(Boolean)
                ),
            ];

            const tourResults = await Promise.all(
                tourIds.map(async (tourId) => {
                    try {
                        const tourResponse = await api.get(
                            `/api/Tours/${tourId}`
                        );

                        return {
                            tourId,
                            tour: tourResponse.data,
                        };
                    } catch {
                        return {
                            tourId,
                            tour: null,
                        };
                    }
                })
            );

            const tourMap = {};

            tourResults.forEach(({ tourId, tour }) => {
                if (tour) {
                    tourMap[tourId] = tour;
                }
            });

            setTourData(tourMap);

            // =========================
            // LOAD SCHEDULE DATA
            // =========================

            const scheduleResults = await Promise.all(
                tourIds.map(async (tourId) => {
                    try {
                        const scheduleResponse = await api.get(
                            `/api/TourSchedules/tour/${tourId}`
                        );

                        const schedules = Array.isArray(
                            scheduleResponse.data
                        )
                            ? scheduleResponse.data
                            : [];

                        return {
                            tourId,
                            schedules,
                        };
                    } catch {
                        return {
                            tourId,
                            schedules: [],
                        };
                    }
                })
            );

            const scheduleMap = {};

            scheduleResults.forEach(({ schedules }) => {
                schedules.forEach((schedule) => {
                    scheduleMap[schedule.id] = schedule;
                });
            });

            setScheduleData(scheduleMap);

            // =========================
            // LOAD PAYMENT DATA
            // =========================

            const paymentResults = await Promise.all(
                data.map(async (booking) => {
                    try {
                        const paymentResponse = await api.get(
                            `/api/Payments/booking/${booking.id}`
                        );

                        /*
                         * API /api/Payments/booking/{bookingId}
                         * trả về dạng:
                         *
                         * [
                         *   {
                         *      id: 4,
                         *      bookingId: 5,
                         *      status: "Paid"
                         *   }
                         * ]
                         *
                         * Vì vậy phải lấy phần tử đầu tiên.
                         */

                        const responseData = paymentResponse.data;

                        const payment = Array.isArray(responseData)
                            ? responseData[0] || null
                            : responseData || null;

                        return {
                            bookingId: booking.id,
                            payment,
                        };
                    } catch (err) {
                        console.error(
                            `Không thể lấy payment của booking ${booking.id}:`,
                            err
                        );

                        return {
                            bookingId: booking.id,
                            payment: null,
                        };
                    }
                })
            );

            const paymentMap = {};

            paymentResults.forEach(({ bookingId, payment }) => {
                if (payment) {
                    paymentMap[bookingId] = payment;
                }
            });

            setPaymentData(paymentMap);
        } catch (err) {
            console.error("Load bookings error:", err);

            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách booking."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // =========================
    // FORMAT
    // =========================

    const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString("vi-VN") + " đ";
    };

    const formatDate = (date) => {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // =========================
    // TOUR
    // =========================

    const getTourName = (booking) => {
        const tour = tourData[booking.tourId];

        return (
            tour?.name ||
            tour?.tourName ||
            `Tour #${booking.tourId}`
        );
    };

    const getDestination = (booking) => {
        const tour = tourData[booking.tourId];

        return (
            tour?.destinationName ||
            tour?.destination?.name ||
            tour?.destination ||
            "--"
        );
    };

    // =========================
    // SCHEDULE
    // =========================

    const getSchedule = (booking) => {
        return scheduleData[booking.tourScheduleId];
    };

    const getDepartureDate = (booking) => {
        const schedule = getSchedule(booking);

        return (
            schedule?.startDate ||
            schedule?.departureDate ||
            schedule?.date ||
            null
        );
    };

    // =========================
    // BOOKING STATUS
    // =========================

    const getStatusLabel = (status) => {
        switch (status) {
            case "Pending":
                return "Chờ xác nhận";

            case "Confirmed":
                return "Đã xác nhận";

            case "Paid":
                return "Đã thanh toán";

            case "Completed":
                return "Hoàn thành";

            case "Cancelled":
                return "Đã hủy";

            default:
                return status || "--";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "status-pending";

            case "Confirmed":
                return "status-confirmed";

            case "Paid":
                return "status-confirmed";

            case "Completed":
                return "status-completed";

            case "Cancelled":
                return "status-cancelled";

            default:
                return "";
        }
    };

    // =========================
    // PAYMENT
    // =========================

    const getPayment = (booking) => {
        return paymentData[booking.id] || null;
    };

    const getPaymentStatus = (booking) => {
        const payment = getPayment(booking);

        return payment?.status || "Pending";
    };

    const getPaymentStatusLabel = (status) => {
        switch (status) {
            case "Paid":
                return "Đã thanh toán";

            case "RefundRequested":
                return "Yêu cầu hoàn tiền";

            case "Refunded":
                return "Đã hoàn tiền";

            case "Failed":
                return "Thất bại";

            case "Pending":
            default:
                return "Chờ thanh toán";
        }
    };

    // =========================
    // FILTER
    // =========================

    const filteredBookings = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return bookings.filter((booking) => {
            const tourName = getTourName(booking);

            const matchesSearch =
                !keyword ||
                String(booking.bookingCode || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(booking.customerName || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(booking.customerEmail || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(tourName || "")
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "all" ||
                booking.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        bookings,
        search,
        statusFilter,
        tourData,
        paymentData,
    ]);

    // =========================
    // SUMMARY
    // =========================

    const summary = useMemo(() => {
        return {
            total: bookings.length,

            pending: bookings.filter(
                (booking) =>
                    booking.status === "Pending"
            ).length,

            confirmed: bookings.filter(
                (booking) =>
                    booking.status === "Confirmed" ||
                    booking.status === "Paid"
            ).length,

            refundRequested: bookings.filter(
                (booking) =>
                    getPaymentStatus(booking) ===
                    "RefundRequested"
            ).length,

            completed: bookings.filter(
                (booking) =>
                    booking.status === "Completed"
            ).length,
        };
    }, [bookings, paymentData]);

    // =========================
    // CONFIRM BOOKING
    // =========================

    const handleConfirmBooking = async (booking) => {
        const confirmed = window.confirm(
            `Xác nhận booking ${booking.bookingCode}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.put(
                `/api/Bookings/${booking.id}/status`,
                {
                    status: "Confirmed",
                }
            );

            await loadBookings();

            setSelectedBooking(null);
        } catch (err) {
            console.error(
                "Confirm booking error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể xác nhận booking."
            );
        }
    };

    // =========================
    // CANCEL BOOKING
    // =========================

    const handleCancelBooking = async (booking) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn hủy booking ${booking.bookingCode}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.put(
                `/api/Bookings/${booking.id}/cancel`
            );

            await loadBookings();

            setSelectedBooking(null);
        } catch (err) {
            console.error(
                "Cancel booking error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể hủy booking."
            );
        }
    };

    // =========================
    // PROCESS REFUND
    // =========================

    const handleRefund = async (booking) => {
        const payment = getPayment(booking);

        if (!payment) {
            alert("Không tìm thấy thông tin thanh toán.");
            return;
        }

        if (payment.status !== "RefundRequested") {
            alert(
                "Booking này chưa có yêu cầu hoàn tiền."
            );
            return;
        }

        const confirmed = window.confirm(
            `Xác nhận hoàn tiền cho booking ${booking.bookingCode}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingRefund(true);

            await api.put(
                `/api/Payments/${payment.id}/status`,
                {
                    status: "Refunded",
                }
            );

            await loadBookings();

            setSelectedBooking(null);

            alert(
                "Đã xử lý hoàn tiền thành công."
            );
        } catch (err) {
            console.error(
                "Refund payment error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể xử lý hoàn tiền."
            );
        } finally {
            setProcessingRefund(false);
        }
    };

    // =========================
    // OPEN DETAIL
    // =========================

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="booking-management">
                <div className="empty-state">
                    Đang tải danh sách booking...
                </div>
            </div>
        );
    }

    return (
        <div className="booking-management">
            {/* =========================
                HEADER
            ========================= */}

            <div className="page-heading">
                <div>
                    <h1>Quản lý Booking</h1>

                    <p>
                        Theo dõi và quản lý các đơn đặt
                        tour của khách hàng.
                    </p>
                </div>
            </div>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <div
                    className="empty-state"
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="booking-summary-admin">
                <div className="summary-card">
                    <div className="summary-icon blue">
                        📋
                    </div>

                    <div>
                        <span>Tổng booking</span>

                        <strong>
                            {summary.total}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon yellow">
                        ⏳
                    </div>

                    <div>
                        <span>Chờ xác nhận</span>

                        <strong>
                            {summary.pending}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon green">
                        ✓
                    </div>

                    <div>
                        <span>Đã xác nhận</span>

                        <strong>
                            {summary.confirmed}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon orange">
                        ↩
                    </div>

                    <div>
                        <span>Yêu cầu hoàn tiền</span>

                        <strong>
                            {summary.refundRequested}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon purple">
                        ★
                    </div>

                    <div>
                        <span>Hoàn thành</span>

                        <strong>
                            {summary.completed}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =========================
                TOOLBAR
            ========================= */}

            <div className="booking-toolbar">
                <div className="booking-search">
                    <span>🔍</span>

                    <input
                        type="text"
                        placeholder="Tìm mã booking, khách hàng, email, tour..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="all">
                        Tất cả trạng thái
                    </option>

                    <option value="Pending">
                        Chờ xác nhận
                    </option>

                    <option value="Confirmed">
                        Đã xác nhận
                    </option>

                    <option value="Paid">
                        Đã thanh toán
                    </option>

                    <option value="Completed">
                        Hoàn thành
                    </option>

                    <option value="Cancelled">
                        Đã hủy
                    </option>
                </select>
            </div>

            {/* =========================
                TABLE
            ========================= */}

            <div className="booking-table-card">
                <div className="table-header">
                    <div>
                        <h2>Danh sách booking</h2>

                        <span>
                            {filteredBookings.length} booking
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="booking-table">
                        <thead>
                            <tr>
                                <th>Mã booking</th>
                                <th>Khách hàng</th>
                                <th>Tour</th>
                                <th>Ngày đặt</th>
                                <th>Ngày khởi hành</th>
                                <th>Số khách</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="10">
                                        <div className="empty-state">
                                            Không có booking nào.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(
                                    (booking) => {
                                        const paymentStatus =
                                            getPaymentStatus(
                                                booking
                                            );

                                        return (
                                            <tr
                                                key={
                                                    booking.id
                                                }
                                            >
                                                {/* Booking ID */}
                                                <td>
                                                    <span className="booking-id">
                                                        {booking.bookingCode ||
                                                            `#${booking.id}`}
                                                    </span>
                                                </td>

                                                {/* Customer */}
                                                <td>
                                                    <div className="customer-cell">
                                                        <strong>
                                                            {
                                                                booking.customerName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                booking.customerEmail
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Tour */}
                                                <td>
                                                    <div className="tour-cell">
                                                        <strong>
                                                            {getTourName(
                                                                booking
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {getDestination(
                                                                booking
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Booking date */}
                                                <td>
                                                    {formatDate(
                                                        booking.createdAt
                                                    )}
                                                </td>

                                                {/* Departure date */}
                                                <td>
                                                    {formatDate(
                                                        getDepartureDate(
                                                            booking
                                                        )
                                                    )}
                                                </td>

                                                {/* Guests */}
                                                <td>
                                                    {booking.numberOfPeople ||
                                                        0}
                                                </td>

                                                {/* Total */}
                                                <td>
                                                    <span className="price">
                                                        {formatCurrency(
                                                            booking.totalAmount
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Payment */}
                                                <td>
                                                    <span
                                                        className={`payment-status payment-${paymentStatus.toLowerCase()}`}
                                                    >
                                                        {getPaymentStatusLabel(
                                                            paymentStatus
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Booking Status */}
                                                <td>
                                                    <span
                                                        className={`booking-status ${getStatusClass(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            booking.status
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <div className="booking-actions-cell">
                                                        <div className="booking-actions">
                                                            <button
                                                                type="button"
                                                                className="booking-action-view"
                                                                onClick={() =>
                                                                    handleViewBooking(
                                                                        booking
                                                                    )
                                                                }
                                                            >
                                                                Xem
                                                            </button>

                                                            {booking.status ===
                                                                "Pending" && (
                                                                    <button
                                                                        type="button"
                                                                        className="booking-action-confirm"
                                                                        onClick={() =>
                                                                            handleConfirmBooking(
                                                                                booking
                                                                            )
                                                                        }
                                                                    >
                                                                        Xác nhận
                                                                    </button>
                                                                )}

                                                            {booking.status !==
                                                                "Cancelled" &&
                                                                booking.status !==
                                                                "Completed" && (
                                                                    <button
                                                                        type="button"
                                                                        className="booking-action-refund"
                                                                        onClick={() =>
                                                                            handleCancelBooking(
                                                                                booking
                                                                            )
                                                                        }
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                )}

                                                            {paymentStatus ===
                                                                "RefundRequested" && (
                                                                    <button
                                                                        type="button"
                                                                        className="booking-action-refund"
                                                                        onClick={() =>
                                                                            handleRefund(
                                                                                booking
                                                                            )
                                                                        }
                                                                    >
                                                                        Hoàn tiền
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================
                DETAIL MODAL
            ========================= */}

            {selectedBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={() =>
                        setSelectedBooking(null)
                    }
                >
                    <div
                        className="booking-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* Header */}

                        <div className="booking-modal-header">
                            <div>
                                <h2>
                                    Chi tiết Booking
                                </h2>

                                <span>
                                    {selectedBooking.bookingCode ||
                                        `#${selectedBooking.id}`}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setSelectedBooking(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>

                        {/* Detail */}

                        <div className="booking-detail-grid">
                            <div className="detail-item">
                                <span>
                                    Mã booking
                                </span>

                                <strong>
                                    {selectedBooking.bookingCode ||
                                        `#${selectedBooking.id}`}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Trạng thái
                                </span>

                                <strong>
                                    {getStatusLabel(
                                        selectedBooking.status
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Thanh toán
                                </span>

                                <strong>
                                    {getPaymentStatusLabel(
                                        getPaymentStatus(
                                            selectedBooking
                                        )
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Khách hàng
                                </span>

                                <strong>
                                    {
                                        selectedBooking.customerName
                                    }
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Email</span>

                                <strong>
                                    {
                                        selectedBooking.customerEmail
                                    }
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Số điện thoại
                                </span>

                                <strong>
                                    {
                                        selectedBooking.customerPhone ||
                                        "--"
                                    }
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Số người
                                </span>

                                <strong>
                                    {
                                        selectedBooking.numberOfPeople
                                    }
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Tour</span>

                                <strong>
                                    {getTourName(
                                        selectedBooking
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Điểm đến
                                </span>

                                <strong>
                                    {getDestination(
                                        selectedBooking
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Ngày đặt
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedBooking.createdAt
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Ngày khởi hành
                                </span>

                                <strong>
                                    {formatDate(
                                        getDepartureDate(
                                            selectedBooking
                                        )
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Đơn giá
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedBooking.unitPrice
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Tổng tiền
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedBooking.totalAmount
                                    )}
                                </strong>
                            </div>

                            {selectedBooking.note && (
                                <div
                                    className="detail-item"
                                    style={{
                                        gridColumn:
                                            "1 / -1",
                                    }}
                                >
                                    <span>
                                        Ghi chú
                                    </span>

                                    <strong>
                                        {
                                            selectedBooking.note
                                        }
                                    </strong>
                                </div>
                            )}
                        </div>

                        {/* Actions */}

                        <div className="booking-modal-actions">
                            {selectedBooking.status ===
                                "Pending" && (
                                    <button
                                        type="button"
                                        className="modal-action-confirm"
                                        onClick={() =>
                                            handleConfirmBooking(
                                                selectedBooking
                                            )
                                        }
                                    >
                                        Xác nhận booking
                                    </button>
                                )}

                            {selectedBooking.status !==
                                "Cancelled" &&
                                selectedBooking.status !==
                                "Completed" && (
                                    <button
                                        type="button"
                                        className="modal-action-refund"
                                        onClick={() =>
                                            handleCancelBooking(
                                                selectedBooking
                                            )
                                        }
                                    >
                                        Hủy booking
                                    </button>
                                )}

                            {getPaymentStatus(
                                selectedBooking
                            ) ===
                                "RefundRequested" && (
                                    <button
                                        type="button"
                                        className="modal-action-refund"
                                        disabled={
                                            processingRefund
                                        }
                                        onClick={() =>
                                            handleRefund(
                                                selectedBooking
                                            )
                                        }
                                    >
                                        {processingRefund
                                            ? "Đang xử lý..."
                                            : "Hoàn tiền"}
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingManagement;

