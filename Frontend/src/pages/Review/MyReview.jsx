
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import "./MyReview.css";

function formatDate(date) {
    if (!date) return "--";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "--";
    }

    return parsedDate.toLocaleDateString("vi-VN");
}

function MyReviews() {
    const { user, isAuthenticated } = useAuth();

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingReview, setEditingReview] =
        useState(null);

    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] =
        useState("");

    const [saving, setSaving] = useState(false);

    // ==========================================
    // LẤY REVIEW
    // ==========================================

    useEffect(() => {
        if (!isAuthenticated || !user?.userId) {
            setLoading(false);
            return;
        }

        fetchReviews();
    }, [isAuthenticated, user?.userId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const userId = Number(user.userId);

            const reviewResponse = await api.get(
                `/api/Reviews/user/${userId}`
            );

            const reviewData = Array.isArray(
                reviewResponse.data
            )
                ? reviewResponse.data
                : [];

            // ==========================================
            // LẤY THÊM THÔNG TIN TOUR + SCHEDULE
            // ==========================================

            const enrichedReviews = await Promise.all(
                reviewData.map(async (review) => {
                    let tour = null;
                    let schedule = null;

                    // ------------------------------
                    // TOUR
                    // ------------------------------

                    try {
                        const tourResponse =
                            await api.get(
                                `/api/Tours/${review.tourId}`
                            );

                        tour = tourResponse.data;
                    } catch (tourError) {
                        console.error(
                            `Không lấy được tour ${review.tourId}:`,
                            tourError
                        );
                    }

                    // ------------------------------
                    // SCHEDULE
                    // ------------------------------

                    try {
                        const scheduleResponse =
                            await api.get(
                                `/api/TourSchedules/tour/${review.tourId}`
                            );

                        const schedules =
                            Array.isArray(
                                scheduleResponse.data
                            )
                                ? scheduleResponse.data
                                : [];

                        schedule = schedules.find(
                            (item) =>
                                Number(item.id) ===
                                Number(
                                    review.tourScheduleId
                                )
                        );

                        // Nếu Review không có tourScheduleId
                        // thì lấy schedule đầu tiên
                        if (!schedule && schedules.length) {
                            schedule = schedules[0];
                        }
                    } catch (scheduleError) {
                        console.error(
                            "Không lấy được lịch tour:",
                            scheduleError
                        );
                    }

                    return {
                        ...review,

                        tourName:
                            tour?.name ||
                            "Tour VietTrip",

                        duration:
                            tour?.durationDays
                                ? `${tour.durationDays} ngày ${tour.durationNights ||
                                0
                                } đêm`
                                : "--",

                        tourImage:
                            tour?.coverImageUrl ||
                            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",

                        departureDate:
                            schedule?.startDate || null,

                        tour: tour,
                        schedule: schedule,
                    };
                })
            );

            setReviews(enrichedReviews);
        } catch (err) {
            console.error(
                "Lỗi lấy danh sách đánh giá:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách đánh giá."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // MỞ FORM SỬA
    // ==========================================

    const handleEdit = (review) => {
        setEditingReview(review);

        setEditRating(
            Number(review.rating) || 5
        );

        setEditComment(
            review.comment || ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ==========================================
    // HỦY SỬA
    // ==========================================

    const handleCancelEdit = () => {
        setEditingReview(null);
        setEditRating(5);
        setEditComment("");
    };

    // ==========================================
    // CẬP NHẬT REVIEW
    // ==========================================

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingReview) return;

        if (!editRating) {
            alert("Vui lòng chọn số sao.");
            return;
        }

        if (!editComment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        try {
            setSaving(true);

            await api.put(
                `/api/Reviews/${editingReview.id}`,
                {
                    userId: Number(user.userId),
                    tourId: Number(
                        editingReview.tourId
                    ),
                    bookingId: Number(
                        editingReview.bookingId
                    ),
                    rating: Number(editRating),
                    comment: editComment.trim(),
                }
            );

            alert(
                "Cập nhật đánh giá thành công!"
            );

            setEditingReview(null);

            setEditRating(5);

            setEditComment("");

            await fetchReviews();
        } catch (err) {
            console.error(
                "Lỗi cập nhật đánh giá:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể cập nhật đánh giá."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // XÓA REVIEW
    // ==========================================

    const handleDelete = async (reviewId) => {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa đánh giá này không?"
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/api/Reviews/${reviewId}`
            );

            alert("Đã xóa đánh giá.");

            setReviews((prev) =>
                prev.filter(
                    (review) =>
                        review.id !== reviewId
                )
            );

            if (
                editingReview?.id ===
                reviewId
            ) {
                handleCancelEdit();
            }
        } catch (err) {
            console.error(
                "Lỗi xóa đánh giá:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể xóa đánh giá."
            );
        }
    };

    // ==========================================
    // CHƯA ĐĂNG NHẬP
    // ==========================================

    if (!isAuthenticated) {
        return (
            <div className="my-reviews-page">
                <div className="my-reviews-container">
                    <div className="my-reviews-empty">
                        <div className="empty-icon">
                            🔐
                        </div>

                        <h3>
                            Vui lòng đăng nhập
                        </h3>

                        <p>
                            Bạn cần đăng nhập để xem
                            các đánh giá của mình.
                        </p>

                        <Link
                            to="/login"
                            className="my-reviews-button"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-reviews-page">
            <div className="my-reviews-container">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="my-reviews-header">
                    <div>
                        <h1>
                            Đánh giá của tôi
                        </h1>

                        <p>
                            Xem lại và quản lý những
                            đánh giá bạn đã gửi
                        </p>
                    </div>
                </div>

                {/* ==================================
                    FORM SỬA
                ================================== */}

                {editingReview && (
                    <div className="edit-review-box">

                        <div className="edit-review-header">
                            <div>
                                <h2>
                                    Chỉnh sửa đánh giá
                                </h2>

                                <p>
                                    {
                                        editingReview.tourName
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                className="close-edit-button"
                                onClick={
                                    handleCancelEdit
                                }
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="edit-review-form"
                        >

                            {/* RATING */}

                            <div className="edit-field">
                                <label>
                                    Đánh giá của bạn
                                </label>

                                <div className="edit-stars">
                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={
                                                    star <=
                                                        editRating
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setEditRating(
                                                        star
                                                    )
                                                }
                                            >
                                                ★
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* COMMENT */}

                            <div className="edit-field">
                                <label>
                                    Nội dung đánh giá
                                </label>

                                <textarea
                                    value={
                                        editComment
                                    }
                                    onChange={(e) =>
                                        setEditComment(
                                            e.target.value
                                        )
                                    }
                                    maxLength={500}
                                    placeholder="Nhập nội dung đánh giá..."
                                />

                                <span className="character-count">
                                    {
                                        editComment.length
                                    }
                                    /500
                                </span>
                            </div>

                            {/* BUTTON */}

                            <div className="edit-actions">

                                <button
                                    type="button"
                                    className="cancel-edit-button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="save-edit-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : "Lưu thay đổi"}
                                </button>

                            </div>
                        </form>
                    </div>
                )}

                {/* ==================================
                    LOADING
                ================================== */}

                {loading && (
                    <div className="my-reviews-empty">
                        <div className="empty-icon">
                            ⏳
                        </div>

                        <h3>
                            Đang tải đánh giá...
                        </h3>

                        <p>
                            Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                )}

                {/* ==================================
                    ERROR
                ================================== */}

                {!loading && error && (
                    <div className="my-reviews-empty">
                        <div className="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Không thể tải đánh giá
                        </h3>

                        <p>{error}</p>

                        <button
                            className="my-reviews-button"
                            onClick={fetchReviews}
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* ==================================
                    REVIEW LIST
                ================================== */}

                {!loading &&
                    !error &&
                    reviews.length > 0 && (
                        <div className="my-reviews-list">

                            {reviews.map(
                                (review) => (
                                    <div
                                        className="my-review-card"
                                        key={review.id}
                                    >

                                        {/* IMAGE */}

                                        <div className="my-review-image">
                                            <img
                                                src={
                                                    review.tourImage
                                                }
                                                alt={
                                                    review.tourName
                                                }
                                            />
                                        </div>

                                        {/* CONTENT */}

                                        <div className="my-review-content">

                                            {/* TOP */}

                                            <div className="my-review-top">

                                                <div>
                                                    <h2>
                                                        {
                                                            review.tourName
                                                        }
                                                    </h2>

                                                    <div className="review-duration">
                                                        🕐{" "}
                                                        {
                                                            review.duration
                                                        }
                                                    </div>
                                                </div>

                                                <div className="review-date">
                                                    {formatDate(
                                                        review.createdAt
                                                    )}
                                                </div>
                                            </div>

                                            {/* INFO */}

                                            <div className="my-review-info">

                                                <div>
                                                    <span>
                                                        Ngày khởi hành
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            review.departureDate
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Mã booking
                                                    </span>

                                                    <strong>
                                                        {review.bookingCode ||
                                                            `#${review.bookingId}`}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Đánh giá
                                                    </span>

                                                    <div className="review-stars">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (
                                                                star
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        star
                                                                    }
                                                                    className={
                                                                        star <=
                                                                            Number(
                                                                                review.rating
                                                                            )
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

                                            </div>

                                            {/* COMMENT */}

                                            <div className="my-review-comment">
                                                <p>
                                                    "
                                                    {
                                                        review.comment
                                                    }
                                                    "
                                                </p>
                                            </div>

                                            {/* ACTIONS */}

                                            <div className="my-review-actions">

                                                <button
                                                    type="button"
                                                    className="edit-review-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            review
                                                        )
                                                    }
                                                >
                                                    ✏️ Sửa đánh giá
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-review-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            review.id
                                                        )
                                                    }
                                                >
                                                    🗑️ Xóa
                                                </button>

                                            </div>

                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    )}

                {/* ==================================
                    EMPTY
                ================================== */}

                {!loading &&
                    !error &&
                    reviews.length === 0 && (
                        <div className="my-reviews-empty">

                            <div className="empty-icon">
                                ⭐
                            </div>

                            <h3>
                                Bạn chưa có đánh giá nào
                            </h3>

                            <p>
                                Những đánh giá bạn gửi
                                sau khi hoàn thành tour
                                sẽ xuất hiện tại đây.
                            </p>

                            <Link
                                to="/bookings"
                                className="my-reviews-button secondary"
                            >
                                Xem đơn đặt tour
                            </Link>

                        </div>
                    )}

            </div>
        </div>
    );
}

export default MyReviews;

