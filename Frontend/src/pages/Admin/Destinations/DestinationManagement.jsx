import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./DestinationManagement.css";

const emptyForm = {
    name: "",
    province: "",
    region: "",
    shortDescription: "",
    description: "",
    latitude: "",
    longitude: "",
    sortOrder: 0,
    status: "Active",
    coverImage: "",
};

function DestinationManagement() {
    const [destinations, setDestinations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedDestination, setSelectedDestination] =
        useState(null);

    const [formData, setFormData] = useState(emptyForm);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    /* =========================
       LOAD DESTINATIONS
    ========================= */

    useEffect(() => {
        loadDestinations();
    }, []);

    /* =========================
       BODY SCROLL LOCK
    ========================= */

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

    /* =========================
       GET
    ========================= */

    const loadDestinations = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/api/Destinations"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.items || [];

            const mappedData = data.map(
                (destination) => ({
                    ...destination,

                    id: destination.id,

                    name: destination.name || "",

                    province:
                        destination.province || "",

                    region:
                        destination.region || "",

                    shortDescription:
                        destination.shortDescription ||
                        "",

                    description:
                        destination.description || "",

                    coverImage:
                        destination.imageUrl ||
                        destination.coverImage ||
                        "",

                    status:
                        destination.isActive === false
                            ? "Paused"
                            : "Active",

                    tourCount:
                        destination.tourCount || 0,
                })
            );

            setDestinations(mappedData);
        } catch (error) {
            console.error(
                "Lỗi khi tải Destination:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Không thể tải danh sách Destination."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       FILTER
    ========================= */

    const filteredDestinations =
        destinations.filter((destination) => {
            const keyword = searchTerm
                .toLowerCase()
                .trim();

            const matchesSearch =
                destination.name
                    .toLowerCase()
                    .includes(keyword) ||
                destination.province
                    .toLowerCase()
                    .includes(keyword) ||
                destination.description
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                destination.status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    /* =========================
       SUMMARY
    ========================= */

    const totalDestinations =
        destinations.length;

    const activeDestinations =
        destinations.filter(
            (destination) =>
                destination.status ===
                "Active"
        ).length;

    const pausedDestinations =
        destinations.filter(
            (destination) =>
                destination.status ===
                "Paused"
        ).length;

    const totalTours =
        destinations.reduce(
            (total, destination) =>
                total +
                Number(
                    destination.tourCount || 0
                ),
            0
        );

    /* =========================
       ADD
    ========================= */

    const handleAdd = () => {
        setModalMode("add");
        setSelectedDestination(null);

        setFormData({
            ...emptyForm,
        });

        setShowModal(true);
    };

    /* =========================
       EDIT
    ========================= */

    const handleEdit = (destination) => {
        setModalMode("edit");
        setSelectedDestination(destination);

        setFormData({
            name: destination.name || "",

            province:
                destination.province || "",

            region:
                destination.region || "",

            shortDescription:
                destination.shortDescription ||
                "",

            description:
                destination.description || "",

            latitude:
                destination.latitude ?? "",

            longitude:
                destination.longitude ?? "",

            sortOrder:
                destination.sortOrder ?? 0,

            status:
                destination.status ||
                "Active",

            coverImage:
                destination.coverImage || "",
        });

        setShowModal(true);
    };

    /* =========================
       VIEW
    ========================= */

    const handleView = (destination) => {
        setModalMode("view");
        setSelectedDestination(destination);
        setShowModal(true);
    };

    /* =========================
       UPLOAD COVER
    ========================= */

    const handleCoverChange = async (e) => {
        const file =
            e.target.files?.[0];

        if (!file) return;

        try {
            setUploadingCover(true);

            const uploadData =
                new FormData();

            uploadData.append(
                "file",
                file
            );

            const response =
                await api.post(
                    "/api/Media/upload?folder=viettrip/destinations",
                    uploadData
                );

            const imageUrl =
                response.data?.url;

            if (!imageUrl) {
                throw new Error(
                    "Không nhận được URL ảnh."
                );
            }

            setFormData((prev) => ({
                ...prev,
                coverImage: imageUrl,
            }));
        } catch (error) {
            console.error(
                "Lỗi upload cover:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Upload ảnh Cover thất bại."
            );
        } finally {
            setUploadingCover(false);

            e.target.value = "";
        }
    };

    /* =========================
       REMOVE COVER
    ========================= */

    const removeCoverImage = () => {
        setFormData((prev) => ({
            ...prev,
            coverImage: "",
        }));
    };

    /* =========================
       SAVE
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert(
                "Vui lòng nhập tên Destination."
            );
            return;
        }

        if (!formData.province.trim()) {
            alert(
                "Vui lòng nhập tỉnh/thành phố."
            );
            return;
        }

        if (!formData.description.trim()) {
            alert(
                "Vui lòng nhập mô tả Destination."
            );
            return;
        }

        if (!formData.coverImage) {
            alert(
                "Vui lòng chọn ảnh Cover."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name:
                    formData.name.trim(),

                province:
                    formData.province.trim(),

                region:
                    formData.region.trim() ||
                    null,

                shortDescription:
                    formData.shortDescription.trim() ||
                    null,

                description:
                    formData.description.trim(),

                imageUrl:
                    formData.coverImage,

                latitude:
                    formData.latitude === ""
                        ? null
                        : Number(
                            formData.latitude
                        ),

                longitude:
                    formData.longitude === ""
                        ? null
                        : Number(
                            formData.longitude
                        ),

                sortOrder:
                    Number(
                        formData.sortOrder ||
                        0
                    ),

                isActive:
                    formData.status ===
                    "Active",
            };

            /* =========================
               ADD
            ========================= */

            if (
                modalMode === "add"
            ) {
                await api.post(
                    "/api/Destinations",
                    payload
                );
            }

            /* =========================
               EDIT
            ========================= */

            if (
                modalMode === "edit"
            ) {
                await api.put(
                    `/api/Destinations/${selectedDestination.id}`,
                    payload
                );
            }

            alert(
                modalMode === "add"
                    ? "Thêm Destination thành công."
                    : "Cập nhật Destination thành công."
            );

            await loadDestinations();

            closeModal();
        } catch (error) {
            console.error(
                "Lỗi lưu Destination:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Không thể lưu Destination."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================
       TOGGLE STATUS
    ========================= */

    const handleToggleStatus = async (
        destination
    ) => {
        const isActive =
            destination.status ===
            "Active";

        const message = isActive
            ? `Bạn có chắc muốn tạm dừng Destination "${destination.name}"?`
            : `Bạn có muốn kích hoạt lại Destination "${destination.name}"?`;

        const confirmed =
            window.confirm(message);

        if (!confirmed) return;

        try {
            if (isActive) {
                await api.delete(
                    `/api/Destinations/${destination.id}`
                );
            } else {
                await api.put(
                    `/api/Destinations/${destination.id}`,
                    {
                        name:
                            destination.name,

                        province:
                            destination.province,

                        region:
                            destination.region ||
                            null,

                        shortDescription:
                            destination.shortDescription ||
                            null,

                        description:
                            destination.description,

                        imageUrl:
                            destination.coverImage ||
                            null,

                        latitude:
                            destination.latitude ??
                            null,

                        longitude:
                            destination.longitude ??
                            null,

                        sortOrder:
                            destination.sortOrder ??
                            0,

                        isActive: true,
                    }
                );
            }

            await loadDestinations();
        } catch (error) {
            console.error(
                "Lỗi thay đổi trạng thái:",
                error
            );

            alert(
                error.response?.data
                    ?.message ||
                "Không thể thay đổi trạng thái Destination."
            );
        }
    };

    /* =========================
       CLOSE
    ========================= */

    const closeModal = () => {
        setShowModal(false);
        setSelectedDestination(null);

        setFormData({
            ...emptyForm,
        });
    };

    return (
        <div className="destination-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="destination-page-header">
                <div>
                    <h2>
                        Destination Management
                    </h2>

                    <p>
                        Quản lý các điểm đến du lịch
                        của VietTrip
                    </p>
                </div>

                <button
                    type="button"
                    className="destination-add-btn"
                    onClick={handleAdd}
                >
                    <span>＋</span>
                    Thêm Destination
                </button>
            </div>

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="destination-summary">

                <div className="destination-summary-card">
                    <div className="destination-summary-icon blue">
                        ⌖
                    </div>

                    <div>
                        <span>
                            Tổng điểm đến
                        </span>

                        <strong>
                            {totalDestinations}
                        </strong>
                    </div>
                </div>

                <div className="destination-summary-card">
                    <div className="destination-summary-icon green">
                        ✓
                    </div>

                    <div>
                        <span>
                            Đang hoạt động
                        </span>

                        <strong>
                            {activeDestinations}
                        </strong>
                    </div>
                </div>

                <div className="destination-summary-card">
                    <div className="destination-summary-icon orange">
                        ⏸
                    </div>

                    <div>
                        <span>
                            Tạm dừng
                        </span>

                        <strong>
                            {pausedDestinations}
                        </strong>
                    </div>
                </div>

                <div className="destination-summary-card">
                    <div className="destination-summary-icon purple">
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

            <div className="destination-filter">

                <div className="destination-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm kiếm điểm đến..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="destination-filter-group">

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

            <div className="destination-table-card">

                <div className="destination-table-header">
                    <div>
                        <h3>
                            Danh sách Destination
                        </h3>

                        <span>
                            {
                                filteredDestinations.length
                            }{" "}
                            điểm đến
                        </span>
                    </div>
                </div>

                <div className="destination-table-wrapper">

                    <table className="destination-table">

                        <thead>
                            <tr>
                                <th>
                                    Điểm đến
                                </th>

                                <th>
                                    Tỉnh / Thành phố
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

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="destination-empty"
                                    >
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredDestinations.length >
                                0 ? (
                                filteredDestinations.map(
                                    (
                                        destination
                                    ) => (
                                        <tr
                                            key={
                                                destination.id
                                            }
                                        >

                                            {/* DESTINATION */}

                                            <td>
                                                <div className="destination-name-cell">

                                                    <img
                                                        src={
                                                            destination.coverImage
                                                        }
                                                        alt={
                                                            destination.name
                                                        }
                                                    />

                                                    <div>

                                                        <strong>
                                                            {
                                                                destination.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            ID: #
                                                            {
                                                                destination.id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>
                                            </td>

                                            {/* PROVINCE */}

                                            <td>
                                                <span className="destination-province">
                                                    {
                                                        destination.province
                                                    }
                                                </span>
                                            </td>

                                            {/* TOUR COUNT */}

                                            <td>
                                                <span className="destination-tour-count">
                                                    {
                                                        destination.tourCount
                                                    }{" "}
                                                    tour
                                                </span>
                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        destination.status ===
                                                            "Active"
                                                            ? "destination-status active"
                                                            : "destination-status paused"
                                                    }
                                                >

                                                    <span className="destination-status-dot"></span>

                                                    {destination.status ===
                                                        "Active"
                                                        ? "Đang hoạt động"
                                                        : "Tạm dừng"}

                                                </span>

                                            </td>

                                            {/* ACTION */}

                                            <td>

                                                <div className="destination-actions">

                                                    <button
                                                        type="button"
                                                        className="destination-action-btn view"
                                                        title="Xem"
                                                        onClick={() =>
                                                            handleView(
                                                                destination
                                                            )
                                                        }
                                                    >
                                                        👁
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="destination-action-btn edit"
                                                        title="Sửa"
                                                        onClick={() =>
                                                            handleEdit(
                                                                destination
                                                            )
                                                        }
                                                    >
                                                        ✎
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            destination.status ===
                                                                "Active"
                                                                ? "destination-action-btn delete"
                                                                : "destination-action-btn restore"
                                                        }
                                                        title={
                                                            destination.status ===
                                                                "Active"
                                                                ? "Tạm dừng"
                                                                : "Kích hoạt"
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                destination
                                                            )
                                                        }
                                                    >
                                                        {destination.status ===
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
                                        className="destination-empty"
                                    >
                                        Không tìm thấy
                                        Destination phù
                                        hợp.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

                {/* PAGINATION */}

                <div className="destination-pagination">

                    <span>
                        Hiển thị{" "}
                        {
                            filteredDestinations.length
                        }{" "}
                        /{" "}
                        {destinations.length}{" "}
                        Destination
                    </span>

                    <div className="destination-pagination-buttons">

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
                    className="destination-modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="destination-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="destination-modal-header">

                            <div>

                                <span className="destination-modal-label">
                                    {modalMode ===
                                        "add"
                                        ? "ADD DESTINATION"
                                        : modalMode ===
                                            "edit"
                                            ? "EDIT DESTINATION"
                                            : "DESTINATION DETAIL"}
                                </span>

                                <h3>
                                    {modalMode ===
                                        "add"
                                        ? "Thêm Destination"
                                        : modalMode ===
                                            "edit"
                                            ? "Chỉnh sửa Destination"
                                            : selectedDestination?.name}
                                </h3>

                            </div>

                            <button
                                type="button"
                                className="destination-modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* =========================
                            VIEW
                        ========================= */}

                        {modalMode ===
                            "view" &&
                            selectedDestination && (
                                <>

                                    <div className="destination-modal-body">

                                        <div className="destination-detail-cover">

                                            <img
                                                src={
                                                    selectedDestination.coverImage
                                                }
                                                alt={
                                                    selectedDestination.name
                                                }
                                            />

                                        </div>

                                        <div className="destination-detail-info">

                                            <div className="destination-detail-row">
                                                <span>
                                                    Tên
                                                    Destination
                                                </span>

                                                <strong>
                                                    {
                                                        selectedDestination.name
                                                    }
                                                </strong>
                                            </div>

                                            <div className="destination-detail-row">
                                                <span>
                                                    Tỉnh /
                                                    Thành phố
                                                </span>

                                                <strong>
                                                    {
                                                        selectedDestination.province
                                                    }
                                                </strong>
                                            </div>

                                            <div className="destination-detail-row">
                                                <span>
                                                    Khu vực
                                                </span>

                                                <strong>
                                                    {
                                                        selectedDestination.region ||
                                                        "--"
                                                    }
                                                </strong>
                                            </div>

                                            <div className="destination-detail-row">
                                                <span>
                                                    Mô tả
                                                </span>

                                                <strong>
                                                    {
                                                        selectedDestination.description
                                                    }
                                                </strong>
                                            </div>

                                            <div className="destination-detail-row">
                                                <span>
                                                    Số Tour
                                                </span>

                                                <strong>
                                                    {
                                                        selectedDestination.tourCount
                                                    }{" "}
                                                    tour
                                                </strong>
                                            </div>

                                            <div className="destination-detail-row">
                                                <span>
                                                    Trạng thái
                                                </span>

                                                <strong
                                                    className={
                                                        selectedDestination.status ===
                                                            "Active"
                                                            ? "destination-detail-active"
                                                            : "destination-detail-paused"
                                                    }
                                                >
                                                    {selectedDestination.status ===
                                                        "Active"
                                                        ? "Đang hoạt động"
                                                        : "Tạm dừng"}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="destination-modal-footer">

                                        <button
                                            type="button"
                                            className="destination-modal-cancel"
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

                                    <div className="destination-modal-body">

                                        {/* NAME */}

                                        <div className="destination-form-group">

                                            <label>
                                                Tên Destination
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Ví dụ: Hạ Long"
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

                                        {/* PROVINCE */}

                                        <div className="destination-form-group">

                                            <label>
                                                Tỉnh /
                                                Thành phố
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Ví dụ: Quảng Ninh"
                                                value={
                                                    formData.province
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFormData(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,
                                                            province:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            />

                                        </div>

                                        {/* REGION */}

                                        <div className="destination-form-group">

                                            <label>
                                                Khu vực
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Ví dụ: Miền Bắc"
                                                value={
                                                    formData.region
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFormData(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,
                                                            region:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            />

                                        </div>

                                        {/* SHORT DESCRIPTION */}

                                        <div className="destination-form-group">

                                            <label>
                                                Mô tả ngắn
                                            </label>

                                            <textarea
                                                rows="2"
                                                placeholder="Nhập mô tả ngắn..."
                                                value={
                                                    formData.shortDescription
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFormData(
                                                        (
                                                            prev
                                                        ) => ({
                                                            ...prev,
                                                            shortDescription:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            />

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="destination-form-group">

                                            <label>
                                                Mô tả
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <textarea
                                                rows="4"
                                                placeholder="Nhập mô tả Destination..."
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

                                        {/* STATUS */}

                                        <div className="destination-form-group">

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

                                        {/* COVER */}

                                        <div className="destination-form-group">

                                            <label>
                                                Ảnh Cover
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            {!formData.coverImage ? (

                                                <label className="destination-upload-box">

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            handleCoverChange
                                                        }
                                                        disabled={
                                                            uploadingCover
                                                        }
                                                    />

                                                    <span className="destination-upload-icon">
                                                        🖼️
                                                    </span>

                                                    <strong>
                                                        {uploadingCover
                                                            ? "Đang upload..."
                                                            : "Chọn ảnh Cover"}
                                                    </strong>

                                                    <small>
                                                        PNG,
                                                        JPG,
                                                        WEBP
                                                    </small>

                                                </label>

                                            ) : (

                                                <div className="destination-cover-preview">

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
                                                    >
                                                        ×
                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                    {/* FOOTER */}

                                    <div className="destination-modal-footer">

                                        <button
                                            type="button"
                                            className="destination-modal-cancel"
                                            onClick={
                                                closeModal
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            Hủy
                                        </button>

                                        <button
                                            type="submit"
                                            className="destination-modal-save"
                                            disabled={
                                                saving ||
                                                uploadingCover
                                            }
                                        >
                                            {saving
                                                ? "Đang lưu..."
                                                : modalMode ===
                                                    "add"
                                                    ? "Thêm Destination"
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

export default DestinationManagement;