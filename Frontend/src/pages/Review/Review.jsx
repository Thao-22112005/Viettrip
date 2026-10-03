import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./Review.css";

function Review() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const bookingId = searchParams.get("bookingId");
    const tourId = searchParams.get("tourId");

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const [tour, setTour] = useState(null);
    const [booking, setBooking] = useState(null);
    const [schedule, setSchedule] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            if (authLoading) return;

            if (!user?.userId) {
                setError("Vui lòng đăng nhập để đánh giá tour.");
                setLoading(false);
                return;
            }

            if (!bookingId || !tourId) {
                setError("Thiếu thông tin booking hoặc tour.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // ==============================
                // 1. Lấy Booking
                // ==============================
                const bookingResponse = await api.get(
                    `/api/Bookings/${bookingId}`
                );

                const bookingData = bookingResponse.data;

                // Kiểm tra booking có thuộc user hiện tại không
                if (Number(bookingData.userId) !== Number(user.userId)) {
                    setError("Bạn không có quyền đánh giá booking này.");
                    setLoading(false);
                    return;
                }

                // Kiểm tra đúng tour
                if (Number(bookingData.tourId) !== Number(tourId)) {
                    setError("Tour không khớp với booking.");
                    setLoading(false);
                    return;
                }

                // Chỉ Completed mới được đánh giá
                if (bookingData.status !== "Completed") {
                    setError(
                        "Chỉ có thể đánh giá sau khi booking đã hoàn thành."
                    );
                    setLoading(false);
                    return;
                }

                setBooking(bookingData);

                // ==============================
                // 2. Lấy Tour
                // ==============================
                const tourResponse = await api.get(
                    `/api/Tours/${bookingData.tourId}`
                );

                setTour(tourResponse.data);

                // ==============================
                // 3. Lấy Schedule
                // ==============================
                const scheduleResponse = await api.get(
                    `/api/TourSchedules/tour/${bookingData.tourId}`
                );

                const schedules = Array.isArray(scheduleResponse.data)
                    ? scheduleResponse.data
                    : [];

                const currentSchedule = schedules.find(
                    (item) =>
                        Number(item.id) ===
                        Number(bookingData.tourScheduleId)
                );

                setSchedule(currentSchedule || null);

                // ==============================
                // 4. Kiểm tra đã đánh giá chưa
                // ==============================
                const reviewResponse = await api.get(
                    `/api/Reviews/user/${user.userId}`
                );

                const reviews = Array.isArray(reviewResponse.data)
                    ? reviewResponse.data
                    : [];

                const existingReview = reviews.find(
                    (review) =>
                        Number(review.bookingId) === Number(bookingId)
                );

                if (existingReview) {
                    setRating(existingReview.rating || 0);
                    setComment(existingReview.comment || "");
                    setSubmitted(true);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu đánh giá:", err);

                setError(
                    err.response?.data?.message ||
                    "Không thể tải thông tin đánh giá."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bookingId, tourId, user?.userId, authLoading]);

    const formatDate = (date) => {
        if (!date) return "--";

        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDuration = () => {
        if (!tour?.durationDays) return "--";

        return `${tour.durationDays} ngày ${tour.durationNights || 0
            } đêm`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        if (!booking || !tour || !user?.userId) {
            alert("Không đủ thông tin để gửi đánh giá.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const response = await api.post("/api/Reviews", {
                userId: Number(user.userId),
                tourId: Number(tour.id),
                bookingId: Number(booking.id),
                rating: rating,
                comment: comment.trim(),
            });

            console.log("Review created:", response.data);

            setSubmitted(true);
        } catch (err) {
            console.error("Lỗi gửi đánh giá:", err);

            const message =
                err.response?.data?.message ||
                "Không thể gửi đánh giá. Vui lòng thử lại.";

            setError(message);

            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ==============================
    // Loading
    // ==============================
    if (authLoading || loading) {
        return (
            <div className="review-page">
                <div className="review-container">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "80px 20px",
                        }}
                    >
                        Đang tải thông tin đánh giá...
                    </div>
                </div>
            </div>
        );
    }

    // ==============================
    // Error
    // ==============================
    if (error && (!tour || !booking)) {
        return (
            <div className="review-page">
                <div className="review-container">
                    <div className="review-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span>/</span>
                        <Link to="/bookings">Đơn đặt tour</Link>
                        <span>/</span>
                        <span>Đánh giá</span>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: "80px 20px",
                        }}
                    >
                        <h2>Không thể đánh giá</h2>

                        <p
                            style={{
                                marginTop: "12px",
                                color: "#666",
                            }}
                        >
                            {error}
                        </p>

                        <Link
                            to="/bookings"
                            className="primary-button"
                            style={{
                                display: "inline-block",
                                marginTop: "24px",
                            }}
                        >
                            Quay lại đơn đặt tour
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ==============================
    // Đã gửi đánh giá
    // ==============================
    if (submitted) {
        return (
            <div className="review-page">
                <div className="review-success-container">
                    <div className="success-icon">✓</div>

                    <h1>Cảm ơn bạn đã đánh giá!</h1>

                    <p>
                        Đánh giá của bạn đã được ghi nhận và sẽ giúp
                        VietTrip mang đến những trải nghiệm tốt hơn.
                    </p>

                    <div className="success-rating">
                        {"★".repeat(rating)}
                        {"☆".repeat(5 - rating)}
                    </div>

                    <div className="success-actions">
                        <Link
                            to="/bookings"
                            className="primary-button"
                        >
                            Xem đơn đặt tour
                        </Link>

                        <Link
                            to={`/bookings/${booking?.id}`}
                            className="secondary-button"
                        >
                            Chi tiết đơn
                        </Link>

                        <Link
                            to="/"
                            className="secondary-button"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="review-page">
            <div className="review-container">

                {/* Breadcrumb */}
                <div className="review-breadcrumb">
                    <Link to="/">Trang chủ</Link>

                    <span>/</span>

                    <Link to="/bookings">
                        Đơn đặt tour
                    </Link>

                    <span>/</span>

                    <span>Đánh giá</span>
                </div>

                {/* Header */}
                <div className="review-header">
                    <h1>Đánh giá chuyến đi</h1>

                    <p>
                        Chia sẻ trải nghiệm của bạn để giúp những
                        du khách khác có thêm thông tin.
                    </p>
                </div>

                <div className="review-layout">

                    {/* ================= LEFT ================= */}
                    <div className="review-main">

                        {/* Tour */}
                        <section className="review-card tour-review-card">
                            <div className="tour-review-info">

                                <img
                                    src={
                                        tour?.coverImageUrl ||
                                        "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80"
                                    }
                                    alt={tour?.name || "Tour VietTrip"}
                                />

                                <div className="tour-review-content">

                                    <span className="completed-label">
                                        ✓ Đã hoàn thành
                                    </span>

                                    <h2>
                                        {tour?.name ||
                                            "Tour VietTrip"}
                                    </h2>

                                    <div className="tour-review-meta">

                                        <span>
                                            🕐 {formatDuration()}
                                        </span>

                                        <span>
                                            📅{" "}
                                            {formatDate(
                                                schedule?.startDate
                                            )}
                                        </span>

                                        <span>
                                            🎫 Mã đơn:{" "}
                                            {booking?.bookingCode ||
                                                "--"}
                                        </span>

                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Rating */}
                        <section className="review-card">
                            <div className="review-section-title">
                                <h2>
                                    Chuyến đi của bạn thế nào?
                                </h2>

                                <p>
                                    Hãy đánh giá trải nghiệm tổng thể
                                    của bạn với chuyến đi này.
                                </p>
                            </div>

                            <div className="rating-section">

                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={
                                                    star <=
                                                        (hoverRating ||
                                                            rating)
                                                        ? "star active"
                                                        : "star"
                                                }
                                                onClick={() =>
                                                    setRating(star)
                                                }
                                                onMouseEnter={() =>
                                                    setHoverRating(
                                                        star
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    setHoverRating(0)
                                                }
                                                aria-label={`${star} sao`}
                                            >
                                                ★
                                            </button>
                                        )
                                    )}
                                </div>

                                <p className="rating-text">
                                    {rating === 0 &&
                                        "Chạm vào số sao để đánh giá"}

                                    {rating === 1 &&
                                        "Rất không hài lòng"}

                                    {rating === 2 &&
                                        "Không hài lòng"}

                                    {rating === 3 &&
                                        "Bình thường"}

                                    {rating === 4 &&
                                        "Hài lòng"}

                                    {rating === 5 &&
                                        "Tuyệt vời!"}
                                </p>
                            </div>
                        </section>

                        {/* Comment */}
                        <section className="review-card">
                            <div className="review-section-title">
                                <h2>
                                    Chia sẻ trải nghiệm
                                </h2>

                                <p>
                                    Điều gì khiến chuyến đi của bạn
                                    đáng nhớ?
                                </p>
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) =>
                                    setComment(e.target.value)
                                }
                                placeholder="Viết cảm nhận của bạn về chuyến đi..."
                                maxLength={500}
                            />

                            <div className="textarea-footer">
                                <span>
                                    Bạn có thể chia sẻ những điều
                                    mình thích hoặc chưa hài lòng.
                                </span>

                                <span>
                                    {comment.length}/500
                                </span>
                            </div>
                        </section>

                        {/* Photo */}
                        <section className="review-card">
                            <div className="review-section-title">
                                <h2>Thêm hình ảnh</h2>

                                <p>
                                    Chia sẻ những khoảnh khắc đẹp
                                    trong chuyến đi của bạn.
                                </p>
                            </div>

                            <div className="upload-box">
                                <div className="upload-icon">
                                    📷
                                </div>

                                <strong>
                                    Thêm hình ảnh
                                </strong>

                                <span>
                                    Tính năng sẽ được kết nối sau
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* ================= RIGHT ================= */}
                    <aside className="review-sidebar">

                        <div className="review-card review-tips">
                            <h2>💡 Gợi ý đánh giá</h2>

                            <div className="tip-item">
                                <span>01</span>

                                <p>
                                    Chia sẻ cảm nhận thực tế về
                                    chuyến đi.
                                </p>
                            </div>

                            <div className="tip-item">
                                <span>02</span>

                                <p>
                                    Bạn thích nhất điều gì trong
                                    tour?
                                </p>
                            </div>

                            <div className="tip-item">
                                <span>03</span>

                                <p>
                                    Có điều gì VietTrip có thể
                                    cải thiện?
                                </p>
                            </div>
                        </div>

                        <div className="review-card review-submit-card">

                            <div className="submit-summary">
                                <span>
                                    Đánh giá của bạn
                                </span>

                                <div className="mini-stars">
                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (
                                            <span
                                                key={star}
                                                className={
                                                    star <= rating
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                ★
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            {error && (
                                <p
                                    style={{
                                        color: "#dc2626",
                                        fontSize: "14px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            <button
                                type="button"
                                className="submit-review-button"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Đang gửi..."
                                    : "Gửi đánh giá"}
                            </button>

                            <Link
                                to="/bookings"
                                className="cancel-review-link"
                            >
                                Quay lại
                            </Link>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Review;