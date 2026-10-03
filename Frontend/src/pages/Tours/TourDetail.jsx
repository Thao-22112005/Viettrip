import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";

import "./TourDetail.css";

const fallbackImage =
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80";

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(date) {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return date;
    }

    return value.toLocaleDateString("vi-VN");
}

function TourDetail() {
    const { id } = useParams();

    const [tour, setTour] = useState(null);
    const [destination, setDestination] = useState(null);
    const [images, setImages] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [activeImage, setActiveImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTourDetail = async () => {
            try {
                setLoading(true);
                setError("");

                // =========================
                // 1. LẤY THÔNG TIN TOUR
                // =========================

                const tourResponse = await api.get(
                    `/api/Tours/${id}`
                );

                const tourData = tourResponse.data;

                if (!tourData) {
                    setError("Không tìm thấy tour.");
                    return;
                }

                if (!tourData.isActive) {
                    setError(
                        "Tour này hiện không còn hoạt động."
                    );
                    return;
                }

                setTour(tourData);

                // =========================
                // 2. LẤY DỮ LIỆU LIÊN QUAN
                // =========================

                const [
                    destinationResponse,
                    imagesResponse,
                    itineraryResponse,
                    schedulesResponse,
                    reviewsResponse,
                ] = await Promise.all([
                    api.get(
                        `/api/Destinations/${tourData.destinationId}`
                    ),

                    api.get(
                        `/api/TourImages/tour/${id}`
                    ),

                    api.get(
                        `/api/Itineraries/tour/${id}`
                    ),

                    api.get(
                        `/api/TourSchedules/tour/${id}`
                    ),

                    api.get(
                        `/api/Reviews/tour/${id}`
                    ),
                ]);

                // =========================
                // DESTINATION
                // =========================

                setDestination(
                    destinationResponse.data || null
                );

                // =========================
                // GALLERY
                // =========================

                const imageData = Array.isArray(
                    imagesResponse.data
                )
                    ? imagesResponse.data
                        .filter(
                            (image) =>
                                image.isActive
                        )
                        .sort(
                            (a, b) =>
                                (a.displayOrder ?? 0) -
                                (b.displayOrder ?? 0)
                        )
                    : [];

                const galleryUrls = imageData
                    .map(
                        (image) =>
                            image.imageUrl
                    )
                    .filter(Boolean);

                const allImageUrls = [
                    ...(tourData.coverImageUrl
                        ? [
                            tourData.coverImageUrl,
                        ]
                        : []),

                    ...galleryUrls.filter(
                        (url) =>
                            url !==
                            tourData.coverImageUrl
                    ),
                ];

                const finalImages =
                    allImageUrls.length > 0
                        ? allImageUrls
                        : [fallbackImage];

                setImages(finalImages);

                setActiveImage(
                    finalImages[0]
                );

                // =========================
                // ITINERARY
                // =========================

                const itineraryData =
                    Array.isArray(
                        itineraryResponse.data
                    )
                        ? [
                            ...itineraryResponse.data,
                        ].sort(
                            (a, b) =>
                                (a.dayNumber ?? 0) -
                                (b.dayNumber ?? 0)
                        )
                        : [];

                setItineraries(
                    itineraryData
                );

                // =========================
                // SCHEDULE
                // =========================

                const scheduleData =
                    Array.isArray(
                        schedulesResponse.data
                    )
                        ? [
                            ...schedulesResponse.data,
                        ]
                            .filter(
                                (schedule) =>
                                    schedule.isActive
                            )
                            .sort(
                                (a, b) =>
                                    new Date(
                                        a.startDate
                                    ) -
                                    new Date(
                                        b.startDate
                                    )
                            )
                        : [];

                setSchedules(
                    scheduleData
                );

                // =========================
                // REVIEWS
                // =========================

                const reviewData =
                    Array.isArray(
                        reviewsResponse.data
                    )
                        ? reviewsResponse.data
                        : [];

                setReviews(reviewData);
            } catch (err) {
                console.error(
                    "Lỗi lấy chi tiết tour:",
                    err
                );

                if (
                    err.response?.status === 404
                ) {
                    setError(
                        "Không tìm thấy tour."
                    );
                } else {
                    setError(
                        "Không thể tải thông tin tour."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTourDetail();
        }
    }, [id]);

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="tour-detail-page">
                <section className="tour-detail-container">
                    <div className="tour-empty">
                        <div className="tour-empty-icon">
                            ⏳
                        </div>

                        <h3>
                            Đang tải thông tin tour...
                        </h3>

                        <p>
                            Vui lòng chờ một chút.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error || !tour) {
        return (
            <div className="tour-detail-page">
                <section className="tour-detail-container">
                    <div className="tour-empty">
                        <div className="tour-empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            {error ||
                                "Không tìm thấy tour."}
                        </h3>

                        <p>
                            Vui lòng quay lại danh
                            sách tour.
                        </p>

                        <Link
                            to="/tours"
                            className="departure-button"
                        >
                            Xem danh sách tour
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    // =========================
    // RATING
    // =========================

    const reviewCount =
        reviews.length;

    const averageRating =
        reviewCount > 0
            ? reviews.reduce(
                (sum, review) =>
                    sum +
                    Number(
                        review.rating || 0
                    ),
                0
            ) / reviewCount
            : null;

    // =========================
    // TOUR DATA
    // =========================

    const duration =
        `${tour.durationDays} ngày ` +
        `${tour.durationNights} đêm`;

    const location =
        destination?.province ||
        destination?.name ||
        "Việt Nam";

    const status = tour.isActive
        ? "Đang chạy"
        : "Tạm ngưng";

    return (
        <div className="tour-detail-page">
            {/* =========================
                BREADCRUMB
            ========================== */}

            <div className="tour-detail-container">
                <div className="breadcrumb">
                    <Link to="/">
                        Trang chủ
                    </Link>

                    <span>›</span>

                    <Link to="/tours">
                        Tour
                    </Link>

                    <span>›</span>

                    <strong>
                        {tour.name}
                    </strong>
                </div>
            </div>

            {/* =========================
                TOUR HEADER
            ========================== */}

            <section className="tour-detail-container">
                <div className="tour-overview">
                    {/* GALLERY */}

                    <div className="tour-gallery">
                        <div className="tour-main-image">
                            <img
                                src={
                                    activeImage ||
                                    fallbackImage
                                }
                                alt={tour.name}
                            />

                            <span className="image-counter">
                                {Math.max(
                                    images.indexOf(
                                        activeImage
                                    ) + 1,
                                    1
                                )}
                                /
                                {images.length}
                            </span>
                        </div>

                        <div className="tour-thumbnail-list">
                            {images.map(
                                (
                                    image,
                                    index
                                ) => (
                                    <button
                                        key={
                                            `${image}-${index}`
                                        }
                                        className={
                                            activeImage ===
                                                image
                                                ? "tour-thumbnail active"
                                                : "tour-thumbnail"
                                        }
                                        onClick={() =>
                                            setActiveImage(
                                                image
                                            )
                                        }
                                    >
                                        <img
                                            src={image}
                                            alt={`Tour ${index +
                                                1
                                                }`}
                                        />
                                    </button>
                                )
                            )}

                            <button className="gallery-next">
                                ›
                            </button>
                        </div>
                    </div>

                    {/* TOUR INFO */}

                    <div className="tour-overview-info-users">
                        <div className="tour-title-row-users">
                            <div>
                                <h1>
                                    {tour.name}
                                </h1>

                                <div className="tour-rating-users">
                                    <span className="star-users">
                                        ★
                                    </span>

                                    <strong>
                                        {averageRating !==
                                            null
                                            ? averageRating.toFixed(
                                                1
                                            )
                                            : "Chưa có"}
                                    </strong>

                                    <span>
                                        (
                                        {
                                            reviewCount
                                        }{" "}
                                        đánh giá)
                                    </span>
                                </div>
                            </div>

                            <span className="tour-status-users">
                                {status}
                            </span>
                        </div>

                        <div className="tour-meta">
                            {/* THỜI GIAN */}

                            <div className="tour-meta-item">
                                <span>◷</span>

                                <div>
                                    <small>
                                        Thời gian
                                    </small>

                                    <strong>
                                        {duration}
                                    </strong>
                                </div>
                            </div>

                            {/* KHỞI HÀNH */}

                            <div className="tour-meta-item">
                                <span>⌖</span>

                                <div>
                                    <small>
                                        Khởi hành
                                    </small>

                                    <strong>
                                        {tour.departure ||
                                            "Đang cập nhật"}
                                    </strong>
                                </div>
                            </div>

                            {/* PHƯƠNG TIỆN */}

                            <div className="tour-meta-item">
                                <span>♧</span>

                                <div>
                                    <small>
                                        Phương tiện
                                    </small>

                                    <strong>
                                        {tour.transport ||
                                            "Đang cập nhật"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* PRICE */}

                        <div className="tour-price">
                            <strong>
                                {formatPrice(
                                    tour.price
                                )}
                            </strong>

                            <span>
                                /người
                            </span>
                        </div>

                        <p className="price-note">
                            Giá có thể thay đổi theo
                            thời điểm
                        </p>

                        {/* DESCRIPTION */}

                        <div className="tour-description">
                            <h3>
                                Mô tả tour
                            </h3>

                            <p>
                                {tour.description ||
                                    "Chưa có mô tả cho tour này."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
                ITINERARY + DEPARTURES
            ========================== */}

            <section className="tour-detail-container">
                <div className="tour-bottom-layout">
                    {/* ITINERARY */}

                    <div className="itinerary-section">
                        <h2>
                            Lịch trình chi tiết
                        </h2>

                        <div className="itinerary-list">
                            {itineraries.length >
                                0 ? (
                                itineraries.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            className="itinerary-row"
                                            key={
                                                item.id ||
                                                index
                                            }
                                        >
                                            <div className="itinerary-day">
                                                <span>
                                                    Ngày{" "}
                                                    {
                                                        item.dayNumber
                                                    }
                                                </span>
                                            </div>

                                            <div className="itinerary-line">
                                                <span></span>
                                            </div>

                                            <div className="itinerary-content">
                                                <h3>
                                                    {
                                                        item.title
                                                    }
                                                </h3>

                                                <p>
                                                    {item.description ||
                                                        "Chưa có thông tin chi tiết."}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="tour-empty">
                                    <p>
                                        Tour chưa có
                                        lịch trình chi
                                        tiết.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DEPARTURES */}

                    <div className="departure-section">
                        <div className="departure-header">
                            <h2>
                                Lịch khởi hành
                            </h2>
                        </div>

                        <div className="departure-card">
                            {schedules.length >
                                0 ? (
                                schedules.map(
                                    (
                                        schedule
                                    ) => (
                                        <div
                                            className="departure-row"
                                            key={
                                                schedule.id
                                            }
                                        >
                                            <div>
                                                <strong>
                                                    {formatDate(
                                                        schedule.startDate
                                                    )}
                                                </strong>

                                                <span>
                                                    Còn{" "}
                                                    {
                                                        schedule.availableSlots
                                                    }{" "}
                                                    chỗ
                                                </span>
                                            </div>

                                            <strong className="departure-price">
                                                {formatPrice(
                                                    tour.price
                                                )}
                                            </strong>

                                            <Link
                                                to={`/booking?tourId=${tour.id}&scheduleId=${schedule.id}`}
                                                className="departure-button"
                                            >
                                                Đặt ngay
                                            </Link>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="tour-empty">
                                    <p>
                                        Hiện chưa có
                                        lịch khởi hành.
                                    </p>
                                </div>
                            )}

                            {schedules.length >
                                0 && (
                                    <button className="view-more">
                                        Xem thêm lịch khởi
                                        hành →
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default TourDetail;