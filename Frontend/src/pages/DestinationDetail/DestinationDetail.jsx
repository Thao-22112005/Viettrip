import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import api from "../../services/api";

import "./DestinationDetail.css";

const fallbackImages = {
    "Hạ Long":
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",

    "Ninh Bình":
        "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=80",

    "Sa Pa":
        "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=1600&q=80",

    "Đà Nẵng":
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80",

    "Hội An":
        "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=80",

    "Nha Trang":
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80",

    "Phú Quốc":
        "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=80",

    "Đà Lạt":
        "https://images.unsplash.com/photo-1558888494-8f7c9c6b6d7e?auto=format&fit=crop&w=1600&q=80",

    "Vũng Tàu":
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
};

function DestinationDetail() {
    const { id } = useParams();

    const [destination, setDestination] = useState(null);

    const [destinationTours, setDestinationTours] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDestinationDetail = async () => {
            try {
                setLoading(true);
                setError("");

                // Lấy thông tin điểm đến + tour + review song song
                const [
                    destinationResponse,
                    toursResponse,
                    reviewsResponse,
                ] = await Promise.all([
                    api.get(`/api/Destinations/${id}`),
                    api.get("/api/Tours"),
                    api.get("/api/Reviews/tour-summary"),
                ]);

                const data = destinationResponse.data;

                if (!data || data.isActive === false) {
                    setDestination(null);
                    setDestinationTours([]);
                    return;
                }

                // ================= HIGHLIGHTS =================

                const highlights = Array.isArray(data.highlights)
                    ? data.highlights
                        .filter(
                            (highlight) =>
                                highlight.isActive
                        )
                        .sort(
                            (a, b) =>
                                (a.sortOrder ?? 0) -
                                (b.sortOrder ?? 0)
                        )
                    : [];

                // ================= TOURS =================

                const tours = Array.isArray(
                    toursResponse.data
                )
                    ? toursResponse.data
                    : [];

                // ================= REVIEWS =================

                const reviewSummaries = Array.isArray(
                    reviewsResponse.data
                )
                    ? reviewsResponse.data
                    : [];

                // Chỉ lấy tour thuộc destination hiện tại
                const toursOfDestination = tours
                    .filter(
                        (tour) =>
                            tour.isActive &&
                            tour.destinationId === data.id
                    )
                    .map((tour) => {
                        const reviewSummary =
                            reviewSummaries.find(
                                (review) =>
                                    review.tourId === tour.id
                            );

                        return {
                            id: tour.id,

                            name: tour.name,

                            location:
                                data.province ||
                                data.name,

                            duration:
                                tour.durationNights > 0
                                    ? `${tour.durationDays} ngày ${tour.durationNights} đêm`
                                    : `${tour.durationDays} ngày`,

                            price: new Intl.NumberFormat(
                                "vi-VN"
                            ).format(tour.price),

                            image:
                                tour.coverImageUrl ||
                                fallbackImages[data.name] ||
                                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",

                            rating:
                                reviewSummary?.averageRating ??
                                0,

                            reviewCount:
                                reviewSummary?.reviewCount ??
                                0,
                        };
                    });

                setDestinationTours(
                    toursOfDestination
                );

                // ================= DESTINATION =================

                setDestination({
                    id: data.id,

                    name: data.name,

                    province:
                        data.province ||
                        data.name,

                    country:
                        data.country ||
                        "Vietnam",

                    region:
                        data.region ||
                        "Việt Nam",

                    // Số tour lấy trực tiếp từ danh sách tour thực tế
                    tours: toursOfDestination.length,

                    image:
                        data.imageUrl ||
                        fallbackImages[data.name] ||
                        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",

                    shortDescription:
                        data.shortDescription ||
                        data.description ||
                        "Khám phá vẻ đẹp và những trải nghiệm đặc sắc tại điểm đến này.",

                    description:
                        data.description ||
                        data.shortDescription ||
                        "Khám phá vẻ đẹp và những trải nghiệm đặc sắc tại điểm đến này.",

                    introduction:
                        data.description ||
                        data.shortDescription ||
                        "Khám phá vẻ đẹp và những trải nghiệm đặc sắc tại điểm đến này.",

                    highlights,
                });
            } catch (err) {
                console.error(
                    "Lỗi lấy chi tiết điểm đến:",
                    err
                );

                if (err.response?.status === 404) {
                    setDestination(null);
                } else {
                    setError(
                        "Không thể tải thông tin điểm đến."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDestinationDetail();
    }, [id]);

    // ================= LOADING =================

    if (loading) {
        return (
            <div className="destination-detail-not-found">
                <h2>
                    Đang tải điểm đến...
                </h2>

                <p>
                    Vui lòng chờ trong giây lát.
                </p>
            </div>
        );
    }

    // ================= ERROR =================

    if (error) {
        return (
            <div className="destination-detail-not-found">
                <h2>
                    Không thể tải điểm đến
                </h2>

                <p>
                    {error}
                </p>

                <Link to="/destinations">
                    ← Quay lại điểm đến
                </Link>
            </div>
        );
    }

    // ================= NOT FOUND =================

    if (!destination) {
        return (
            <div className="destination-detail-not-found">
                <h2>
                    Không tìm thấy điểm đến
                </h2>

                <p>
                    Điểm đến bạn đang tìm kiếm
                    không tồn tại hoặc đã được
                    vô hiệu hóa.
                </p>

                <Link to="/destinations">
                    ← Quay lại điểm đến
                </Link>
            </div>
        );
    }

    return (
        <div className="destination-detail-page">

            {/* ================= HERO ================= */}

            <section
                className="destination-detail-hero"
                style={{
                    backgroundImage: `url(${destination.image})`,
                }}
            >
                <div className="destination-detail-hero-overlay"></div>

                <div className="destination-detail-hero-content">

                    {/* BREADCRUMB */}

                    <div className="destination-detail-breadcrumb">
                        <Link to="/">
                            Trang chủ
                        </Link>

                        <span>›</span>

                        <Link to="/destinations">
                            Điểm đến
                        </Link>

                        <span>›</span>

                        <span>
                            {destination.name}
                        </span>
                    </div>

                    {/* HERO INFORMATION */}

                    <div className="destination-detail-hero-info">

                        <span className="destination-detail-region">
                            ✦ {destination.region}
                        </span>

                        <h1>
                            {destination.name}
                        </h1>

                        <p>
                            📍 {destination.province}
                        </p>

                    </div>
                </div>
            </section>

            {/* ================= CONTENT ================= */}

            <section className="destination-detail-container">

                {/* ================= INTRODUCTION ================= */}

                <div className="destination-detail-intro">

                    <div className="destination-detail-intro-main">

                        <span className="destination-detail-subtitle">
                            KHÁM PHÁ ĐIỂM ĐẾN
                        </span>

                        <h2>
                            Chào mừng đến với{" "}
                            {destination.name}
                        </h2>

                        <p>
                            {destination.introduction}
                        </p>

                    </div>

                    <div className="destination-detail-info">

                        <div className="destination-info-item">
                            <span>📍</span>

                            <div>
                                <small>
                                    Tỉnh / thành
                                </small>

                                <strong>
                                    {destination.province}
                                </strong>
                            </div>
                        </div>

                        <div className="destination-info-item">
                            <span>🗺️</span>

                            <div>
                                <small>
                                    Khu vực
                                </small>

                                <strong>
                                    {destination.region}
                                </strong>
                            </div>
                        </div>

                        <div className="destination-info-item">
                            <span>✈️</span>

                            <div>
                                <small>
                                    Số tour
                                </small>

                                <strong>
                                    {destination.tours} tour
                                </strong>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ================= HIGHLIGHTS ================= */}

                <section className="destination-highlights">

                    <div className="destination-section-heading">

                        <div>
                            <span className="destination-detail-subtitle">
                                TRẢI NGHIỆM
                            </span>

                            <h2>
                                Điểm nổi bật
                            </h2>
                        </div>

                        <p>
                            Những trải nghiệm bạn
                            không nên bỏ lỡ khi đến{" "}
                            {destination.name}.
                        </p>

                    </div>

                    {destination.highlights.length > 0 ? (
                        <div className="destination-highlight-grid">

                            {destination.highlights.map(
                                (highlight, index) => (
                                    <div
                                        className="destination-highlight-card"
                                        key={highlight.id}
                                    >
                                        <span>
                                            {highlight.icon ||
                                                String(
                                                    index + 1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                        </span>

                                        <div>
                                            <h3>
                                                {
                                                    highlight.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    highlight.description
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    ) : (
                        <div className="destination-no-tour">
                            <p>
                                Điểm đến này chưa có
                                thông tin nổi bật.
                            </p>
                        </div>
                    )}

                </section>

                {/* ================= FEATURED TOURS ================= */}

                <section className="destination-tours">

                    <div className="destination-section-heading">

                        <div>
                            <span className="destination-detail-subtitle">
                                GỢI Ý CHO BẠN
                            </span>

                            <h2>
                                Tour nổi bật
                            </h2>
                        </div>

                        <Link
                            to={`/tours?destination=${destination.id}`}
                            className="destination-view-all"
                        >
                            Xem tất cả tour →
                        </Link>

                    </div>

                    {destinationTours.length > 0 ? (

                        <div className="destination-tour-grid">

                            {destinationTours.map(
                                (tour) => (
                                    <article
                                        className="destination-tour-card"
                                        key={tour.id}
                                    >

                                        <Link
                                            to={`/tours/${tour.id}`}
                                            className="destination-tour-image"
                                        >
                                            <img
                                                src={
                                                    tour.image
                                                }
                                                alt={
                                                    tour.name
                                                }
                                            />

                                            <span className="destination-tour-rating">
                                                ★{" "}
                                                {tour.rating > 0
                                                    ? tour.rating
                                                    : "Mới"}
                                            </span>
                                        </Link>

                                        <div className="destination-tour-content">

                                            <small className="destination-tour-location">
                                                📍{" "}
                                                {
                                                    tour.location
                                                }
                                            </small>

                                            <h3>
                                                {tour.name}
                                            </h3>

                                            <p>
                                                ◷{" "}
                                                {
                                                    tour.duration
                                                }
                                            </p>

                                            <div className="destination-tour-bottom">

                                                <div>

                                                    <small>
                                                        Từ
                                                    </small>

                                                    <strong>
                                                        {
                                                            tour.price
                                                        }{" "}
                                                        đ
                                                    </strong>

                                                    <span>
                                                        / người
                                                    </span>

                                                </div>

                                                <Link
                                                    to={`/tours/${tour.id}`}
                                                    className="destination-tour-arrow"
                                                >
                                                    →
                                                </Link>

                                            </div>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>

                    ) : (

                        <div className="destination-no-tour">
                            <p>
                                Hiện chưa có tour nào
                                cho điểm đến này.
                            </p>
                        </div>

                    )}

                </section>

                {/* ================= CTA ================= */}

                <section className="destination-detail-cta">

                    <div>

                        <span>
                            SẴN SÀNG CHO CHUYẾN ĐI?
                        </span>

                        <h2>
                            Khám phá{" "}
                            {destination.name}
                        </h2>

                        <p>
                            Lựa chọn hành trình phù hợp
                            và bắt đầu chuyến đi đáng nhớ
                            của bạn.
                        </p>

                    </div>

                    <Link
                        to={`/tours?destination=${destination.id}`}
                        className="destination-cta-button"
                    >
                        Xem tất cả tour →
                    </Link>

                </section>

            </section>

        </div>
    );
}

export default DestinationDetail;