import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import "./Home.css";

function Home() {
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(true);

    const [destinations, setDestinations] = useState([]);
    const [destinationLoading, setDestinationLoading] = useState(true);

    const [featuredTours, setFeaturedTours] = useState([]);
    const [tourLoading, setTourLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/api/Categories");

                const activeCategories = Array.isArray(response.data)
                    ? response.data.filter(
                        (category) => category.isActive
                    )
                    : [];

                setCategories(activeCategories);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            } finally {
                setCategoryLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const response = await api.get("/api/Destinations");

                const activeDestinations = Array.isArray(response.data)
                    ? response.data.filter(
                        (destination) => destination.isActive
                    )
                    : [];

                setDestinations(activeDestinations);
            } catch (error) {
                console.error("Lỗi khi lấy điểm đến:", error);
            } finally {
                setDestinationLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    // ================= TOUR NỔI BẬT =================
    useEffect(() => {
        const fetchFeaturedTours = async () => {
            try {
                setTourLoading(true);

                const [
                    toursResponse,
                    destinationsResponse,
                    reviewsResponse,
                ] = await Promise.all([
                    api.get("/api/Tours"),
                    api.get("/api/Destinations"),
                    api.get("/api/Reviews/tour-summary"),
                ]);

                const tours = Array.isArray(toursResponse.data)
                    ? toursResponse.data
                    : [];

                const destinationData = Array.isArray(
                    destinationsResponse.data
                )
                    ? destinationsResponse.data
                    : [];

                const reviewData = Array.isArray(reviewsResponse.data)
                    ? reviewsResponse.data
                    : [];

                const activeTours = tours
                    .filter((tour) => tour.isActive)
                    .map((tour) => {
                        const destination = destinationData.find(
                            (item) =>
                                item.id === tour.destinationId
                        );

                        const reviewSummary = reviewData.find(
                            (item) =>
                                item.tourId === tour.id
                        );

                        return {
                            id: tour.id,
                            title: tour.name,

                            location:
                                destination?.province ||
                                destination?.name ||
                                "Việt Nam",

                            duration:
                                tour.durationNights > 0
                                    ? `${tour.durationDays} ngày ${tour.durationNights} đêm`
                                    : `${tour.durationDays} ngày`,

                            price: new Intl.NumberFormat(
                                "vi-VN"
                            ).format(tour.price) + "đ",

                            image:
                                tour.coverImageUrl ||
                                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80",

                            rating:
                                reviewSummary?.averageRating ?? 0,

                            reviewCount:
                                reviewSummary?.reviewCount ?? 0,
                        };
                    });

                // Lấy tối đa 4 tour nổi bật
                setFeaturedTours(activeTours.slice(0, 4));
            } catch (error) {
                console.error(
                    "Lỗi khi lấy tour nổi bật:",
                    error
                );
                setFeaturedTours([]);
            } finally {
                setTourLoading(false);
            }
        };

        fetchFeaturedTours();
    }, []);

    return (
        <div className="home-h">
            {/* ================= HERO ================= */}
            <section className="hero-h">
                <div className="hero-overlay-h"></div>

                <div className="hero-content-h">
                    <span className="hero-subtitle-h">
                        ✦ KHÁM PHÁ VIỆT NAM
                    </span>

                    <h1>
                        Mỗi hành trình
                        <br />
                        là một{" "}
                        <span
                            style={{
                                color: "#35d0c8",
                            }}
                        >
                            câu chuyện
                        </span>
                    </h1>

                    <p>
                        Khám phá những điểm đến tuyệt đẹp và tạo nên
                        những kỷ niệm đáng nhớ cùng VietTrip.
                    </p>

                    <div className="search-box-h">
                        <div className="search-input-h">
                            <span>📍</span>

                            <input
                                type="text"
                                placeholder="Bạn muốn đi đâu?"
                            />
                        </div>

                        <button className="search-button-h">
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= TOUR NỔI BẬT ================= */}
            <section className="section-h">
                <div className="section-header-h">
                    <div>
                        <span className="section-subtitle-h">
                            GỢI Ý CHO BẠN
                        </span>

                        <h2>Tour nổi bật</h2>

                        <p>
                            Những hành trình được nhiều du khách
                            lựa chọn
                        </p>
                    </div>

                    <Link
                        to="/tours"
                        className="view-all-h"
                    >
                        Xem tất cả →
                    </Link>
                </div>

                {tourLoading ? (
                    <div className="category-message-h">
                        Đang tải tour...
                    </div>
                ) : featuredTours.length === 0 ? (
                    <div className="category-message-h">
                        Hiện chưa có tour nào.
                    </div>
                ) : (
                    <div className="tour-grid-user-h">
                        {featuredTours.map((tour) => (
                            <Link
                                to={`/tours/${tour.id}`}
                                className="tour-card-user-h"
                                key={tour.id}
                            >
                                <div className="tour-image-wrapper-user-h">
                                    <img
                                        src={tour.image}
                                        alt={tour.title}
                                        className="tour-image-user-h"
                                    />

                                    <span className="tour-rating-user-h">
                                        ⭐{" "}
                                        {tour.rating > 0
                                            ? tour.rating
                                            : "Mới"}
                                    </span>
                                </div>

                                <div className="tour-info-user-h">
                                    <span className="tour-location-user-h">
                                        📍 {tour.location}
                                    </span>

                                    <h3>{tour.title}</h3>

                                    <div className="tour-duration-user-h">
                                        🕐 {tour.duration}
                                    </div>

                                    <div className="tour-bottom-user-h">
                                        <div className="tour-price-wrapper-user-h">
                                            <span className="price-label-user-h">
                                                Từ
                                            </span>

                                            <div className="tour-price-user-h">
                                                {tour.price}
                                            </div>
                                        </div>

                                        <span className="tour-arrow-user-h">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ================= DANH MỤC ================= */}
            <section className="category-section-h">
                <div className="section-header-h">
                    <div>
                        <span className="section-subtitle-h">
                            KHÁM PHÁ THEO SỞ THÍCH
                        </span>

                        <h2>Danh mục nổi bật</h2>

                        <p>
                            Lựa chọn hành trình phù hợp với sở thích
                            của bạn
                        </p>
                    </div>
                </div>

                {categoryLoading ? (
                    <div className="category-message-h">
                        Đang tải danh mục...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="category-message-h">
                        Hiện chưa có danh mục nào.
                    </div>
                ) : (
                    <div className="category-grid-h">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/tours?categoryId=${category.id}`}
                                className="category-card-h"
                            >
                                <div className="category-icon-h">
                                    {category.imageUrl ? (
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                        />
                                    ) : (
                                        "🌊"
                                    )}
                                </div>

                                <div className="category-info-h">
                                    <h3>{category.name}</h3>

                                    <p>
                                        {category.description ||
                                            "Khám phá những hành trình thú vị."}
                                    </p>

                                    <span>
                                        Xem tour →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ================= ĐIỂM ĐẾN ================= */}
            <section className="destination-section-h">
                <div className="section-header-h">
                    <div>
                        <span className="section-subtitle-h">
                            ĐIỂM ĐẾN YÊU THÍCH
                        </span>

                        <h2>Điểm đến nổi bật</h2>

                        <p>
                            Những địa điểm tuyệt đẹp đang chờ bạn
                            khám phá
                        </p>
                    </div>

                    <Link
                        to="/destinations"
                        className="view-all-h"
                    >
                        Xem tất cả →
                    </Link>
                </div>

                {destinationLoading ? (
                    <div className="destination-message-h">
                        Đang tải điểm đến...
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="destination-message-h">
                        Hiện chưa có điểm đến nào.
                    </div>
                ) : (
                    <div className="destination-grid-h">
                        {destinations.map((destination) => (
                            <Link
                                to={`/destinations/${destination.id}`}
                                className="destination-card-h"
                                key={destination.id}
                            >
                                <img
                                    src={
                                        destination.imageUrl ||
                                        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
                                    }
                                    alt={destination.name}
                                />

                                <div className="destination-overlay-h">
                                    <div className="destination-name-h">
                                        <span>
                                            📍{" "}
                                            {destination.province ||
                                                destination.name}
                                        </span>

                                        <h3>
                                            Khám phá{" "}
                                            {destination.name}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ================= CTA ================= */}
            <section className="home-cta-h">
                <div>
                    <h2>
                        Bắt đầu chuyến đi đáng nhớ
                        <br />
                        của bạn ngay hôm nay
                    </h2>
                </div>

                <Link
                    to="/tours"
                    className="cta-button-user-h"
                >
                    Khám phá tour
                </Link>
            </section>
        </div>
    );
}

export default Home;