
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

import "./PaymentManagement.css";

function PaymentManagement() {
    const [payments, setPayments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [tours, setTours] = useState({});

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [processingRefund, setProcessingRefund] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // FETCH DATA
    // =========================
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [paymentsResponse, bookingsResponse] = await Promise.all([
                api.get("/api/Payments"),
                api.get("/api/Bookings"),
            ]);

            const paymentData = paymentsResponse.data || [];
            const bookingData = bookingsResponse.data || [];

            setPayments(paymentData);
            setBookings(bookingData);

            // Lấy danh sách tourId không trùng
            const tourIds = [
                ...new Set(
                    bookingData
                        .map((booking) => booking.tourId)
                        .filter(Boolean)
                ),
            ];

            const tourResults = await Promise.all(
                tourIds.map(async (tourId) => {
                    try {
                        const response = await api.get(`/api/Tours/${tourId}`);

                        return {
                            tourId,
                            tour: response.data,
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
                tourMap[tourId] = tour;
            });

            setTours(tourMap);
        } catch (err) {
            console.error("Lỗi tải dữ liệu Payment:", err);

            setError(
                err.response?.data?.message ||
                "Không thể tải dữ liệu thanh toán."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================
    // BODY SCROLL LOCK
    // =========================
    useEffect(() => {
        if (selectedPayment) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedPayment]);

    // =========================
    // MERGE PAYMENT + BOOKING
    // =========================
    const paymentRows = useMemo(() => {
        return payments.map((payment) => {
            const booking = bookings.find(
                (item) => item.id === payment.bookingId
            );

            const tour = booking
                ? tours[booking.tourId]
                : null;

            return {
                ...payment,

                booking,
                tour,

                bookingCode:
                    booking?.bookingCode ||
                    `BK-${payment.bookingId}`,

                customer:
                    booking?.customerName ||
                    "Chưa có thông tin",

                customerEmail:
                    booking?.customerEmail ||
                    "--",

                customerPhone:
                    booking?.customerPhone ||
                    "--",

                tourName:
                    tour?.name ||
                    "Chưa có thông tin tour",

                amount: payment.amount ?? 0,

                method:
                    payment.paymentMethod ||
                    "--",

                paymentDate:
                    payment.paidAt ||
                    payment.createdAt ||
                    null,

                transactionCode:
                    payment.transactionId ||
                    "--",
            };
        });
    }, [payments, bookings, tours]);

    // =========================
    // FILTER
    // =========================
    const filteredPayments = useMemo(() => {
        return paymentRows.filter((payment) => {
            const keyword = search.toLowerCase().trim();

            const matchesSearch =
                !keyword ||
                payment.paymentCode
                    ?.toLowerCase()
                    .includes(keyword) ||
                payment.bookingCode
                    ?.toLowerCase()
                    .includes(keyword) ||
                payment.customer
                    ?.toLowerCase()
                    .includes(keyword) ||
                payment.tourName
                    ?.toLowerCase()
                    .includes(keyword) ||
                payment.transactionCode
                    ?.toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                payment.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [paymentRows, search, statusFilter]);

    // =========================
    // SUMMARY
    // =========================
    const summary = useMemo(() => {
        return {
            total: payments.length,

            paid: payments.filter(
                (item) => item.status === "Paid"
            ).length,

            pending: payments.filter(
                (item) => item.status === "Pending"
            ).length,

            failed: payments.filter(
                (item) => item.status === "Failed"
            ).length,

            refunded: payments.filter(
                (item) => item.status === "Refunded"
            ).length,
        };
    }, [payments]);

    // =========================
    // FORMAT
    // =========================
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value) + "đ";
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "--";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "--";
        }

        return date.toLocaleString("vi-VN");
    };

    // =========================
    // STATUS
    // =========================
    const getStatusLabel = (status) => {
        const labels = {
            Pending: "Chờ thanh toán",
            Paid: "Đã thanh toán",
            Failed: "Thanh toán thất bại",
            RefundRequested: "Chờ hoàn tiền",
            Refunded: "Đã hoàn tiền",
        };

        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        const classes = {
            Pending: "payment-status-pending",
            Paid: "payment-status-paid",
            Failed: "payment-status-failed",

            // Dùng lại class purple để không cần sửa CSS hiện tại
            RefundRequested: "payment-status-refunded",

            Refunded: "payment-status-refunded",
        };

        return classes[status] || "";
    };

    // =========================
    // XỬ LÝ HOÀN TIỀN
    // =========================
    const handleRefund = async (payment) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xử lý hoàn tiền cho Payment ${payment.paymentCode}?\n\n` +
            `Số tiền: ${formatCurrency(payment.amount)}\n` +
            `Booking: ${payment.bookingCode}\n` +
            `Khách hàng: ${payment.customer}`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingRefund(true);
            setError("");

            await api.put(
                `/api/Payments/${payment.id}/status`,
                {
                    status: "Refunded",
                }
            );

            alert("Đã xử lý hoàn tiền thành công.");

            setSelectedPayment(null);

            await fetchData();
        } catch (err) {
            console.error("Lỗi xử lý hoàn tiền:", err);

            alert(
                err.response?.data?.message ||
                "Không thể xử lý hoàn tiền."
            );
        } finally {
            setProcessingRefund(false);
        }
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="payment-management">
                <div className="page-heading">
                    <div>
                        <h2>Quản lý Payment</h2>
                        <p>
                            Theo dõi giao dịch và trạng thái thanh toán
                            của khách hàng
                        </p>
                    </div>
                </div>

                <div className="payment-table-card">
                    <div className="empty-state">
                        Đang tải dữ liệu thanh toán...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-management">
            {/* =========================
                HEADER
            ========================= */}
            <div className="page-heading">
                <div>
                    <h2>Quản lý Payment</h2>
                    <p>
                        Theo dõi giao dịch và trạng thái thanh toán
                        của khách hàng
                    </p>
                </div>
            </div>

            {/* =========================
                SUMMARY
            ========================= */}
            <div className="payment-summary">
                <div className="payment-summary-card">
                    <div className="payment-summary-icon blue">
                        ▤
                    </div>

                    <div>
                        <span>Tổng giao dịch</span>
                        <strong>{summary.total}</strong>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon green">
                        ✓
                    </div>

                    <div>
                        <span>Đã thanh toán</span>
                        <strong>{summary.paid}</strong>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon yellow">
                        ◷
                    </div>

                    <div>
                        <span>Chờ thanh toán</span>
                        <strong>{summary.pending}</strong>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon red">
                        !
                    </div>

                    <div>
                        <span>Thất bại</span>
                        <strong>{summary.failed}</strong>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon purple">
                        ↻
                    </div>

                    <div>
                        <span>Đã hoàn tiền</span>
                        <strong>{summary.refunded}</strong>
                    </div>
                </div>
            </div>

            {/* =========================
                ERROR
            ========================= */}
            {error && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "#fef2f2",
                        color: "#dc2626",
                    }}
                >
                    {error}
                </div>
            )}

            {/* =========================
                TOOLBAR
            ========================= */}
            <div className="payment-toolbar">
                <div className="payment-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm mã giao dịch, booking, khách hàng..."
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
                    <option value="All">
                        Tất cả trạng thái
                    </option>

                    <option value="Pending">
                        Chờ thanh toán
                    </option>

                    <option value="Paid">
                        Đã thanh toán
                    </option>

                    <option value="Failed">
                        Thanh toán thất bại
                    </option>

                    <option value="RefundRequested">
                        Chờ hoàn tiền
                    </option>

                    <option value="Refunded">
                        Đã hoàn tiền
                    </option>
                </select>
            </div>

            {/* =========================
                TABLE
            ========================= */}
            <div className="payment-table-card">
                <div className="table-header">
                    <div>
                        <h3>Danh sách giao dịch</h3>

                        <span>
                            {filteredPayments.length} giao dịch
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>Mã Payment</th>
                                <th>Booking</th>
                                <th>Khách hàng</th>
                                <th>Tour</th>
                                <th>Số tiền</th>
                                <th>Phương thức</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="empty-state"
                                    >
                                        Không tìm thấy giao dịch
                                        phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <strong className="payment-id">
                                                {payment.paymentCode}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="booking-reference">
                                                {payment.bookingCode}
                                            </span>
                                        </td>

                                        <td>
                                            <strong className="customer-name">
                                                {payment.customer}
                                            </strong>
                                        </td>

                                        <td>
                                            {payment.tourName}
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    payment.amount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="payment-method">
                                                {payment.method}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                payment.paymentDate
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`payment-status ${getStatusClass(
                                                    payment.status
                                                )}`}
                                            >
                                                {getStatusLabel(
                                                    payment.status
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="payment-view-btn"
                                                onClick={() =>
                                                    setSelectedPayment(
                                                        payment
                                                    )
                                                }
                                            >
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================
                DETAIL MODAL
            ========================= */}
            {selectedPayment && (
                <div
                    className="payment-modal-overlay"
                    onClick={() =>
                        setSelectedPayment(null)
                    }
                >
                    <div
                        className="payment-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="payment-modal-header">
                            <div>
                                <span>
                                    Chi tiết giao dịch
                                </span>

                                <h3>
                                    {
                                        selectedPayment.paymentCode
                                    }
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="payment-modal-close"
                                onClick={() =>
                                    setSelectedPayment(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="payment-detail-grid">
                            <div className="payment-detail-item">
                                <span>
                                    Mã giao dịch
                                </span>

                                <strong>
                                    {
                                        selectedPayment.transactionCode
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Mã Payment
                                </span>

                                <strong>
                                    {
                                        selectedPayment.paymentCode
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Mã Booking
                                </span>

                                <strong>
                                    {
                                        selectedPayment.bookingCode
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Khách hàng
                                </span>

                                <strong>
                                    {
                                        selectedPayment.customer
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        selectedPayment.customerEmail
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Tour
                                </span>

                                <strong>
                                    {
                                        selectedPayment.tourName
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Số tiền
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedPayment.amount
                                    )}
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Phương thức
                                </span>

                                <strong>
                                    {
                                        selectedPayment.method
                                    }
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Thời gian
                                </span>

                                <strong>
                                    {formatDateTime(
                                        selectedPayment.paymentDate
                                    )}
                                </strong>
                            </div>

                            <div className="payment-detail-item">
                                <span>
                                    Trạng thái
                                </span>

                                <span
                                    className={`payment-status ${getStatusClass(
                                        selectedPayment.status
                                    )}`}
                                >
                                    {getStatusLabel(
                                        selectedPayment.status
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* =========================
                            REFUND ACTION
                        ========================= */}
                        {selectedPayment.status ===
                            "RefundRequested" && (
                                <div className="booking-modal-actions">
                                    <button
                                        type="button"
                                        className="modal-action-refund"
                                        disabled={
                                            processingRefund
                                        }
                                        onClick={() =>
                                            handleRefund(
                                                selectedPayment
                                            )
                                        }
                                    >
                                        {processingRefund
                                            ? "Đang xử lý..."
                                            : "Xử lý hoàn tiền"}
                                    </button>
                                </div>
                            )}

                        <div className="payment-info-note">
                            <span>ⓘ</span>

                            <p>
                                Trạng thái thanh toán được cập
                                nhật từ Payment Service và
                                cổng thanh toán. Admin chỉ xử
                                lý hoàn tiền khi giao dịch ở
                                trạng thái "Chờ hoàn tiền".
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentManagement;

