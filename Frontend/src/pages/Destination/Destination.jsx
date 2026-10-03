import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import "./Destination.css";

const fallbackImages = {
    "Hạ Long":
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",

    "Ninh Bình":
        "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",

    "Sa Pa":
        "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=1200&q=80",

    "Đà Nẵng":
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",

    "Hội An":
        "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",

    "Nha Trang":
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",

    "Phú Quốc":
        "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80",

    "Đà Lạt":
        "https://images.unsplash.com/photo-1558888494-8f7c9c6b6d7e?auto=format&fit=crop&w=1200&q=80",

    "Vũng Tàu":
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
};

function Destination() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/api/Destinations");

                const data = Array.isArray(response.data)
                    ? response.data
                    : [];

                const mappedDestinations = data
                    .filter((destination) => destination.isActive)
                    .map((destination) => ({
                        id: destination.id,

                        name: destination.name,

                        province:
                            destination.province || destination.name,

                        // Chưa nối Tour Service nên tạm giữ 0.
                        // Sau này sẽ lấy số tour thực tế từ Tour Service.
                        tours: destination.tours ?? 0,

                        // BE đã có Region nên dùng trực tiếp.
                        region:
                            destination.region || "Việt Nam",

                        image:
                            destination.imageUrl ||
                            fallbackImages[destination.name] ||
                            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",

                        // Ưu tiên ShortDescription mới từ BE.
                        description:
                            destination.shortDescription ||
                            destination.description ||
                            "Khám phá vẻ đẹp và những trải nghiệm đặc sắc tại điểm đến này.",
                    }));

                setDestinations(mappedDestinations);
            } catch (err) {
                console.error(
                    "Lỗi lấy danh sách điểm đến:",
                    err
                );

                setError(
                    "Không thể tải danh sách điểm đến."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, []);

    return (
        <div className="destination-page">

            {/* HERO */}
            <section className="destination-hero">
                <div className="destination-hero-overlay"></div>

                <div className="destination-hero-content">
                    <span className="destination-badge">
                        ✦ KHÁM PHÁ VIỆT NAM
                    </span>

                    <h1>
                        Những điểm đến
                        <span> tuyệt vời</span>
                    </h1>

                    <p>
                        Khám phá những vùng đất tuyệt đẹp và lựa chọn
                        hành trình phù hợp cho chuyến đi của bạn.
                    </p>
                </div>
            </section>

            {/* DESTINATION CONTENT */}
            <section className="destination-container">

                <div className="destination-header">
                    <div>
                        <span className="destination-subtitle">
                            ĐIỂM ĐẾN
                        </span>

                        <h2>
                            Khám phá Việt Nam
                        </h2>
                    </div>

                    <p>
                        Từ biển đảo, núi rừng đến những thành phố cổ kính,
                        mỗi điểm đến đều mang một vẻ đẹp riêng.
                    </p>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="destination-empty">
                        <div className="empty-icon">
                            ✦
                        </div>

                        <h3>
                            Đang tải điểm đến...
                        </h3>

                        <p>
                            Vui lòng chờ trong giây lát.
                        </p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="destination-empty">
                        <div className="empty-icon">
                            !
                        </div>

                        <h3>
                            Không thể tải điểm đến
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* EMPTY */}
                {!loading &&
                    !error &&
                    destinations.length === 0 && (
                        <div className="destination-empty">
                            <div className="empty-icon">
                                ✦
                            </div>

                            <h3>
                                Chưa có điểm đến
                            </h3>

                            <p>
                                Hiện chưa có điểm đến nào
                                đang hoạt động.
                            </p>
                        </div>
                    )}

                {/* DESTINATION GRID */}
                {!loading &&
                    !error &&
                    destinations.length > 0 && (
                        <div className="destination-grid">
                            {destinations.map(
                                (destination) => (
                                    <article
                                        className="destination-card"
                                        key={destination.id}
                                    >
                                        <div className="destination-image">

                                            <img
                                                src={destination.image}
                                                alt={destination.name}
                                            />

                                            <span className="destination-region-jj">
                                                {destination.region}
                                            </span>
                                        </div>

                                        <div className="destination-card-content">

                                            <span className="destination-province">
                                                📍{" "}
                                                {destination.province}
                                            </span>

                                            <h3>
                                                {destination.name}
                                            </h3>

                                            <p>
                                                {destination.description}
                                            </p>

                                            <div className="destination-card-bottom">

                                                <span className="destination-tour-count">
                                                    {destination.tours} tour
                                                </span>

                                                <Link
                                                    to={`/destinations/${destination.id}`}
                                                    className="destination-link"
                                                >
                                                    Khám phá →
                                                </Link>

                                            </div>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
            </section>
        </div>
    );
}

export default Destination;