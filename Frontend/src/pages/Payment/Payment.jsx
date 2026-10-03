import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./Payment.css";

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("vi-VN");
}

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    const [method, setMethod] = useState("vnpay");
    const [agreed, setAgreed] = useState(false);

    const [booking, setBooking] = useState(
        location.state?.booking || null
    );

    const [tour, setTour] = useState(null);
    const [schedule, setSchedule] = useState(null);

    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD BOOKING + TOUR + SCHEDULE
    // ==========================================

    useEffect(() => {
        const loadBooking = async () => {
            try {
                setLoading(true);
                setError("");

                let currentBooking =
                    location.state?.booking || null;

                // Nếu không có state thì lấy booking đã lưu
                if (!currentBooking) {
                    const savedBooking =
                        localStorage.getItem(
                            "viettrip_booking"
                        );

                    if (savedBooking) {
                        currentBooking =
                            JSON.parse(savedBooking);
                    }
                }

                if (!currentBooking) {
                    setError(
                        "Không tìm thấy thông tin booking. Vui lòng quay lại đặt tour."
                    );

                    return;
                }

                setBooking(currentBooking);

                // ==========================================
                // LẤY TOUR + SCHEDULE SONG SONG
                // ==========================================

                const [
                    tourResponse,
                    schedulesResponse,
                ] = await Promise.all([
                    api.get(
                        `/api/Tours/${currentBooking.tourId}`
                    ),

                    api.get(
                        `/api/TourSchedules/tour/${currentBooking.tourId}`
                    ),
                ]);

                const tourData =
                    tourResponse.data;

                const schedules =
                    Array.isArray(
                        schedulesResponse.data
                    )
                        ? schedulesResponse.data
                        : [];

                // Tìm đúng schedule của booking
                const scheduleData =
                    schedules.find(
                        (item) =>
                            Number(item.id) ===
                            Number(
                                currentBooking.tourScheduleId
                            )
                    );

                setTour(tourData);
                setSchedule(
                    scheduleData || null
                );

            } catch (err) {
                console.error(
                    "Lỗi tải thông tin thanh toán:",
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
                    err.response?.data?.message ||
                    err.response?.data?.title ||
                    "Không thể tải thông tin thanh toán."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBooking();
    }, [location.state]);

    // ==========================================
    // PAYMENT
    // ==========================================

    const handlePayment = async () => {
        if (!agreed) {
            return;
        }

        if (!booking?.id) {
            setError(
                "Không tìm thấy mã booking. Vui lòng quay lại đặt tour."
            );

            return;
        }

        try {
            setPaying(true);
            setError("");

            const paymentMethodMap = {
                vnpay: "Online",
                bank: "BankTransfer",
                later: "Cash",
            };

            const response = await api.post(
                "/api/Payments",
                {
                    bookingId: Number(
                        booking.id
                    ),

                    paymentMethod:
                        paymentMethodMap[method],
                }
            );

            const payment = response.data;

            localStorage.setItem(
                "viettrip_payment",
                JSON.stringify(payment)
            );

            navigate("/booking-success", {
                state: {
                    booking,
                    payment,
                },
            });

        } catch (err) {
            console.error(
                "Payment error:",
                err
            );

            const message =
                err.response?.data?.message ||
                "Không thể tạo thanh toán. Vui lòng thử lại.";

            setError(message);
        } finally {
            setPaying(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="payment-pages">
                <div className="payment-containers">
                    <p>
                        Đang tải thông tin thanh toán...
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (!booking || !tour) {
        return (
            <div className="payment-pages">
                <div className="payment-containers">

                    <div className="payment-mains">

                        <h1>
                            Không tìm thấy thông tin
                        </h1>

                        <p>
                            {error ||
                                "Vui lòng quay lại trang đặt tour."}
                        </p>

                        <Link
                            to="/tours"
                            className="back-buttons"
                        >
                            ← Quay lại danh sách tour
                        </Link>

                    </div>

                </div>
            </div>
        );
    }

    // ==========================================
    // ORDER DATA
    // ==========================================

    const order = {
        id:
            booking.bookingCode ||
            booking.id,

        title:
            tour.name ||
            "Tour VietTrip",

        duration:
            tour.durationDays
                ? `${tour.durationDays} ngày ${tour.durationNights || 0
                } đêm`
                : "--",

        date:
            schedule?.startDate ||
            "--",

        guests:
            booking.numberOfPeople || 0,

        price:
            booking.unitPrice ||
            tour.price ||
            0,

        totalPrice:
            booking.totalAmount ||
            0,

        image:
            tour.coverImageUrl ||
            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    };

    return (
        <div className="payment-pages">
            <div className="payment-containers">

                {/* BREADCRUMB */}
                <div className="payment-breadcrumbs">

                    <Link to="/">
                        Trang chủ
                    </Link>

                    <span>›</span>

                    <Link to="/booking">
                        Đặt tour
                    </Link>

                    <span>›</span>

                    <strong>
                        Thanh toán
                    </strong>

                </div>

                {/* ERROR */}
                {error && (
                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "12px 15px",
                            borderRadius: "7px",
                            background: "#fff2f2",
                            border: "1px solid #ffcaca",
                            color: "#d93025",
                            fontSize: "12px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* LAYOUT */}
                <div className="payment-layouts">

                    {/* LEFT */}
                    <main className="payment-mains">

                        <h1>
                            Phương thức thanh toán
                        </h1>

                        {/* PAYMENT METHODS */}
                        <section className="payment-sections">

                            <h2>
                                Chọn phương thức thanh toán
                            </h2>

                            {/* VNPAY */}
                            <label
                                className={
                                    method === "vnpay"
                                        ? "payment-methods active"
                                        : "payment-methods"
                                }
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="vnpay"
                                    checked={
                                        method === "vnpay"
                                    }
                                    onChange={() =>
                                        setMethod("vnpay")
                                    }
                                />

                                <div className="method-contents">

                                    <strong>
                                        Thanh toán qua VNPay
                                    </strong>

                                    <span>
                                        Thẻ ATM, Visa, Mastercard,
                                        ví điện tử
                                    </span>

                                </div>

                                <span className="method-logos">
                                    VNPay
                                </span>
                            </label>

                            {/* BANK */}
                            <label
                                className={
                                    method === "bank"
                                        ? "payment-methods active"
                                        : "payment-methods"
                                }
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="bank"
                                    checked={
                                        method === "bank"
                                    }
                                    onChange={() =>
                                        setMethod("bank")
                                    }
                                />

                                <div className="method-contents">

                                    <strong>
                                        Chuyển khoản ngân hàng
                                    </strong>

                                    <span>
                                        Chuyển khoản trực tiếp
                                        vào tài khoản VietTrip
                                    </span>

                                </div>

                                <span className="method-icons">
                                    🏦
                                </span>
                            </label>

                            {/* CASH */}
                            <label
                                className={
                                    method === "later"
                                        ? "payment-methods active"
                                        : "payment-methods"
                                }
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value="later"
                                    checked={
                                        method === "later"
                                    }
                                    onChange={() =>
                                        setMethod("later")
                                    }
                                />

                                <div className="method-contents">

                                    <strong>
                                        Thanh toán khi xác nhận
                                    </strong>

                                    <span>
                                        Nhân viên VietTrip sẽ
                                        liên hệ xác nhận
                                    </span>

                                </div>

                                <span className="method-icons">
                                    ✓
                                </span>
                            </label>

                        </section>

                        {/* BANK INFORMATION */}
                        {method === "bank" && (
                            <section className="bank-infos">

                                <h2>
                                    Thông tin chuyển khoản
                                </h2>

                                <div className="bank-boxs">

                                    <div className="bank-headers">

                                        <div className="bank-logos">
                                            VCB
                                        </div>

                                        <div>
                                            <strong>
                                                Vietcombank
                                            </strong>

                                            <span>
                                                Ngân hàng TMCP Ngoại
                                                thương Việt Nam
                                            </span>
                                        </div>

                                    </div>

                                    <div className="bank-detailss">

                                        <div>
                                            <span>
                                                Số tài khoản
                                            </span>

                                            <strong>
                                                123456789
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Chủ tài khoản
                                            </span>

                                            <strong>
                                                VIETTRIP
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Nội dung chuyển khoản
                                            </span>

                                            <strong>
                                                {order.id}
                                            </strong>
                                        </div>

                                    </div>

                                    <p>
                                        Vui lòng ghi đúng nội dung
                                        chuyển khoản để hệ thống
                                        xác nhận đơn hàng.
                                    </p>

                                </div>

                            </section>
                        )}

                        {/* TERMS */}
                        <label className="payment-termss">

                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) =>
                                    setAgreed(
                                        e.target.checked
                                    )
                                }
                            />

                            <span>
                                Tôi đồng ý với{" "}
                                <a href="#terms">
                                    điều khoản và chính sách
                                </a>{" "}
                                của VietTrip.
                            </span>

                        </label>

                        {/* ACTION */}
                        <div className="payment-actionss">

                            <Link
                                to="/booking"
                                className="back-buttons"
                            >
                                ← Quay lại
                            </Link>

                            <button
                                type="button"
                                onClick={handlePayment}
                                disabled={
                                    !agreed ||
                                    paying
                                }
                                className={
                                    `pay-buttons ${!agreed || paying
                                        ? "disabled"
                                        : ""
                                    }`
                                }
                            >
                                {paying
                                    ? "Đang xử lý..."
                                    : "Thanh toán ngay →"}
                            </button>

                        </div>

                    </main>

                    {/* RIGHT */}
                    <aside className="payment-summarys">

                        <h2>
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="summary-tours">

                            <img
                                src={order.image}
                                alt={order.title}
                            />

                            <div>

                                <h3>
                                    {order.title}
                                </h3>

                                <span>
                                    {order.duration}
                                </span>

                            </div>

                        </div>

                        <div className="summary-detailss">

                            <div>

                                <span>
                                    Ngày khởi hành
                                </span>

                                <strong>
                                    {formatDate(
                                        order.date
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Số lượng khách
                                </span>

                                <strong>
                                    {order.guests} người
                                </strong>

                            </div>

                        </div>

                        <div className="summary-prices">

                            <div>

                                <span>
                                    Giá tour
                                </span>

                                <strong>
                                    {formatPrice(
                                        order.price
                                    )}
                                    {" × "}
                                    {order.guests}
                                </strong>

                            </div>

                            <div className="summary-totals">

                                <span>
                                    Tổng tiền
                                </span>

                                <strong>
                                    {formatPrice(
                                        order.totalPrice
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div className="order-codes">

                            <span>
                                Mã đơn hàng
                            </span>

                            <strong>
                                {order.id}
                            </strong>

                        </div>

                    </aside>

                </div>

            </div>
        </div>
    );
}

export default Payment;