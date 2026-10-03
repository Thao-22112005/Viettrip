import { useEffect, useMemo, useState } from "react";

import api from "../../../services/api";
import "./TourManagement.css";

function TourManagement() {
    // =====================================================
    // DATA
    // =====================================================

    const [tours, setTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [destinations, setDestinations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] =
        useState(false);

    // Gallery
    const [galleryImages, setGalleryImages] =
        useState([]);
    const [loadingGallery, setLoadingGallery] =
        useState(false);
    const [uploadingGallery, setUploadingGallery] =
        useState(false);

    const [error, setError] = useState("");

    // =====================================================
    // FILTER
    // =====================================================

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] =
        useState("");
    const [destinationFilter, setDestinationFilter] =
        useState("");
    const [statusFilter, setStatusFilter] =
        useState("");

    // =====================================================
    // MODAL
    // =====================================================

    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] =
        useState(false);

    const [editingTour, setEditingTour] =
        useState(null);

    const [selectedTour, setSelectedTour] =
        useState(null);

    // =====================================================
    // FORM
    // =====================================================

    const emptyForm = {
        name: "",
        categoryId: "",
        destinationId: "",
        description: "",
        departure: "",
        transport: "",
        durationDays: "",
        durationNights: "",
        price: "",
        maxPeople: "",
        status: "Đang hoạt động",
        coverImage: null,
        coverPublicId: "",
        gallery: [],
    };

    const [formData, setFormData] =
        useState(emptyForm);

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                toursResponse,
                categoriesResponse,
                destinationsResponse,
            ] = await Promise.all([
                api.get("/api/Tours"),
                api.get("/api/Categories"),
                api.get("/api/Destinations"),
            ]);

            const toursData =
                Array.isArray(toursResponse.data)
                    ? toursResponse.data
                    : toursResponse.data?.items ||
                    toursResponse.data?.data ||
                    [];

            const categoriesData =
                Array.isArray(
                    categoriesResponse.data
                )
                    ? categoriesResponse.data
                    : categoriesResponse.data?.items ||
                    categoriesResponse.data?.data ||
                    [];

            const destinationsData =
                Array.isArray(
                    destinationsResponse.data
                )
                    ? destinationsResponse.data
                    : destinationsResponse.data?.items ||
                    destinationsResponse.data?.data ||
                    [];

            setTours(toursData);
            setCategories(categoriesData);
            setDestinations(destinationsData);
        } catch (err) {
            console.error(
                "Lỗi tải dữ liệu Tour:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Không thể tải dữ liệu Tour."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD GALLERY
    // =====================================================

    const loadGallery = async (tourId) => {
        if (!tourId) {
            setGalleryImages([]);
            return;
        }

        try {
            setLoadingGallery(true);

            const response = await api.get(
                `/api/TourImages/tour/${tourId}`
            );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.items ||
                    response.data?.data ||
                    [];

            setGalleryImages(data);
        } catch (err) {
            console.error(
                "Lỗi tải Gallery:",
                err
            );

            setGalleryImages([]);
        } finally {
            setLoadingGallery(false);
        }
    };

    // =====================================================
    // HELPER
    // =====================================================

    const getCategoryName = (categoryId) => {
        const category = categories.find(
            (item) =>
                Number(item.id) ===
                Number(categoryId)
        );

        return (
            category?.name ||
            "Không xác định"
        );
    };

    const getDestinationName = (
        destinationId
    ) => {
        const destination =
            destinations.find(
                (item) =>
                    Number(item.id) ===
                    Number(destinationId)
            );

        return (
            destination?.name ||
            "Không xác định"
        );
    };

    const getTourStatus = (tour) => {
        return tour.isActive
            ? "Đang hoạt động"
            : "Tạm dừng";
    };

    const formatPrice = (price) => {
        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {
            return "--";
        }

        return (
            Number(price).toLocaleString(
                "vi-VN"
            ) + " đ"
        );
    };

    // =====================================================
    // FILTER
    // =====================================================

    const filteredTours = useMemo(() => {
        return tours.filter((tour) => {
            const categoryName =
                getCategoryName(
                    tour.categoryId
                );

            const destinationName =
                getDestinationName(
                    tour.destinationId
                );

            const status =
                getTourStatus(tour);

            const keyword =
                search
                    .trim()
                    .toLowerCase();

            const matchSearch =
                !keyword ||
                (tour.name || "")
                    .toLowerCase()
                    .includes(keyword);

            const matchCategory =
                !categoryFilter ||
                categoryName ===
                categoryFilter;

            const matchDestination =
                !destinationFilter ||
                destinationName ===
                destinationFilter;

            const matchStatus =
                !statusFilter ||
                status === statusFilter;

            return (
                matchSearch &&
                matchCategory &&
                matchDestination &&
                matchStatus
            );
        });
    }, [
        tours,
        categories,
        destinations,
        search,
        categoryFilter,
        destinationFilter,
        statusFilter,
    ]);

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalTours = tours.length;

    const activeTours = tours.filter(
        (tour) => tour.isActive
    ).length;

    const pausedTours = tours.filter(
        (tour) => !tour.isActive
    ).length;

    // Chưa xử lý Schedule ở phần này
    const soldOutTours = 0;

    // =====================================================
    // OPEN ADD
    // =====================================================

    const openAddModal = () => {
        setEditingTour(null);

        setFormData({
            ...emptyForm,
        });

        setGalleryImages([]);
        setError("");
        setShowModal(true);
    };

    // =====================================================
    // OPEN EDIT
    // =====================================================

    const openEditModal = async (tour) => {
        setEditingTour(tour);

        setFormData({
            name: tour.name || "",

            categoryId:
                tour.categoryId || "",

            destinationId:
                tour.destinationId || "",

            description:
                tour.description || "",

            departure:
                tour.departure || "",

            transport:
                tour.transport || "",

            durationDays:
                tour.durationDays || "",

            durationNights:
                tour.durationNights || "",

            price:
                tour.price ?? "",

            maxPeople:
                tour.maxPeople || "",

            status: tour.isActive
                ? "Đang hoạt động"
                : "Tạm dừng",

            coverImage:
                tour.coverImageUrl || null,

            coverPublicId: "",

            gallery: [],
        });

        setError("");
        setGalleryImages([]);
        setShowModal(true);

        // Load Gallery thật từ API
        await loadGallery(tour.id);
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {
        if (
            saving ||
            uploadingCover ||
            uploadingGallery
        ) {
            return;
        }

        setShowModal(false);
        setEditingTour(null);

        setFormData({
            ...emptyForm,
        });

        setGalleryImages([]);
        setError("");
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // UPLOAD COVER
    // =====================================================

    const handleCoverChange = async (
        e
    ) => {
        const file =
            e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            alert(
                "Chỉ hỗ trợ JPG, PNG và WEBP."
            );

            e.target.value = "";
            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            alert(
                "Ảnh không được vượt quá 5 MB."
            );

            e.target.value = "";
            return;
        }

        try {
            setUploadingCover(true);
            setError("");

            const uploadData =
                new FormData();

            uploadData.append(
                "file",
                file
            );

            const response =
                await api.post(
                    "/api/Media/upload?folder=viettrip/tours/covers",
                    uploadData
                );

            const imageUrl =
                response.data?.url;

            const publicId =
                response.data?.publicId;

            if (!imageUrl) {
                throw new Error(
                    "Không nhận được URL ảnh từ Media Service."
                );
            }

            setFormData((prev) => ({
                ...prev,

                coverImage:
                    imageUrl,

                coverPublicId:
                    publicId || "",
            }));
        } catch (err) {
            console.error(
                "Upload cover error:",
                err
            );

            const message =
                err.response?.data
                    ?.message ||
                err.response?.data
                    ?.title ||
                err.message ||
                "Upload ảnh thất bại.";

            alert(message);
        } finally {
            setUploadingCover(false);
            e.target.value = "";
        }
    };

    // =====================================================
    // REMOVE COVER
    // =====================================================

    const removeCoverImage = () => {
        setFormData((prev) => ({
            ...prev,
            coverImage: null,
            coverPublicId: "",
        }));
    };

    // =====================================================
    // UPLOAD GALLERY
    // =====================================================

    const handleGalleryUpload = async (
        e
    ) => {
        const files = Array.from(
            e.target.files || []
        );

        if (
            !editingTour ||
            !editingTour.id ||
            files.length === 0
        ) {
            if (!editingTour) {
                alert(
                    "Vui lòng tạo Tour trước, sau đó mở Sửa Tour để thêm Gallery."
                );
            }

            e.target.value = "";
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        try {
            setUploadingGallery(true);
            setError("");

            let nextDisplayOrder =
                galleryImages.length;

            let successCount = 0;

            for (const file of files) {
                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {
                    alert(
                        `Ảnh "${file.name}" không đúng định dạng.`
                    );
                    continue;
                }

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {
                    alert(
                        `Ảnh "${file.name}" vượt quá 5 MB.`
                    );
                    continue;
                }

                const uploadData =
                    new FormData();

                uploadData.append(
                    "file",
                    file
                );

                // Backend dùng [FromForm]
                uploadData.append(
                    "displayOrder",
                    String(
                        nextDisplayOrder
                    )
                );

                await api.post(
                    `/api/TourImages/upload/${editingTour.id}`,
                    uploadData
                );

                nextDisplayOrder++;
                successCount++;
            }

            await loadGallery(
                editingTour.id
            );

            if (successCount > 0) {
                alert(
                    `Đã upload ${successCount} ảnh Gallery thành công.`
                );
            }
        } catch (err) {
            console.error(
                "Upload Gallery error:",
                err
            );

            const message =
                err.response?.data
                    ?.message ||
                err.response?.data
                    ?.title ||
                err.message ||
                "Upload Gallery thất bại.";

            alert(message);

            // Load lại những ảnh đã upload thành công
            if (editingTour?.id) {
                await loadGallery(
                    editingTour.id
                );
            }
        } finally {
            setUploadingGallery(false);
            e.target.value = "";
        }
    };

    // =====================================================
    // DELETE GALLERY
    // =====================================================

    const handleDeleteGalleryImage =
        async (image) => {
            if (!image?.id) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn xóa ảnh Gallery này không?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await api.delete(
                    `/api/TourImages/${image.id}`
                );

                alert(
                    "Xóa ảnh Gallery thành công."
                );

                if (editingTour?.id) {
                    await loadGallery(
                        editingTour.id
                    );
                }

                if (selectedTour?.id) {
                    await loadGallery(
                        selectedTour.id
                    );
                }
            } catch (err) {
                console.error(
                    "Delete Gallery error:",
                    err
                );

                const message =
                    err.response?.data
                        ?.message ||
                    err.response?.data
                        ?.title ||
                    "Không thể xóa ảnh Gallery.";

                alert(message);
            }
        };

    // =====================================================
    // OLD LOCAL GALLERY FUNCTIONS
    // Giữ lại formData.gallery để không phá cấu trúc cũ
    // =====================================================

    const handleGalleryChange = (
        e
    ) => {
        const files = Array.from(
            e.target.files || []
        );

        if (files.length === 0) {
            return;
        }

        const newImages =
            files.map((file) =>
                URL.createObjectURL(
                    file
                )
            );

        setFormData((prev) => ({
            ...prev,

            gallery: [
                ...prev.gallery,
                ...newImages,
            ],
        }));

        e.target.value = "";
    };

    const removeGalleryImage = (
        index
    ) => {
        setFormData((prev) => ({
            ...prev,

            gallery:
                prev.gallery.filter(
                    (_, imageIndex) =>
                        imageIndex !==
                        index
                ),
        }));
    };

    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm = () => {
        if (
            !formData.name.trim()
        ) {
            alert(
                "Vui lòng nhập tên Tour."
            );
            return false;
        }

        if (
            !formData.categoryId
        ) {
            alert(
                "Vui lòng chọn Category."
            );
            return false;
        }

        if (
            !formData.destinationId
        ) {
            alert(
                "Vui lòng chọn điểm đến."
            );
            return false;
        }

        if (
            formData.price === "" ||
            Number(formData.price) < 0
        ) {
            alert(
                "Vui lòng nhập giá Tour hợp lệ."
            );
            return false;
        }

        if (
            !formData.maxPeople ||
            Number(formData.maxPeople) < 1
        ) {
            alert(
                "Vui lòng nhập tổng số chỗ."
            );
            return false;
        }

        if (
            !formData.durationDays ||
            Number(
                formData.durationDays
            ) < 1
        ) {
            alert(
                "Vui lòng nhập số ngày Tour."
            );
            return false;
        }

        if (
            formData.durationNights ===
            "" ||
            Number(
                formData.durationNights
            ) < 0
        ) {
            alert(
                "Vui lòng nhập số đêm Tour."
            );
            return false;
        }

        if (!formData.coverImage) {
            alert(
                "Vui lòng chọn ảnh Cover."
            );
            return false;
        }

        return true;
    };

    // =====================================================
    // CREATE / UPDATE TOUR
    // =====================================================

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                name:
                    formData.name.trim(),

                description:
                    formData.description.trim() ||
                    null,

                categoryId:
                    Number(
                        formData.categoryId
                    ),

                destinationId:
                    Number(
                        formData.destinationId
                    ),

                departure:
                    formData.departure.trim() ||
                    null,

                transport:
                    formData.transport.trim() ||
                    null,

                durationDays:
                    Number(
                        formData.durationDays
                    ),

                durationNights:
                    Number(
                        formData.durationNights
                    ),

                price:
                    Number(
                        formData.price
                    ),

                maxPeople:
                    Number(
                        formData.maxPeople
                    ),

                coverImageUrl:
                    formData.coverImage,

                isActive:
                    formData.status ===
                    "Đang hoạt động",
            };

            console.log(
                "Tour payload:",
                payload
            );

            if (editingTour) {
                await api.put(
                    `/api/Tours/${editingTour.id}`,
                    payload
                );

                alert(
                    "Cập nhật Tour thành công."
                );
            } else {
                await api.post(
                    "/api/Tours",
                    payload
                );

                alert(
                    "Thêm Tour thành công."
                );
            }

            await loadData();

            closeModal();
        } catch (err) {
            console.error(
                "Save Tour error:",
                err
            );

            const message =
                err.response?.data
                    ?.message ||
                err.response?.data
                    ?.title ||
                (err.response?.data
                    ?.errors
                    ? JSON.stringify(
                        err.response
                            .data.errors
                    )
                    : "Không thể lưu Tour.");

            setError(message);
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE TOUR
    // =====================================================

    const handleDelete = async (
        id
    ) => {
        const tour = tours.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );

        if (!tour) {
            return;
        }

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn xóa tour "${tour.name}" không?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/api/Tours/${id}`
            );

            alert(
                "Xóa Tour thành công."
            );

            await loadData();
        } catch (err) {
            console.error(
                "Delete Tour error:",
                err
            );

            const message =
                err.response?.data
                    ?.message ||
                err.response?.data
                    ?.title ||
                "Không thể xóa Tour.";

            alert(message);
            setError(message);
        }
    };

    // =====================================================
    // DETAIL
    // =====================================================

    const openDetail = async (
        tour
    ) => {
        setSelectedTour(tour);
        setGalleryImages([]);
        setShowDetail(true);

        await loadGallery(
            tour.id
        );
    };

    const closeDetail = () => {
        setShowDetail(false);
        setSelectedTour(null);
        setGalleryImages([]);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="tour-management">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">
                <div>
                    <h2>
                        Quản lý Tour
                    </h2>

                    <p>
                        Quản lý danh sách
                        các tour du lịch
                        của VietTrip
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={
                        openAddModal
                    }
                >
                    <span>＋</span>
                    Thêm Tour
                </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div
                    style={{
                        marginBottom:
                            "16px",
                        padding:
                            "12px 16px",
                        borderRadius:
                            "8px",
                        background:
                            "#fee2e2",
                        color:
                            "#b91c1c",
                    }}
                >
                    {error}
                </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="tour-summary">
                <div className="summary-card">
                    <div className="summary-icon blue">
                        ✈
                    </div>

                    <div>
                        <span>
                            Tổng Tour
                        </span>

                        <strong>
                            {totalTours}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon green">
                        ✓
                    </div>

                    <div>
                        <span>
                            Đang hoạt động
                        </span>

                        <strong>
                            {activeTours}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon orange">
                        ⏸
                    </div>

                    <div>
                        <span>
                            Tạm dừng
                        </span>

                        <strong>
                            {pausedTours}
                        </strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon red">
                        !
                    </div>

                    <div>
                        <span>
                            Hết chỗ
                        </span>

                        <strong>
                            {soldOutTours}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="tour-filter">
                <div className="search-box">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm kiếm tour..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />
                </div>

                <select
                    value={
                        categoryFilter
                    }
                    onChange={(e) =>
                        setCategoryFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Tất cả Category
                    </option>

                    {categories.map(
                        (category) => (
                            <option
                                key={
                                    category.id
                                }
                                value={
                                    category.name
                                }
                            >
                                {
                                    category.name
                                }
                            </option>
                        )
                    )}
                </select>

                <select
                    value={
                        destinationFilter
                    }
                    onChange={(e) =>
                        setDestinationFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Tất cả điểm đến
                    </option>

                    {destinations.map(
                        (
                            destination
                        ) => (
                            <option
                                key={
                                    destination.id
                                }
                                value={
                                    destination.name
                                }
                            >
                                {
                                    destination.name
                                }
                            </option>
                        )
                    )}
                </select>

                <select
                    value={
                        statusFilter
                    }
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Tất cả trạng thái
                    </option>

                    <option value="Đang hoạt động">
                        Đang hoạt động
                    </option>

                    <option value="Tạm dừng">
                        Tạm dừng
                    </option>
                </select>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="tour-table-card">
                <div className="table-header">
                    <div>
                        <h3>
                            Danh sách Tour
                        </h3>

                        <span>
                            {loading
                                ? "Đang tải..."
                                : `Hiển thị ${filteredTours.length} tour`}
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="tour-table">
                        <thead>
                            <tr>
                                <th>
                                    Tour
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Điểm đến
                                </th>

                                <th>
                                    Giá
                                </th>

                                <th>
                                    Chỗ
                                </th>

                                <th>
                                    Trạng thái
                                </th>

                                <th>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        Đang tải
                                        dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredTours.length >
                                0 ? (
                                filteredTours.map(
                                    (
                                        tour
                                    ) => {
                                        const status =
                                            getTourStatus(
                                                tour
                                            );

                                        const totalSlots =
                                            tour.maxPeople ||
                                            0;

                                        const bookedSlots =
                                            0;

                                        const slotPercent =
                                            totalSlots >
                                                0
                                                ? Math.min(
                                                    (bookedSlots /
                                                        totalSlots) *
                                                    100,
                                                    100
                                                )
                                                : 0;

                                        return (
                                            <tr
                                                key={
                                                    tour.id
                                                }
                                            >
                                                <td>
                                                    <div className="tour-info">
                                                        {tour.coverImageUrl ? (
                                                            <img
                                                                src={
                                                                    tour.coverImageUrl
                                                                }
                                                                alt={
                                                                    tour.name
                                                                }
                                                            />
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    borderRadius:
                                                                        "8px",
                                                                    background:
                                                                        "#f1f5f9",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    fontSize:
                                                                        "24px",
                                                                    flexShrink:
                                                                        0,
                                                                }}
                                                            >
                                                                🏞️
                                                            </div>
                                                        )}

                                                        <div>
                                                            <strong>
                                                                {
                                                                    tour.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                ID: #
                                                                {
                                                                    tour.id
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="category-badge">
                                                        {
                                                            getCategoryName(
                                                                tour.categoryId
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        getDestinationName(
                                                            tour.destinationId
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <strong className="price">
                                                        {formatPrice(
                                                            tour.price
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="slot-info">
                                                        <strong>
                                                            {
                                                                bookedSlots
                                                            }
                                                            /
                                                            {
                                                                totalSlots
                                                            }
                                                        </strong>

                                                        <div className="slot-progress">
                                                            <span
                                                                style={{
                                                                    width: `${slotPercent}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${status ===
                                                            "Đang hoạt động"
                                                            ? "active"
                                                            : "paused"
                                                            }`}
                                                    >
                                                        {
                                                            status
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="action-btn view"
                                                            title="Xem"
                                                            onClick={() =>
                                                                openDetail(
                                                                    tour
                                                                )
                                                            }
                                                        >
                                                            👁
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="action-btn edit"
                                                            title="Sửa"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    tour
                                                                )
                                                            }
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="action-btn delete"
                                                            title="Xóa"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    tour.id
                                                                )
                                                            }
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        Không tìm
                                        thấy tour
                                        phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span>
                        Hiển thị{" "}
                        {
                            filteredTours.length
                        }{" "}
                        / {tours.length} tour
                    </span>

                    <div>
                        <button type="button">
                            ‹
                        </button>

                        <button
                            type="button"
                            className="active"
                        >
                            1
                        </button>

                        <button type="button">
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={
                        closeModal
                    }
                >
                    <div
                        className="tour-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="modal-header">
                            <div>
                                <h3>
                                    {editingTour
                                        ? "Sửa Tour"
                                        : "Thêm Tour"}
                                </h3>

                                <p>
                                    {editingTour
                                        ? "Cập nhật thông tin tour"
                                        : "Nhập thông tin tour mới"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving ||
                                    uploadingCover ||
                                    uploadingGallery
                                }
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="tour-form"
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="form-grid">
                                {/* NAME */}

                                <div className="form-group full">
                                    <label>
                                        Tên Tour{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Nhập tên tour"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* CATEGORY */}

                                <div className="form-group">
                                    <label>
                                        Category{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="categoryId"
                                        value={
                                            formData.categoryId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <option value="">
                                            Chọn Category
                                        </option>

                                        {categories.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* DESTINATION */}

                                <div className="form-group">
                                    <label>
                                        Điểm đến{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <select
                                        name="destinationId"
                                        value={
                                            formData.destinationId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <option value="">
                                            Chọn điểm đến
                                        </option>

                                        {destinations.map(
                                            (
                                                destination
                                            ) => (
                                                <option
                                                    key={
                                                        destination.id
                                                    }
                                                    value={
                                                        destination.id
                                                    }
                                                >
                                                    {
                                                        destination.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* PRICE */}

                                <div className="form-group">
                                    <label>
                                        Giá Tour{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        placeholder="VD: 4500000"
                                        value={
                                            formData.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* MAX PEOPLE */}

                                <div className="form-group">
                                    <label>
                                        Tổng số chỗ{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        name="maxPeople"
                                        min="1"
                                        placeholder="VD: 20"
                                        value={
                                            formData.maxPeople
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* DURATION DAYS */}

                                <div className="form-group">
                                    <label>
                                        Số ngày{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        name="durationDays"
                                        min="1"
                                        placeholder="VD: 3"
                                        value={
                                            formData.durationDays
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* DURATION NIGHTS */}

                                <div className="form-group">
                                    <label>
                                        Số đêm{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        name="durationNights"
                                        min="0"
                                        placeholder="VD: 2"
                                        value={
                                            formData.durationNights
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* DEPARTURE */}

                                <div className="form-group">
                                    <label>
                                        Điểm khởi hành
                                    </label>

                                    <input
                                        type="text"
                                        name="departure"
                                        placeholder="VD: Hà Nội"
                                        value={
                                            formData.departure
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* TRANSPORT */}

                                <div className="form-group">
                                    <label>
                                        Phương tiện
                                    </label>

                                    <input
                                        type="text"
                                        name="transport"
                                        placeholder="VD: Ô tô"
                                        value={
                                            formData.transport
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>

                                {/* STATUS */}

                                <div className="form-group">
                                    <label>
                                        Trạng thái
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <option value="Đang hoạt động">
                                            Đang hoạt động
                                        </option>

                                        <option value="Tạm dừng">
                                            Tạm dừng
                                        </option>
                                    </select>
                                </div>

                                {/* COVER */}

                                <div className="form-group full">
                                    <label>
                                        Ảnh đại diện
                                        Tour{" "}
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <label
                                        className="upload-box"
                                        style={{
                                            pointerEvents:
                                                uploadingCover
                                                    ? "none"
                                                    : "auto",
                                            opacity:
                                                uploadingCover
                                                    ? 0.6
                                                    : 1,
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                            onChange={
                                                handleCoverChange
                                            }
                                            disabled={
                                                saving ||
                                                uploadingCover
                                            }
                                        />

                                        <span className="upload-icon">
                                            📷
                                        </span>

                                        <strong>
                                            {uploadingCover
                                                ? "Đang upload ảnh..."
                                                : "Chọn ảnh cover"}
                                        </strong>

                                        <small>
                                            JPG,
                                            PNG,
                                            WEBP -
                                            tối đa
                                            5MB
                                        </small>
                                    </label>

                                    {formData.coverImage && (
                                        <div className="cover-preview">
                                            <img
                                                src={
                                                    formData.coverImage
                                                }
                                                alt="Cover preview"
                                            />

                                            <button
                                                type="button"
                                                onClick={
                                                    removeCoverImage
                                                }
                                                disabled={
                                                    saving ||
                                                    uploadingCover
                                                }
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* =================================================
                                    GALLERY
                                ================================================= */}

                                <div className="form-group full">
                                    <label>
                                        Ảnh Gallery
                                    </label>

                                    {!editingTour ? (
                                        <>
                                            <label
                                                className="upload-box gallery-upload"
                                                style={{
                                                    opacity: 0.6,
                                                    cursor: "not-allowed",
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                                    multiple
                                                    disabled
                                                />

                                                <span className="upload-icon">
                                                    🖼️
                                                </span>

                                                <strong>
                                                    Lưu Tour trước
                                                </strong>

                                                <small>
                                                    Sau khi
                                                    tạo
                                                    Tour,
                                                    mở
                                                    Sửa
                                                    Tour
                                                    để
                                                    thêm
                                                    Gallery
                                                </small>
                                            </label>
                                        </>
                                    ) : (
                                        <>
                                            <label
                                                className="upload-box gallery-upload"
                                                style={{
                                                    pointerEvents:
                                                        uploadingGallery
                                                            ? "none"
                                                            : "auto",
                                                    opacity:
                                                        uploadingGallery
                                                            ? 0.6
                                                            : 1,
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                                    multiple
                                                    onChange={
                                                        handleGalleryUpload
                                                    }
                                                    disabled={
                                                        saving ||
                                                        uploadingGallery
                                                    }
                                                />

                                                <span className="upload-icon">
                                                    🖼️
                                                </span>

                                                <strong>
                                                    {uploadingGallery
                                                        ? "Đang upload Gallery..."
                                                        : "Chọn nhiều ảnh"}
                                                </strong>

                                                <small>
                                                    JPG,
                                                    PNG,
                                                    WEBP -
                                                    tối đa
                                                    5MB /
                                                    ảnh
                                                </small>
                                            </label>

                                            {loadingGallery ? (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "12px",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >
                                                    Đang tải
                                                    Gallery...
                                                </div>
                                            ) : galleryImages.length >
                                                0 ? (
                                                <div className="gallery-preview">
                                                    {galleryImages.map(
                                                        (
                                                            image,
                                                            index
                                                        ) => (
                                                            <div
                                                                className="gallery-preview-item"
                                                                key={
                                                                    image.id
                                                                }
                                                            >
                                                                <img
                                                                    src={
                                                                        image.imageUrl
                                                                    }
                                                                    alt={`Gallery ${index +
                                                                        1
                                                                        }`}
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteGalleryImage(
                                                                            image
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        uploadingGallery ||
                                                                        saving
                                                                    }
                                                                >
                                                                    ×
                                                                </button>

                                                                <span>
                                                                    {
                                                                        index +
                                                                        1
                                                                    }
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "12px",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >
                                                    Tour
                                                    chưa có
                                                    ảnh
                                                    Gallery.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* DESCRIPTION */}

                                <div className="form-group full">
                                    <label>
                                        Mô tả Tour
                                    </label>

                                    <textarea
                                        name="description"
                                        rows="4"
                                        placeholder="Nhập mô tả tour..."
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                </div>
                            </div>

                            {/* FOOTER */}

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving ||
                                        uploadingCover ||
                                        uploadingGallery
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={
                                        saving ||
                                        uploadingCover ||
                                        uploadingGallery
                                    }
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : editingTour
                                            ? "Lưu thay đổi"
                                            : "Thêm Tour"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {showDetail &&
                selectedTour && (
                    <div
                        className="modal-overlay"
                        onMouseDown={
                            closeDetail
                        }
                    >
                        <div
                            className="detail-modal"
                            onMouseDown={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <div className="modal-header">
                                <div>
                                    <h3>
                                        Chi tiết
                                        Tour
                                    </h3>

                                    <p>
                                        Thông tin
                                        chi tiết
                                        của tour
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeDetail
                                    }
                                >
                                    ×
                                </button>
                            </div>

                            <div className="detail-content">
                                {selectedTour.coverImageUrl ? (
                                    <img
                                        src={
                                            selectedTour.coverImageUrl
                                        }
                                        alt={
                                            selectedTour.name
                                        }
                                        className="detail-image"
                                    />
                                ) : (
                                    <div
                                        className="detail-image"
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            background:
                                                "#f1f5f9",
                                            fontSize:
                                                "50px",
                                        }}
                                    >
                                        🏞️
                                    </div>
                                )}

                                <div className="detail-info">
                                    <h2>
                                        {
                                            selectedTour.name
                                        }
                                    </h2>

                                    <div className="detail-grid">
                                        <div>
                                            <span>
                                                Category
                                            </span>

                                            <strong>
                                                {getCategoryName(
                                                    selectedTour.categoryId
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Điểm
                                                đến
                                            </span>

                                            <strong>
                                                {getDestinationName(
                                                    selectedTour.destinationId
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Giá
                                                Tour
                                            </span>

                                            <strong className="price">
                                                {formatPrice(
                                                    selectedTour.price
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Tổng
                                                số
                                                chỗ
                                            </span>

                                            <strong>
                                                {
                                                    selectedTour.maxPeople
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Thời
                                                gian
                                            </span>

                                            <strong>
                                                {selectedTour.durationDays
                                                    ? `${selectedTour.durationDays} ngày ${selectedTour.durationNights || 0} đêm`
                                                    : "--"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Trạng
                                                thái
                                            </span>

                                            <strong>
                                                {getTourStatus(
                                                    selectedTour
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {selectedTour.departure && (
                                        <div className="detail-description">
                                            <span>
                                                Điểm
                                                khởi
                                                hành
                                            </span>

                                            <p>
                                                {
                                                    selectedTour.departure
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {selectedTour.transport && (
                                        <div className="detail-description">
                                            <span>
                                                Phương
                                                tiện
                                            </span>

                                            <p>
                                                {
                                                    selectedTour.transport
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div className="detail-description">
                                        <span>
                                            Mô tả
                                        </span>

                                        <p>
                                            {selectedTour.description ||
                                                "Chưa có mô tả."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                                DETAIL GALLERY
                            ================================================= */}

                            <div className="detail-description">
                                <span>
                                    Ảnh Gallery
                                </span>

                                {loadingGallery ? (
                                    <p>
                                        Đang tải
                                        Gallery...
                                    </p>
                                ) : galleryImages.length >
                                    0 ? (
                                    <div className="detail-gallery">
                                        <div className="gallery-preview">
                                            {galleryImages.map(
                                                (
                                                    image,
                                                    index
                                                ) => (
                                                    <div
                                                        className="gallery-preview-item"
                                                        key={
                                                            image.id
                                                        }
                                                    >
                                                        <img
                                                            src={
                                                                image.imageUrl
                                                            }
                                                            alt={`Gallery ${index +
                                                                1
                                                                }`}
                                                        />

                                                        <span>
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p>
                                        Tour chưa có
                                        ảnh Gallery.
                                    </p>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={
                                        closeDetail
                                    }
                                >
                                    Đóng
                                </button>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={async () => {
                                        const tour =
                                            selectedTour;

                                        closeDetail();

                                        await openEditModal(
                                            tour
                                        );
                                    }}
                                >
                                    ✎ Sửa Tour
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default TourManagement;