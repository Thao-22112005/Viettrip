
import { useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import api from "../../services/api";

import "./TourList.css";

const fallbackImage =
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80";

const destinations = [
    "Tất cả",
    "Miền Bắc",
    "Miền Trung",
    "Miền Nam",
];

function TourList() {
    // =========================
    // GET CATEGORY ID FROM URL
    // =========================

    const [searchParams] = useSearchParams();

    const categoryId = searchParams.get("categoryId");

    const [tours, setTours] = useState([]);

    const [selectedDestination, setSelectedDestination] =
        useState("Tất cả");

    const [selectedDuration, setSelectedDuration] =
        useState("Tất cả");

    const [selectedPrice, setSelectedPrice] =
        useState("Tất cả");

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // =========================
    // GET TOUR + DESTINATION + REVIEW
    // =========================

    useEffect(() => {
        const fetchTourData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    toursResponse,
                    destinationsResponse,
                    reviewsResponse,
                ] = await Promise.all([
                    api.get("/api/Tours"),
                    api.get("/api/Destinations"),
                    api.get("/api/Reviews/tour-summary"),
                ]);

                const toursData = Array.isArray(toursResponse.data)
                    ? toursResponse.data
                    : [];

                const destinationsData = Array.isArray(
                    destinationsResponse.data
                )
                    ? destinationsResponse.data
                    : [];

                const reviewsData = Array.isArray(
                    reviewsResponse.data
                )
                    ? reviewsResponse.data
                    : [];

                // =========================
                // MAP DATA
                // =========================

                const mappedTours = toursData
                    .filter((tour) => tour.isActive)
                    .map((tour) => {
                        const destination =
                            destinationsData.find(
                                (item) =>
                                    item.id === tour.destinationId
                            );

                        const reviewSummary =
                            reviewsData.find(
                                (item) =>
                                    item.tourId === tour.id
                            );

                        return {
                            id: tour.id,

                            // CATEGORY
                            categoryId: tour.categoryId,

                            name: tour.name,

                            location:
                                destination?.province ||
                                destination?.name ||
                                "Việt Nam",

                            region:
                                destination?.region || "",

                            durationDays:
                                Number(tour.durationDays) || 0,

                            durationNights:
                                Number(tour.durationNights) || 0,

                            duration:
                                `${tour.durationDays} ngày ${tour.durationNights} đêm`,

                            price:
                                Number(tour.price) || 0,

                            rating:
                                reviewSummary?.averageRating ??
                                null,

                            reviews:
                                reviewSummary?.reviewCount ??
                                0,

                            image:
                                tour.coverImageUrl ||
                                fallbackImage,
                        };
                    });

                setTours(mappedTours);
            } catch (err) {
                console.error(
                    "Lỗi lấy dữ liệu Tour List:",
                    err
                );

                setError(
                    "Không thể tải danh sách tour."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTourData();
    }, []);

    // =========================
    // FILTER TOUR
    // =========================

    const filteredTours = tours.filter((tour) => {
        const keyword = search.toLowerCase().trim();

        // =========================
        // CATEGORY
        // =========================

        const matchCategory =
            !categoryId ||
            Number(tour.categoryId) === Number(categoryId);

        // =========================
        // SEARCH
        // =========================

        const matchSearch =
            tour.name
                .toLowerCase()
                .includes(keyword) ||
            tour.location
                .toLowerCase()
                .includes(keyword);

        // =========================
        // DESTINATION / REGION
        // =========================

        let matchDestination = true;

        if (selectedDestination !== "Tất cả") {
            matchDestination =
                tour.region === selectedDestination;
        }

        // =========================
        // DURATION
        // =========================

        let matchDuration = true;

        if (selectedDuration === "1-2 ngày") {
            matchDuration =
                tour.durationDays >= 1 &&
                tour.durationDays <= 2;
        }

        if (selectedDuration === "3-4 ngày") {
            matchDuration =
                tour.durationDays >= 3 &&
                tour.durationDays <= 4;
        }

        // =========================
        // PRICE
        // =========================

        let matchPrice = true;

        if (selectedPrice === "Dưới 2 triệu") {
            matchPrice = tour.price < 2000000;
        }

        if (selectedPrice === "2 - 4 triệu") {
            matchPrice =
                tour.price >= 2000000 &&
                tour.price <= 4000000;
        }

        if (selectedPrice === "Trên 4 triệu") {
            matchPrice = tour.price > 4000000;
        }

        return (
            matchCategory &&
            matchSearch &&
            matchDestination &&
            matchDuration &&
            matchPrice
        );
    });

    return (
        <div className="tour-list-page">
            {/* =========================
                PAGE HERO
            ========================= */}

            <section className="tour-list-hero">
                <div className="tour-list-hero-overlay"></div>

                <div className="tour-list-hero-content">
                    <span className="tour-list-badge">
                        ✦ KHÁM PHÁ VIỆT NAM
                    </span>

                    <h1>
                        Tìm hành trình
                        <span> phù hợp với bạn</span>
                    </h1>

                    <p>
                        Khám phá những điểm đến tuyệt đẹp và những hành trình
                        đáng nhớ trên khắp Việt Nam.
                    </p>
                </div>
            </section>

            {/* =========================
                MAIN CONTENT
            ========================= */}

            <section className="tour-list-container">
                {/* =========================
                    SEARCH BAR
                ========================= */}

                <div className="tour-search-box">
                    <div className="tour-search-input">
                        <span className="search-symbol">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Tìm kiếm tên tour hoặc điểm đến..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <button className="tour-search-button">
                        Tìm kiếm
                    </button>
                </div>

                {/* =========================
                    CONTENT
                ========================= */}

                <div className="tour-list-layout-user">
                    {/* =========================
                        SIDEBAR
                    ========================= */}

                    <aside className="tour-filter-user">
                        <div className="filter-header-user">
                            <h3>Bộ lọc</h3>

                            <button
                                onClick={() => {
                                    setSelectedDestination(
                                        "Tất cả"
                                    );

                                    setSelectedDuration(
                                        "Tất cả"
                                    );

                                    setSelectedPrice(
                                        "Tất cả"
                                    );

                                    setSearch("");
                                }}
                            >
                                Xóa lọc
                            </button>
                        </div>

                        {/* =========================
                            DESTINATION
                        ========================= */}

                        <div className="filter-group-user">
                            <h4>Điểm đến</h4>

                            {destinations.map(
                                (destination) => (
                                    <label
                                        className="filter-option-user"
                                        key={destination}
                                    >
                                        <input
                                            type="radio"
                                            name="destination"
                                            checked={
                                                selectedDestination ===
                                                destination
                                            }
                                            onChange={() =>
                                                setSelectedDestination(
                                                    destination
                                                )
                                            }
                                        />

                                        <span>
                                            {destination}
                                        </span>
                                    </label>
                                )
                            )}
                        </div>

                        {/* =========================
                            PRICE
                        ========================= */}

                        <div className="filter-group-user">
                            <h4>Khoảng giá</h4>

                            {[
                                "Tất cả",
                                "Dưới 2 triệu",
                                "2 - 4 triệu",
                                "Trên 4 triệu",
                            ].map((price) => (
                                <label
                                    className="filter-option-user"
                                    key={price}
                                >
                                    <input
                                        type="radio"
                                        name="price"
                                        checked={
                                            selectedPrice ===
                                            price
                                        }
                                        onChange={() =>
                                            setSelectedPrice(
                                                price
                                            )
                                        }
                                    />

                                    <span>
                                        {price}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* =========================
                            DURATION
                        ========================= */}

                        <div className="filter-group-user">
                            <h4>Thời gian</h4>

                            {[
                                "Tất cả",
                                "1-2 ngày",
                                "3-4 ngày",
                            ].map((duration) => (
                                <label
                                    className="filter-option-user"
                                    key={duration}
                                >
                                    <input
                                        type="radio"
                                        name="duration"
                                        checked={
                                            selectedDuration ===
                                            duration
                                        }
                                        onChange={() =>
                                            setSelectedDuration(
                                                duration
                                            )
                                        }
                                    />

                                    <span>
                                        {duration}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </aside>

                    {/* =========================
                        TOUR LIST
                    ========================= */}

                    <div className="tour-results">
                        <div className="tour-results-header">
                            <div>
                                <span className="results-subtitle">
                                    DANH SÁCH TOUR
                                </span>

                                <h2>
                                    Những hành trình dành cho bạn
                                </h2>
                            </div>

                            <span className="tour-count">
                                {loading
                                    ? "Đang tải..."
                                    : `${filteredTours.length} tour`}
                            </span>
                        </div>

                        {/* =========================
                            LOADING
                        ========================= */}

                        {loading ? (
                            <div className="tour-empty">
                                <div className="tour-empty-icon">
                                    ⏳
                                </div>

                                <h3>
                                    Đang tải danh sách tour...
                                </h3>

                                <p>
                                    Vui lòng chờ một chút.
                                </p>
                            </div>
                        ) : error ? (
                            /* =========================
                                ERROR
                            ========================= */

                            <div className="tour-empty">
                                <div className="tour-empty-icon">
                                    ⚠️
                                </div>

                                <h3>{error}</h3>

                                <p>
                                    Vui lòng thử lại sau.
                                </p>
                            </div>
                        ) : filteredTours.length > 0 ? (
                            /* =========================
                                TOUR GRID
                            ========================= */

                            <div className="tour-results-grid">
                                {filteredTours.map(
                                    (tour) => (
                                        <article
                                            className="tour-list-card"
                                            key={tour.id}
                                        >
                                            {/* IMAGE */}

                                            <Link
                                                to={`/tours/${tour.id}`}
                                                className="tour-list-image"
                                            >
                                                <img
                                                    src={
                                                        tour.image
                                                    }
                                                    alt={
                                                        tour.name
                                                    }
                                                />

                                                <div className="tour-list-rating">
                                                    ★{" "}
                                                    {tour.rating !==
                                                        null
                                                        ? tour.rating.toFixed(
                                                            1
                                                        )
                                                        : "Chưa có"}
                                                </div>
                                            </Link>

                                            {/* CONTENT */}

                                            <div className="tour-list-card-content">
                                                <span className="tour-list-location">
                                                    📍{" "}
                                                    {
                                                        tour.location
                                                    }
                                                </span>

                                                <h3>
                                                    {
                                                        tour.name
                                                    }
                                                </h3>

                                                <div className="tour-list-duration">
                                                    ◷{" "}
                                                    {
                                                        tour.duration
                                                    }
                                                </div>

                                                {/* REVIEW COUNT */}

                                                {tour.rating !==
                                                    null && (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                color:
                                                                    "#777",
                                                                marginTop:
                                                                    "6px",
                                                            }}
                                                        >
                                                            {
                                                                tour.reviews
                                                            }{" "}
                                                            đánh giá
                                                        </div>
                                                    )}

                                                {/* BOTTOM */}

                                                <div className="tour-list-card-bottom">
                                                    <div>
                                                        <span className="tour-list-price-label">
                                                            Từ
                                                        </span>

                                                        <strong>
                                                            {tour.price.toLocaleString(
                                                                "vi-VN"
                                                            )}
                                                            đ
                                                        </strong>

                                                        <span className="tour-list-price-unit">
                                                            / người
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={`/tours/${tour.id}`}
                                                        className="tour-list-arrow"
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
                            /* =========================
                                EMPTY
                            ========================= */

                            <div className="tour-empty">
                                <div className="tour-empty-icon">
                                    🔍
                                </div>

                                <h3>
                                    Không tìm thấy tour
                                </h3>

                                <p>
                                    Hãy thử thay đổi từ khóa
                                    hoặc bộ lọc.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default TourList;

