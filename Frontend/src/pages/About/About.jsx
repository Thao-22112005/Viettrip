import { Link } from "react-router-dom";
import "./About.css";

function About() {
    const values = [
        {
            icon: "🗺️",
            title: "Khám phá dễ dàng",
            description:
                "Tìm kiếm và khám phá những điểm đến tuyệt vời trên khắp Việt Nam.",
        },
        {
            icon: "💙",
            title: "Đặt tour thuận tiện",
            description:
                "Quy trình đặt tour đơn giản, nhanh chóng và dễ dàng theo dõi.",
        },
        {
            icon: "🛡️",
            title: "An tâm trải nghiệm",
            description:
                "Thông tin chuyến đi rõ ràng, minh bạch và hỗ trợ khách hàng tận tâm.",
        },
    ];

    const stats = [
        {
            number: "50+",
            label: "Tour du lịch",
        },
        {
            number: "20+",
            label: "Điểm đến",
        },
        {
            number: "1.000+",
            label: "Khách hàng",
        },
        {
            number: "4.9/5",
            label: "Đánh giá",
        },
    ];

    return (
        <div className="about-page">

            {/* =========================================
                HERO
            ========================================= */}

            <section className="about-hero">
                <div className="about-hero-overlay"></div>

                <div className="about-hero-content">

                    <div className="about-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span>›</span>
                        <span>Về chúng tôi</span>
                    </div>

                    <span className="about-label">
                        ✦ Về VietTrip
                    </span>

                    <h1>
                        Cùng VietTrip
                        <br />
                        <span>khám phá Việt Nam</span>
                    </h1>

                    <p>
                        Hành trình đẹp bắt đầu từ một điểm đến.
                        Hãy để VietTrip đồng hành cùng bạn.
                    </p>

                </div>
            </section>

            {/* =========================================
                INTRO
            ========================================= */}

            <section className="about-intro section-container">

                <div className="about-intro-image">
                    <img
                        src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80"
                        alt="Khám phá Việt Nam"
                    />

                    <div className="about-image-card">
                        <strong>VietTrip</strong>
                        <span>
                            Hành trình của bạn, câu chuyện của chúng tôi
                        </span>
                    </div>
                </div>

                <div className="about-intro-content">

                    <span className="section-label">
                        VỀ CHÚNG TÔI
                    </span>

                    <h2>
                        Nền tảng du lịch
                        <span> dành cho người Việt</span>
                    </h2>

                    <p>
                        VietTrip được xây dựng với mong muốn giúp mọi người
                        dễ dàng tìm kiếm, lựa chọn và đặt những chuyến đi
                        phù hợp với mình.
                    </p>

                    <p>
                        Từ những thành phố nhộn nhịp đến những vùng đất
                        bình yên, VietTrip mang đến một không gian để bạn
                        khám phá những điểm đến tuyệt đẹp của Việt Nam.
                    </p>

                    <Link
                        to="/tours"
                        className="about-primary-button"
                    >
                        Khám phá Tour
                        <span>→</span>
                    </Link>

                </div>

            </section>

            {/* =========================================
                STATS
            ========================================= */}

            <section className="about-stats">

                <div className="section-container">

                    <div className="stats-grid">

                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="stat-item"
                            >
                                <strong>{stat.number}</strong>
                                <span>{stat.label}</span>
                            </div>
                        ))}

                    </div>

                </div>

            </section>

            {/* =========================================
                VALUES
            ========================================= */}

            <section className="about-values section-container">

                <div className="section-heading">
                    <span className="section-label">
                        GIÁ TRỊ CỦA VIETTRIP
                    </span>

                    <h2>
                        Điều chúng tôi
                        <span> luôn hướng đến</span>
                    </h2>

                    <p>
                        Mang đến trải nghiệm du lịch đơn giản,
                        thuận tiện và đáng nhớ.
                    </p>
                </div>

                <div className="values-grid">

                    {values.map((value) => (
                        <div
                            key={value.title}
                            className="value-card"
                        >
                            <div className="value-icon">
                                {value.icon}
                            </div>

                            <h3>{value.title}</h3>

                            <p>
                                {value.description}
                            </p>
                        </div>
                    ))}

                </div>

            </section>

            {/* =========================================
                JOURNEY
            ========================================= */}

            <section className="about-journey">

                <div className="section-container">

                    <div className="journey-content">

                        <div>
                            <span className="section-label">
                                HÀNH TRÌNH CỦA BẠN
                            </span>

                            <h2>
                                Từ cảm hứng
                                <span> đến chuyến đi</span>
                            </h2>

                            <p>
                                Chỉ với vài bước đơn giản, bạn đã có thể
                                bắt đầu lên kế hoạch cho hành trình tiếp theo.
                            </p>
                        </div>

                        <div className="journey-steps">

                            <div className="journey-step">
                                <div className="step-number">
                                    01
                                </div>

                                <div>
                                    <h3>Khám phá</h3>
                                    <p>
                                        Tìm kiếm những điểm đến và tour
                                        phù hợp với bạn.
                                    </p>
                                </div>
                            </div>

                            <div className="journey-step">
                                <div className="step-number">
                                    02
                                </div>

                                <div>
                                    <h3>Lựa chọn</h3>
                                    <p>
                                        Xem thông tin chi tiết và lựa chọn
                                        hành trình yêu thích.
                                    </p>
                                </div>
                            </div>

                            <div className="journey-step">
                                <div className="step-number">
                                    03
                                </div>

                                <div>
                                    <h3>Đặt tour</h3>
                                    <p>
                                        Hoàn tất thông tin và đặt chuyến đi
                                        nhanh chóng.
                                    </p>
                                </div>
                            </div>

                            <div className="journey-step">
                                <div className="step-number">
                                    04
                                </div>

                                <div>
                                    <h3>Tận hưởng</h3>
                                    <p>
                                        Bắt đầu hành trình và lưu giữ
                                        những kỷ niệm đáng nhớ.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================
                CTA
            ========================================= */}

            <section className="about-cta">

                <div className="about-cta-content">

                    <span className="about-cta-icon">
                        ✈
                    </span>

                    <h2>
                        Hành trình tiếp theo
                        <br />
                        đang chờ bạn
                    </h2>

                    <p>
                        Khám phá những điểm đến tuyệt vời cùng VietTrip.
                    </p>

                    <Link
                        to="/tours"
                        className="about-cta-button"
                    >
                        Khám phá ngay
                        <span>→</span>
                    </Link>

                </div>

            </section>

        </div>
    );
}

export default About;