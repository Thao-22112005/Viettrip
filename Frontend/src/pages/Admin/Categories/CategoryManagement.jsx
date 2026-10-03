import { useEffect, useState } from "react";

import api from "../../../services/api";

import "./CategoryManagement.css";


function CategoryManagement() {
    const [categories, setCategories] = useState([]);

    const [tours, setTours] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [uploadingImage, setUploadingImage] = useState(false);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);

    const [modalMode, setModalMode] = useState("add");

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [showModal]);

    const [selectedCategory, setSelectedCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
        status: "Active",
    });

    // =========================
    // LOAD DATA
    // =========================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [categoryResponse, tourResponse] =
                await Promise.all([
                    api.get("/api/Categories"),
                    api.get("/api/Tours"),
                ]);

            const categoryData = Array.isArray(
                categoryResponse.data
            )
                ? categoryResponse.data
                : [];

            const tourData = Array.isArray(tourResponse.data)
                ? tourResponse.data
                : [];

            setTours(tourData);

            const mappedCategories = categoryData.map(
                (category) => ({
                    id: category.id,
                    name: category.name || "",
                    description: category.description || "",
                    imageUrl: category.imageUrl || "",
                    tourCount: tourData.filter(
                        (tour) =>
                            Number(tour.categoryId) ===
                            Number(category.id)
                    ).length,
                    status: category.isActive
                        ? "Active"
                        : "Paused",
                    isActive: category.isActive,
                })
            );

            setCategories(mappedCategories);
        } catch (err) {
            console.error(
                "Lỗi tải Category:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách Category."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================
    // FILTER
    // =========================

    const filteredCategories = categories.filter(
        (category) => {
            const keyword =
                searchTerm.toLowerCase().trim();

            const matchesSearch =
                category.name
                    .toLowerCase()
                    .includes(keyword) ||
                category.description
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                category.status === statusFilter;

            return matchesSearch && matchesStatus;
        }
    );

    // =========================
    // SUMMARY
    // =========================

    const totalCategories = categories.length;

    const activeCategories = categories.filter(
        (category) =>
            category.status === "Active"
    ).length;

    const pausedCategories = categories.filter(
        (category) =>
            category.status === "Paused"
    ).length;

    const totalTours = tours.length;

    // =========================
    // ADD
    // =========================

    const handleAdd = () => {
        setModalMode("add");

        setSelectedCategory(null);

        setFormData({
            name: "",
            description: "",
            imageUrl: "",
            status: "Active",
        });

        setShowModal(true);
    };

    // =========================
    // EDIT
    // =========================

    const handleEdit = (category) => {
        setModalMode("edit");

        setSelectedCategory(category);

        setFormData({
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl || "",
            status: category.status,
        });

        setShowModal(true);
    };

    // =========================
    // VIEW
    // =========================

    const handleView = (category) => {
        setModalMode("view");

        setSelectedCategory(category);

        setShowModal(true);
    };

    // =========================
    // UPLOAD IMAGE
    // =========================

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Kiểm tra loại file
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
            e.target.value = "";
            return;
        }

        // Giới hạn 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh không được vượt quá 5MB.");
            e.target.value = "";
            return;
        }

        try {
            setUploadingImage(true);

            const uploadData = new FormData();

            uploadData.append("file", file);

            const response = await api.post(
                "/api/Media/upload?folder=viettrip/categories",
                uploadData,
                {
                    headers: {
                        // Không set Content-Type ở đây.
                        // Browser/Axios sẽ tự tạo multipart/form-data
                        // kèm boundary.
                    },
                }
            );

            const imageUrl = response.data?.url;

            if (!imageUrl) {
                throw new Error(
                    "Không nhận được URL ảnh từ Media Service."
                );
            }

            setFormData((prev) => ({
                ...prev,
                imageUrl,
            }));

            alert("Upload ảnh thành công.");
        } catch (err) {
            console.error(
                "Lỗi upload ảnh Category:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Không thể upload ảnh."
            );
        } finally {
            setUploadingImage(false);

            // Cho phép chọn lại cùng một file
            e.target.value = "";
        }
    };

    // =========================
    // SAVE
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Vui lòng nhập tên Category.");
            return;
        }

        if (!formData.description.trim()) {
            alert("Vui lòng nhập mô tả Category.");
            return;
        }

        // Thêm mới bắt buộc phải có ảnh
        if (
            modalMode === "add" &&
            !formData.imageUrl
        ) {
            alert("Vui lòng chọn ảnh cho Category.");
            return;
        }

        if (uploadingImage) {
            alert(
                "Ảnh đang được upload, vui lòng chờ một chút."
            );

            return;
        }

        try {
            setSaving(true);

            if (modalMode === "add") {
                await api.post(
                    "/api/Categories",
                    {
                        name: formData.name.trim(),

                        description:
                            formData.description.trim(),

                        imageUrl:
                            formData.imageUrl || null,

                        isActive:
                            formData.status ===
                            "Active",
                    }
                );

                alert(
                    "Thêm Category thành công."
                );
            }

            if (modalMode === "edit") {
                await api.put(
                    `/api/Categories/${selectedCategory.id}`,
                    {
                        name: formData.name.trim(),

                        description:
                            formData.description.trim(),

                        imageUrl:
                            formData.imageUrl || null,

                        isActive:
                            formData.status ===
                            "Active",
                    }
                );

                alert(
                    "Cập nhật Category thành công."
                );
            }

            setShowModal(false);

            setSelectedCategory(null);

            await loadData();
        } catch (err) {
            console.error(
                "Lỗi lưu Category:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể lưu Category."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // SOFT DELETE / RESTORE
    // =========================

    const handleToggleStatus = async (
        category
    ) => {
        const isActive =
            category.status === "Active";

        const message = isActive
            ? `Bạn có chắc muốn tạm dừng Category "${category.name}"?`
            : `Bạn có muốn kích hoạt lại Category "${category.name}"?`;

        const confirmed =
            window.confirm(message);

        if (!confirmed) return;

        try {
            await api.put(
                `/api/Categories/${category.id}`,
                {
                    name: category.name,

                    description:
                        category.description,

                    imageUrl:
                        category.imageUrl || null,

                    isActive: !isActive,
                }
            );

            await loadData();
        } catch (err) {
            console.error(
                "Lỗi thay đổi trạng thái Category:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Không thể thay đổi trạng thái Category."
            );
        }
    };

    // =========================
    // CLOSE MODAL
    // =========================

    const closeModal = () => {
        setShowModal(false);

        setSelectedCategory(null);
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="category-page">
                <div
                    style={{
                        padding: "60px",
                        textAlign: "center",
                    }}
                >
                    Đang tải danh sách Category...
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="category-page">
                <div
                    style={{
                        padding: "60px",
                        textAlign: "center",
                    }}
                >
                    <h3>
                        Không thể tải Category
                    </h3>

                    <p
                        style={{
                            marginTop: "10px",
                            color: "#dc2626",
                        }}
                    >
                        {error}
                    </p>

                    <button
                        type="button"
                        className="category-add-btn"
                        style={{
                            marginTop: "20px",
                        }}
                        onClick={loadData}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="category-page">
            {/* =========================
                HEADER
            ========================= */}

            <div className="category-page-header">
                <div>
                    <h2>
                        Category Management
                    </h2>

                    <p>
                        Quản lý các danh mục tour
                        của hệ thống VietTrip
                    </p>
                </div>

                <button
                    type="button"
                    className="category-add-btn"
                    onClick={handleAdd}
                >
                    <span>＋</span>
                    Thêm Category
                </button>
            </div>

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="category-summary">
                <div className="category-summary-card">
                    <div className="category-summary-icon blue">
                        ▣
                    </div>

                    <div>
                        <span>
                            Tổng Category
                        </span>

                        <strong>
                            {totalCategories}
                        </strong>
                    </div>
                </div>

                <div className="category-summary-card">
                    <div className="category-summary-icon green">
                        ✓
                    </div>

                    <div>
                        <span>
                            Đang hoạt động
                        </span>

                        <strong>
                            {activeCategories}
                        </strong>
                    </div>
                </div>

                <div className="category-summary-card">
                    <div className="category-summary-icon orange">
                        ⏸
                    </div>

                    <div>
                        <span>
                            Tạm dừng
                        </span>

                        <strong>
                            {pausedCategories}
                        </strong>
                    </div>
                </div>

                <div className="category-summary-card">
                    <div className="category-summary-icon purple">
                        ✈
                    </div>

                    <div>
                        <span>
                            Tổng số Tour
                        </span>

                        <strong>
                            {totalTours}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =========================
                FILTER
            ========================= */}

            <div className="category-filter">
                <div className="category-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm kiếm category..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="category-filter-group">
                    <label>
                        Trạng thái
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="All">
                            Tất cả
                        </option>

                        <option value="Active">
                            Đang hoạt động
                        </option>

                        <option value="Paused">
                            Tạm dừng
                        </option>
                    </select>
                </div>
            </div>

            {/* =========================
                TABLE
            ========================= */}

            <div className="category-table-card">
                <div className="category-table-header">
                    <div>
                        <h3>
                            Danh sách Category
                        </h3>

                        <span>
                            {
                                filteredCategories.length
                            }{" "}
                            category
                        </span>
                    </div>
                </div>

                <div className="category-table-wrapper">
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>
                                    Category
                                </th>

                                <th>
                                    Mô tả
                                </th>

                                <th>
                                    Số Tour
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
                            {filteredCategories.length >
                                0 ? (
                                filteredCategories.map(
                                    (category) => (
                                        <tr
                                            key={
                                                category.id
                                            }
                                        >
                                            {/* CATEGORY */}

                                            <td>
                                                <div className="category-name-cell">
                                                    <div
                                                        className="category-icon"
                                                        style={{
                                                            overflow:
                                                                "hidden",

                                                            padding:
                                                                0,
                                                        }}
                                                    >
                                                        {category.imageUrl ? (
                                                            <img
                                                                src={
                                                                    category.imageUrl
                                                                }
                                                                alt={
                                                                    category.name
                                                                }
                                                                style={{
                                                                    width:
                                                                        "100%",

                                                                    height:
                                                                        "100%",

                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        ) : (
                                                            "▣"
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                category.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            ID: #
                                                            {
                                                                category.id
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* DESCRIPTION */}

                                            <td>
                                                <span className="category-description">
                                                    {
                                                        category.description
                                                    }
                                                </span>
                                            </td>

                                            {/* TOUR COUNT */}

                                            <td>
                                                <span className="tour-count">
                                                    {
                                                        category.tourCount
                                                    }{" "}
                                                    tour
                                                </span>
                                            </td>

                                            {/* STATUS */}

                                            <td>
                                                <span
                                                    className={
                                                        category.status ===
                                                            "Active"
                                                            ? "status-badge active"
                                                            : "status-badge paused"
                                                    }
                                                >
                                                    <span className="status-dot"></span>

                                                    {category.status ===
                                                        "Active"
                                                        ? "Đang hoạt động"
                                                        : "Tạm dừng"}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}

                                            <td>
                                                <div className="category-actions">
                                                    <button
                                                        type="button"
                                                        className="action-btn view"
                                                        title="Xem"
                                                        onClick={() =>
                                                            handleView(
                                                                category
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
                                                            handleEdit(
                                                                category
                                                            )
                                                        }
                                                    >
                                                        ✎
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            category.status ===
                                                                "Active"
                                                                ? "action-btn delete"
                                                                : "action-btn restore"
                                                        }
                                                        title={
                                                            category.status ===
                                                                "Active"
                                                                ? "Tạm dừng"
                                                                : "Kích hoạt"
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                category
                                                            )
                                                        }
                                                    >
                                                        {category.status ===
                                                            "Active"
                                                            ? "⏸"
                                                            : "↻"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="category-empty"
                                    >
                                        Không tìm thấy
                                        Category phù
                                        hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}

                <div className="category-pagination">
                    <span>
                        Hiển thị{" "}
                        {
                            filteredCategories.length
                        }{" "}
                        /{" "}
                        {categories.length}{" "}
                        Category
                    </span>

                    <div className="pagination-buttons">
                        <button
                            type="button"
                            disabled
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            className="active"
                        >
                            1
                        </button>

                        <button
                            type="button"
                            disabled
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {/* =========================
                MODAL
            ========================= */}

            {showModal && (
                <div
                    className="category-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="category-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* MODAL HEADER */}

                        <div className="category-modal-header">
                            <div>
                                <span className="modal-label">
                                    {modalMode ===
                                        "add"
                                        ? "ADD CATEGORY"
                                        : modalMode ===
                                            "edit"
                                            ? "EDIT CATEGORY"
                                            : "CATEGORY DETAIL"}
                                </span>

                                <h3>
                                    {modalMode ===
                                        "add"
                                        ? "Thêm Category"
                                        : modalMode ===
                                            "edit"
                                            ? "Chỉnh sửa Category"
                                            : selectedCategory?.name}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        {/* =========================
                            VIEW
                        ========================= */}

                        {modalMode ===
                            "view" &&
                            selectedCategory && (
                                <>
                                    <div className="category-modal-body">
                                        {/* IMAGE */}

                                        {selectedCategory.imageUrl && (
                                            <div
                                                style={{
                                                    marginBottom:
                                                        "20px",
                                                }}
                                            >
                                                <img
                                                    src={
                                                        selectedCategory.imageUrl
                                                    }
                                                    alt={
                                                        selectedCategory.name
                                                    }
                                                    style={{
                                                        width:
                                                            "100%",

                                                        height:
                                                            "200px",

                                                        objectFit:
                                                            "cover",

                                                        borderRadius:
                                                            "12px",

                                                        display:
                                                            "block",
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="detail-row">
                                            <span>
                                                Tên Category
                                            </span>

                                            <strong>
                                                {
                                                    selectedCategory.name
                                                }
                                            </strong>
                                        </div>

                                        <div className="detail-row">
                                            <span>
                                                ID
                                            </span>

                                            <strong>
                                                #
                                                {
                                                    selectedCategory.id
                                                }
                                            </strong>
                                        </div>

                                        <div className="detail-row">
                                            <span>
                                                Mô tả
                                            </span>

                                            <strong>
                                                {
                                                    selectedCategory.description
                                                }
                                            </strong>
                                        </div>

                                        <div className="detail-row">
                                            <span>
                                                Số lượng
                                                Tour
                                            </span>

                                            <strong>
                                                {
                                                    selectedCategory.tourCount
                                                }{" "}
                                                tour
                                            </strong>
                                        </div>

                                        <div className="detail-row">
                                            <span>
                                                Trạng thái
                                            </span>

                                            <strong
                                                className={
                                                    selectedCategory.status ===
                                                        "Active"
                                                        ? "detail-active"
                                                        : "detail-paused"
                                                }
                                            >
                                                {selectedCategory.status ===
                                                    "Active"
                                                    ? "Đang hoạt động"
                                                    : "Tạm dừng"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="category-modal-footer">
                                        <button
                                            type="button"
                                            className="modal-cancel"
                                            onClick={
                                                closeModal
                                            }
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </>
                            )}

                        {/* =========================
                            ADD / EDIT
                        ========================= */}

                        {(modalMode ===
                            "add" ||
                            modalMode ===
                            "edit") && (
                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >
                                    <div className="category-modal-body">
                                        {/* NAME */}

                                        <div className="category-form-group">
                                            <label>
                                                Tên Category
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Ví dụ: Biển đảo"
                                                value={
                                                    formData.name
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFormData(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,

                                                            name: e
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="category-form-group">
                                            <label>
                                                Mô tả
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <textarea
                                                rows="4"
                                                placeholder="Nhập mô tả Category..."
                                                value={
                                                    formData.description
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFormData(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,

                                                            description:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* IMAGE */}

                                        <div className="category-form-group">
                                            <label>
                                                Ảnh Category
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",

                                                    flexDirection:
                                                        "column",

                                                    gap:
                                                        "12px",
                                                }}
                                            >
                                                {/* PREVIEW */}

                                                {formData.imageUrl && (
                                                    <div
                                                        style={{
                                                            position:
                                                                "relative",

                                                            width:
                                                                "100%",
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                formData.imageUrl
                                                            }
                                                            alt="Category preview"
                                                            style={{
                                                                width:
                                                                    "100%",

                                                                height:
                                                                    "180px",

                                                                objectFit:
                                                                    "cover",

                                                                borderRadius:
                                                                    "12px",

                                                                border:
                                                                    "1px solid #e5e7eb",

                                                                display:
                                                                    "block",
                                                            }}
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setFormData(
                                                                    (
                                                                        prev
                                                                    ) => ({
                                                                        ...prev,

                                                                        imageUrl:
                                                                            "",
                                                                    })
                                                                )
                                                            }
                                                            style={{
                                                                position:
                                                                    "absolute",

                                                                top:
                                                                    "8px",

                                                                right:
                                                                    "8px",

                                                                width:
                                                                    "32px",

                                                                height:
                                                                    "32px",

                                                                border:
                                                                    "none",

                                                                borderRadius:
                                                                    "50%",

                                                                background:
                                                                    "rgba(0,0,0,0.65)",

                                                                color:
                                                                    "#fff",

                                                                cursor:
                                                                    "pointer",

                                                                fontSize:
                                                                    "18px",
                                                            }}
                                                            title="Xóa ảnh"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}

                                                <label
                                                    htmlFor="category-image-upload"
                                                    style={{
                                                        display:
                                                            "inline-flex",

                                                        alignItems:
                                                            "center",

                                                        justifyContent:
                                                            "center",

                                                        gap:
                                                            "8px",

                                                        minHeight:
                                                            "46px",

                                                        padding:
                                                            "0 16px",

                                                        border:
                                                            "1px dashed #93c5fd",

                                                        borderRadius:
                                                            "10px",

                                                        background:
                                                            "#eff6ff",

                                                        color:
                                                            "#2563eb",

                                                        cursor:
                                                            uploadingImage
                                                                ? "not-allowed"
                                                                : "pointer",

                                                        fontWeight:
                                                            600,

                                                        opacity:
                                                            uploadingImage
                                                                ? 0.7
                                                                : 1,
                                                    }}
                                                >
                                                    {uploadingImage
                                                        ? "Đang upload ảnh..."
                                                        : formData.imageUrl
                                                            ? "↻ Đổi ảnh"
                                                            : "＋ Chọn ảnh"}

                                                    <input
                                                        id="category-image-upload"
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={
                                                            handleImageChange
                                                        }
                                                        disabled={
                                                            uploadingImage
                                                        }
                                                        style={{
                                                            display:
                                                                "none",
                                                        }}
                                                    />
                                                </label>

                                                <small
                                                    style={{
                                                        color:
                                                            "#64748b",

                                                        fontSize:
                                                            "12px",
                                                    }}
                                                >
                                                    JPG, PNG, WEBP
                                                    · tối đa 5MB
                                                </small>
                                            </div>
                                        </div>

                                        {/* STATUS */}

                                        <div className="category-form-group">
                                            <label>
                                                Trạng thái
                                            </label>

                                            <select
                                                value={
                                                    formData.status
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFormData(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,

                                                            status: e
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                            >
                                                <option value="Active">
                                                    Đang hoạt động
                                                </option>

                                                <option value="Paused">
                                                    Tạm dừng
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* FOOTER */}

                                    <div className="category-modal-footer">
                                        <button
                                            type="button"
                                            className="modal-cancel"
                                            onClick={
                                                closeModal
                                            }
                                            disabled={
                                                saving ||
                                                uploadingImage
                                            }
                                        >
                                            Hủy
                                        </button>

                                        <button
                                            type="submit"
                                            className="modal-save"
                                            disabled={
                                                saving ||
                                                uploadingImage
                                            }
                                        >
                                            {saving
                                                ? "Đang lưu..."
                                                : modalMode ===
                                                    "add"
                                                    ? "Thêm Category"
                                                    : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryManagement;