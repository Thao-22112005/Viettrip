import { useEffect, useMemo, useState } from "react";

import "./ReviewManagement.css";
import api from "../../../services/api";

function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [tours, setTours] = useState([]);

    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [selectedReview, setSelectedReview] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // LOAD REVIEWS + USERS + TOURS
    // =========================
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [reviewResponse, userResponse, tourResponse] =
                await Promise.all([
                    api.get("/api/Reviews/admin"),
                    api.get("/api/Auth/internal/users"),
                    api.get("/api/Tours"),
                ]);

            const reviewData = Array.isArray(reviewResponse.data)
                ? reviewResponse.data
                : [];

            const userData = Array.isArray(userResponse.data)
                ? userResponse.data
                : [];

                console.log("USER DATA:", userData);
console.log("REVIEW DATA:", reviewData);

            const tourData = Array.isArray(tourResponse.data)
                ? tourResponse.data
                : [];

            setUsers(userData);
            setTours(tourData);

            // Ghép thông tin User + Tour vào Review
            const mappedReviews = reviewData.map((review) => {
                const user = userData.find(
                    (item) => item.id === review.userId
                );

                const tour = tourData.find(
                    (item) => item.id === review.tourId
                );

                return {
                    apiId: review.id,

                    id: `RV${String(review.id).padStart(3, "0")}`,

                    customer:
                        user?.fullName ||
                        `User #${review.userId}`,

                    email:
                        user?.email ||
                        "Chưa cập nhật",

                    tour:
                        tour?.name ||
                        `Tour #${review.tourId}`,

                    rating: review.rating,

                    content:
                        review.comment ||
                        "Không có nội dung.",

                    date: review.createdAt
                        ? new Date(
                            review.createdAt
                        ).toLocaleDateString("vi-VN")
                        : "--",

                    status: review.isActive
                        ? "Visible"
                        : "Hidden",

                    userId: review.userId,
                    tourId: review.tourId,
                    bookingId: review.bookingId,

                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                };
            });

            setReviews(mappedReviews);
        } catch (err) {
            console.error("Lỗi tải dữ liệu Review:", err);

            setError(
                err?.response?.data?.message ||
                "Không thể tải dữ liệu đánh giá."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =========================
    // FILTER
    // =========================
    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            const keyword = search.toLowerCase().trim();

            const matchesSearch =
                !keyword ||
                review.id
                    .toLowerCase()
                    .includes(keyword) ||
                review.customer
                    .toLowerCase()
                    .includes(keyword) ||
                review.email
                    .toLowerCase()
                    .includes(keyword) ||
                review.tour
                    .toLowerCase()
                    .includes(keyword) ||
                review.content
                    .toLowerCase()
                    .includes(keyword);

            const matchesRating =
                ratingFilter === "All" ||
                review.rating === Number(ratingFilter);

            const matchesStatus =
                statusFilter === "All" ||
                review.status === statusFilter;

            return (
                matchesSearch &&
                matchesRating &&
                matchesStatus
            );
        });
    }, [
        reviews,
        search,
        ratingFilter,
        statusFilter,
    ]);

    // =========================
    // SUMMARY
    // =========================
    const summary = useMemo(() => {
        const totalStars = reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
        );

        return {
            total: reviews.length,

            visible: reviews.filter(
                (review) => review.status === "Visible"
            ).length,

            hidden: reviews.filter(
                (review) => review.status === "Hidden"
            ).length,

            average:
                reviews.length > 0
                    ? (
                        totalStars /
                        reviews.length
                    ).toFixed(1)
                    : "0.0",
        };
    }, [reviews]);

    // =========================
    // HIDE / SHOW REVIEW
    // =========================
    const handleToggleVisibility = async (review) => {
        try {
            const newIsActive =
                review.status !== "Visible";

            await api.put(
                `/api/Reviews/${review.apiId}/visibility`,
                {
                    isActive: newIsActive,
                }
            );

            const newStatus = newIsActive
                ? "Visible"
                : "Hidden";

            setReviews((current) =>
                current.map((item) =>
                    item.apiId === review.apiId
                        ? {
                            ...item,
                            status: newStatus,
                        }
                        : item
                )
            );

            setSelectedReview((current) => {
                if (
                    !current ||
                    current.apiId !== review.apiId
                ) {
                    return current;
                }

                return {
                    ...current,
                    status: newStatus,
                };
            });
        } catch (err) {
            console.error(
                "Lỗi cập nhật trạng thái Review:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Không thể cập nhật trạng thái review."
            );
        }
    };

    // =========================
    // DELETE REVIEW
    // =========================
    const handleDeleteReview = async (review) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa review ${review.id} không?\n\nReview sẽ bị xóa hoàn toàn khỏi hệ thống.`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/api/Reviews/${review.apiId}`
            );

            setReviews((current) =>
                current.filter(
                    (item) =>
                        item.apiId !== review.apiId
                )
            );

            setSelectedReview((current) => {
                if (
                    current &&
                    current.apiId === review.apiId
                ) {
                    return null;
                }

                return current;
            });
        } catch (err) {
            console.error(
                "Lỗi xóa Review:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Không thể xóa review."
            );
        }
    };

    // =========================
    // STAR
    // =========================
    const renderStars = (rating) => {
        return (
            <span className="review-stars">
                {"★".repeat(rating)}

                <span className="review-stars-empty">
                    {"★".repeat(5 - rating)}
                </span>
            </span>
        );
    };

    return (
        <div className="review-management">
            <div className="page-heading">
                <div>
                    <h2>Quản lý Reviews</h2>

                    <p>
                        Theo dõi và kiểm soát các đánh giá
                        của khách hàng
                    </p>
                </div>
            </div>

            {/* ================= SUMMARY ================= */}
            <div className="review-summary">
                <div className="summary-card">
                    <div className="summary-icon blue">
                        ★
                    </div>

                    <div>
                        <span>Tổng đánh giá</span>

                        <strong>
                            {summary.total}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon green">
                        ✓
                    </div>

                    <div>
                        <span>Đang hiển thị</span>

                        <strong>
                            {summary.visible}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon orange">
                        ◷
                    </div>

                    <div>
                        <span>Đang ẩn</span>

                        <strong>
                            {summary.hidden}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon purple">
                        ★
                    </div>

                    <div>
                        <span>Điểm trung bình</span>

                        <strong>
                            {summary.average}/5
                        </strong>
                    </div>
                </div>
            </div>

            {/* ================= TOOLBAR ================= */}
            <div className="review-toolbar">
                <div className="review-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm khách hàng, tour, nội dung..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <select
                    value={ratingFilter}
                    onChange={(e) =>
                        setRatingFilter(e.target.value)
                    }
                >
                    <option value="All">
                        Tất cả số sao
                    </option>

                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="All">
                        Tất cả trạng thái
                    </option>

                    <option value="Visible">
                        Đang hiển thị
                    </option>

                    <option value="Hidden">
                        Đang ẩn
                    </option>
                </select>
            </div>

            {/* ================= TABLE ================= */}
            <div className="review-table-card">
                <div className="table-header">
                    <div>
                        <h3>Danh sách Reviews</h3>

                        <span>
                            {filteredReviews.length} đánh giá
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="review-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Khách hàng</th>
                                <th>Tour</th>
                                <th>Đánh giá</th>
                                <th>Nội dung</th>
                                <th>Ngày</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="empty-state"
                                    >
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="empty-state"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredReviews.length ===
                                0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="empty-state"
                                    >
                                        Không tìm thấy đánh giá
                                        phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map(
                                    (review) => (
                                        <tr
                                            key={
                                                review.apiId
                                            }
                                        >
                                            <td>
                                                <strong className="review-id">
                                                    {review.id}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="review-user-cell">
                                                    <div className="review-avatar">
                                                        {review.customer
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                review.customer
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                review.email
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        review.tour
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="rating-cell">
                                                    {renderStars(
                                                        review.rating
                                                    )}

                                                    <span>
                                                        {
                                                            review.rating
                                                        }
                                                        /5
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <p className="review-content">
                                                    {
                                                        review.content
                                                    }
                                                </p>
                                            </td>

                                            <td>
                                                {review.date}
                                            </td>

                                            <td>
                                                <span
                                                    className={`review-status ${review.status ===
                                                            "Visible"
                                                            ? "review-status-visible"
                                                            : "review-status-hidden"
                                                        }`}
                                                >
                                                    {review.status ===
                                                        "Visible"
                                                        ? "Hiển thị"
                                                        : "Đang ẩn"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="review-actions">
                                                    <button
                                                        type="button"
                                                        className="review-action-view"
                                                        onClick={() =>
                                                            setSelectedReview(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        Xem
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            review.status ===
                                                                "Visible"
                                                                ? "review-action-hide"
                                                                : "review-action-show"
                                                        }
                                                        onClick={() =>
                                                            handleToggleVisibility(
                                                                review
                                                            )
                                                        }
                                                    >
                                                        {review.status ===
                                                            "Visible"
                                                            ? "Ẩn"
                                                            : "Hiện"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL ================= */}
            {selectedReview && (
                <div
                    className="review-modal-overlay"
                    onClick={() =>
                        setSelectedReview(null)
                    }
                >
                    <div
                        className="review-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="review-modal-header">
                            <div>
                                <span>
                                    Chi tiết Review
                                </span>

                                <h3>
                                    {
                                        selectedReview.id
                                    }
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setSelectedReview(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="review-detail-user">
                            <div className="large-review-avatar">
                                {selectedReview.customer
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    {
                                        selectedReview.customer
                                    }
                                </strong>

                                <span>
                                    {
                                        selectedReview.email
                                    }
                                </span>
                            </div>
                        </div>

                        <div className="review-detail-content">
                            <div className="detail-item">
                                <span>Tour</span>

                                <strong>
                                    {
                                        selectedReview.tour
                                    }
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Ngày đánh giá
                                </span>

                                <strong>
                                    {
                                        selectedReview.date
                                    }
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Số sao</span>

                                <div className="detail-rating">
                                    {renderStars(
                                        selectedReview.rating
                                    )}

                                    <strong>
                                        {
                                            selectedReview.rating
                                        }
                                        /5
                                    </strong>
                                </div>
                            </div>

                            <div className="detail-item review-full-content">
                                <span>Nội dung</span>

                                <p>
                                    {
                                        selectedReview.content
                                    }
                                </p>
                            </div>

                            <div className="detail-item">
                                <span>
                                    Trạng thái
                                </span>

                                <span
                                    className={`review-status ${selectedReview.status ===
                                            "Visible"
                                            ? "review-status-visible"
                                            : "review-status-hidden"
                                        }`}
                                >
                                    {selectedReview.status ===
                                        "Visible"
                                        ? "Đang hiển thị"
                                        : "Đang ẩn"}
                                </span>
                            </div>
                        </div>

                        <div className="review-modal-note">
                            <span>ℹ</span>

                            <p>
                                Admin chỉ quản lý trạng thái
                                hiển thị của review. Nội dung
                                đánh giá của khách hàng không
                                được chỉnh sửa.
                            </p>
                        </div>

                        <div className="review-modal-actions">
                            <button
                                type="button"
                                className={
                                    selectedReview.status ===
                                        "Visible"
                                        ? "modal-hide-review"
                                        : "modal-show-review"
                                }
                                onClick={() =>
                                    handleToggleVisibility(
                                        selectedReview
                                    )
                                }
                            >
                                {selectedReview.status ===
                                    "Visible"
                                    ? "Ẩn đánh giá"
                                    : "Hiện đánh giá"}
                            </button>

                            <button
                                type="button"
                                className="modal-hide-review"
                                onClick={() =>
                                    handleDeleteReview(
                                        selectedReview
                                    )
                                }
                            >
                                Xóa đánh giá
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewManagement;