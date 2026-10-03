import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Booking.css";

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("vi-VN");
}

function Booking() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const tourId = searchParams.get("tourId");
    const scheduleId = searchParams.get("scheduleId");

    const [tour, setTour] = useState(null);
    const [schedule, setSchedule] = useState(null);

    const [guests, setGuests] = useState(2);

    const [customer, setCustomer] = useState({
        fullName: "",
        email: "",
        phone: "",
        notes: "",
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // LOAD TOUR + PROFILE
    // =========================

    useEffect(() => {
        const loadBookingData = async () => {
            if (!tourId || !scheduleId) {
                setError(
                    "Thông tin tour hoặc lịch khởi hành không hợp lệ."
                );

                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login", {
                        state: {
                            from: `/booking?tourId=${tourId}&scheduleId=${scheduleId}`,
                        },
                    });

                    return;
                }

                const [
                    bookingInfoResponse,
                    profileResponse,
                ] = await Promise.all([
                    api.get(
                        `/api/Tours/${tourId}/booking-info/${scheduleId}`
                    ),

                    api.get("/api/Auth/profile", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                const bookingInfo =
                    bookingInfoResponse.data;

                const profile =
                    profileResponse.data;

                // =========================
                // TOUR
                // =========================

                setTour({
                    id: bookingInfo.tourId,
                    title: bookingInfo.tourName,
                    price: bookingInfo.price,
                    image: bookingInfo.coverImageUrl || "",
                    duration:
                        bookingInfo.durationDays
                            ? `${bookingInfo.durationDays} ngày ${bookingInfo.durationNights || 0
                            } đêm`
                            : "",
                });

                // =========================
                // SCHEDULE
                // =========================

                setSchedule({
                    id: bookingInfo.scheduleId,
                    startDate: bookingInfo.startDate,
                    endDate: bookingInfo.endDate,
                    availableSlots:
                        bookingInfo.availableSlots,
                    isActive:
                        bookingInfo.scheduleIsActive,
                });

                // =========================
                // CUSTOMER
                // =========================

                setCustomer({
                    fullName:
                        profile.fullName || "",

                    email:
                        profile.email || "",

                    phone:
                        profile.phone || "",

                    notes: "",
                });
            } catch (err) {
                console.error(
                    "Lỗi tải thông tin booking:",
                    err
                );

                const message =
                    err.response?.data?.message ||
                    err.response?.data?.title ||
                    "Không thể tải thông tin đặt tour.";

                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadBookingData();
    }, [tourId, scheduleId, navigate]);

    // =========================
    // CUSTOMER CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // SUBMIT BOOKING
    // =========================

    const handleSubmitBooking = async () => {
        if (!tour || !schedule) {
            return;
        }

        if (!customer.fullName.trim()) {
            alert("Vui lòng nhập họ và tên.");
            return;
        }

        if (!customer.email.trim()) {
            alert("Vui lòng nhập email.");
            return;
        }

        if (!customer.phone.trim()) {
            alert("Vui lòng nhập số điện thoại.");
            return;
        }

        if (guests <= 0) {
            alert("Số lượng khách không hợp lệ.");
            return;
        }

        if (guests > schedule.availableSlots) {
            alert(
                `Lịch này chỉ còn ${schedule.availableSlots} chỗ.`
            );

            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        // =========================
        // USER ID
        // =========================

        const userId = Number(user?.userId);

        if (!userId || userId <= 0) {
            console.error(
                "Không tìm thấy userId:",
                user
            );

            setError(
                "Không xác định được tài khoản đăng nhập. Vui lòng đăng nhập lại."
            );

            return;
        }

        try {
            setSubmitting(true);
            setError("");

            // =========================
            // CREATE BOOKING
            // =========================

            const response = await api.post(
                "/api/Bookings",
                {
                    userId: userId,

                    tourId: Number(tourId),

                    tourScheduleId:
                        Number(scheduleId),

                    numberOfPeople: guests,

                    customerName:
                        customer.fullName.trim(),

                    customerEmail:
                        customer.email.trim(),

                    customerPhone:
                        customer.phone.trim(),

                    note:
                        customer.notes.trim() ||
                        null,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const booking = response.data;

            console.log(
                "Booking tạo thành công:",
                booking
            );

            // =========================
            // SAVE BOOKING
            // =========================

            localStorage.setItem(
                "viettrip_booking",
                JSON.stringify(booking)
            );

            // =========================
            // GO PAYMENT
            // =========================

            navigate("/payment", {
                state: {
                    booking,
                },
            });
        } catch (err) {
            console.error(
                "Lỗi tạo booking:",
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

            const message =
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Không thể tạo booking. Vui lòng thử lại.";

            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="booking-page">
                <div className="booking-container">
                    <p>
                        Đang tải thông tin đặt tour...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error || !tour || !schedule) {
        return (
            <div className="booking-page">
                <div className="booking-container">
                    <div className="booking-main">
                        <h1>
                            Không thể đặt tour
                        </h1>

                        <p>
                            {error ||
                                "Không tìm thấy thông tin tour."}
                        </p>

                        <Link to="/tours">
                            Quay lại danh sách tour
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const totalPrice =
        Number(tour.price || 0) * guests;

    return (
        <div className="booking-page">
            <div className="booking-container">

                {/* =========================
                    BREADCRUMB
                ========================== */}

                <div className="booking-breadcrumb">
                    <Link to="/">
                        Trang chủ
                    </Link>

                    <span>›</span>

                    <Link to="/tours">
                        Tour
                    </Link>

                    <span>›</span>

                    <strong>
                        Đặt tour
                    </strong>
                </div>

                {/* =========================
                    LAYOUT
                ========================== */}

                <div className="booking-layout">

                    {/* =====================
                        LEFT
                    ====================== */}

                    <div className="booking-main">

                        <h1>
                            Thông tin đặt tour
                        </h1>

                        {/* TOUR */}

                        <section className="booking-section">

                            <h2>
                                <span>1.</span>
                                Thông tin tour
                            </h2>

                            <div className="booking-tour">

                                <img
                                    src={
                                        tour.image ||
                                        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80"
                                    }
                                    alt={tour.title}
                                />

                                <div className="booking-tour-info">

                                    <h3>
                                        {tour.title}
                                    </h3>

                                    <span>
                                        {tour.duration ||
                                            " "}
                                    </span>

                                </div>

                            </div>

                            <div className="booking-tour-fields">

                                {/* NGÀY */}

                                <div className="booking-field">

                                    <label>
                                        Ngày khởi hành
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            schedule.startDate
                                                ? schedule.startDate.slice(
                                                    0,
                                                    10
                                                )
                                                : ""
                                        }
                                        readOnly
                                    />

                                </div>

                                {/* SỐ KHÁCH */}

                                <div className="booking-field">

                                    <label>
                                        Số lượng khách
                                    </label>

                                    <div className="booking-counter">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setGuests(
                                                    Math.max(
                                                        1,
                                                        guests - 1
                                                    )
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>
                                            {guests}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setGuests(
                                                    Math.min(
                                                        Math.min(
                                                            20,
                                                            schedule.availableSlots
                                                        ),
                                                        guests + 1
                                                    )
                                                )
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                    <small>
                                        Còn{" "}
                                        {
                                            schedule.availableSlots
                                        }{" "}
                                        chỗ
                                    </small>

                                </div>

                            </div>

                        </section>

                        {/* CUSTOMER */}

                        <section className="booking-section">

                            <h2>
                                <span>2.</span>
                                Thông tin khách hàng
                            </h2>

                            <div className="customer-grid">

                                {/* FULL NAME */}

                                <div className="booking-field">

                                    <label>
                                        Họ và tên
                                        <em>*</em>
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={
                                            customer.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nhập họ và tên"
                                    />

                                </div>

                                {/* EMAIL */}

                                <div className="booking-field">

                                    <label>
                                        Email
                                        <em>*</em>
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            customer.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="example@gmail.com"
                                    />

                                </div>

                                {/* PHONE */}

                                <div className="booking-field">

                                    <label>
                                        Số điện thoại
                                        <em>*</em>
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            customer.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nhập số điện thoại"
                                    />

                                </div>

                                {/* NOTE */}

                                <div className="booking-field">

                                    <label>
                                        Ghi chú
                                    </label>

                                    <input
                                        type="text"
                                        name="notes"
                                        value={
                                            customer.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Nhập ghi chú"
                                    />

                                </div>

                            </div>

                        </section>

                    </div>

                    {/* =====================
                        RIGHT
                    ====================== */}

                    <aside className="booking-summary">

                        <h2>
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="summary-tour">

                            <img
                                src={
                                    tour.image ||
                                    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80"
                                }
                                alt={tour.title}
                            />

                            <div>

                                <h3>
                                    {tour.title}
                                </h3>

                                <span>
                                    {tour.duration ||
                                        "Thông tin tour"}
                                </span>

                            </div>

                        </div>

                        <div className="summary-info">

                            <div>

                                <span>
                                    Ngày khởi hành
                                </span>

                                <strong>
                                    {formatDate(
                                        schedule.startDate
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Số lượng khách
                                </span>

                                <strong>
                                    {guests} người
                                </strong>

                            </div>

                        </div>

                        <div className="summary-price">

                            <div>

                                <span>
                                    Giá tour
                                </span>

                                <strong>
                                    {formatPrice(
                                        tour.price
                                    )}{" "}
                                    × {guests}
                                </strong>

                            </div>

                            <div className="summary-total">

                                <span>
                                    Tổng tiền
                                </span>

                                <strong>
                                    {formatPrice(
                                        totalPrice
                                    )}
                                </strong>

                            </div>

                        </div>

                        {/* DISCOUNT */}

                        <div className="discount">

                            <label>
                                Mã giảm giá
                            </label>

                            <div>

                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá"
                                />

                                <button
                                    type="button"
                                >
                                    Áp dụng
                                </button>

                            </div>

                        </div>

                        <button
                            type="button"
                            className="continue-button"
                            onClick={
                                handleSubmitBooking
                            }
                            disabled={submitting}
                        >
                            {submitting
                                ? "Đang xử lý..."
                                : "Tiếp tục thanh toán →"}
                        </button>

                    </aside>

                </div>
            </div>
        </div>
    );
}

export default Booking;