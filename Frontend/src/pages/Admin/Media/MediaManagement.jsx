
import { useEffect, useMemo, useState } from "react";

import api from "../../../services/api";

import "./MediaManagement.css";

const formatFileSize = (bytes) => {
    if (!bytes) {
        return "0 KB";
    }

    const kb = bytes / 1024;

    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;

    return `${mb.toFixed(1)} MB`;
};

function MediaManagement() {
    const [media, setMedia] = useState([]);
    const [search, setSearch] = useState("");
    const [folderFilter, setFolderFilter] = useState("All");
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMedia = async () => {
        try {
            setLoading(true);

            const response = await api.get("/api/Media");

            const mediaData = response.data.map((item) => ({
                apiId: item.id,
                id: `MED${String(item.id).padStart(3, "0")}`,
                name: item.fileName,
                folder: item.folder,
                type: "Image",
                size: formatFileSize(item.fileSize),
                uploadedDate: new Date(
                    item.createdAt
                ).toLocaleDateString("vi-VN"),

                // Media Service hiện chưa kiểm tra usage
                usedBy: null,

                url: item.url,
                publicId: item.publicId,
            }));

            setMedia(mediaData);
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách Media:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Không thể tải danh sách Media."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const filteredMedia = useMemo(() => {
        return media.filter((item) => {
            const keyword = search.toLowerCase().trim();

            const matchesSearch =
                !keyword ||
                item.id.toLowerCase().includes(keyword) ||
                item.name.toLowerCase().includes(keyword) ||
                item.folder.toLowerCase().includes(keyword) ||
                (item.usedBy &&
                    item.usedBy
                        .toLowerCase()
                        .includes(keyword));

            const matchesFolder =
                folderFilter === "All" ||
                item.folder === folderFilter;

            return matchesSearch && matchesFolder;
        });
    }, [media, search, folderFilter]);

    const summary = useMemo(() => {
        return {
            total: media.length,

            covers: media.filter(
                (item) =>
                    item.folder === "tours/covers"
            ).length,

            gallery: media.filter(
                (item) =>
                    item.folder === "tours/gallery"
            ).length,

            unused: media.filter(
                (item) => !item.usedBy
            ).length,
        };
    }, [media]);

    const handleDeleteMedia = async (mediaItem) => {
        if (mediaItem.usedBy) {
            alert(
                "Media này đang được sử dụng và không thể xóa."
            );

            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa "${mediaItem.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/api/Media?publicId=${encodeURIComponent(
                    mediaItem.publicId
                )}`
            );

            setMedia((current) =>
                current.filter(
                    (item) =>
                        item.apiId !== mediaItem.apiId
                )
            );

            setSelectedMedia(null);

            alert("Xóa Media thành công.");
        } catch (error) {
            console.error(
                "Lỗi xóa Media:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Xóa Media thất bại."
            );
        }
    };

    const getFolderLabel = (folder) => {
        const labels = {
            "tours/covers": "Tour Covers",
            "tours/gallery": "Tour Gallery",
            destinations: "Destinations",
            "users/avatars": "User Avatars",
            reviews: "Reviews",
            banners: "Banners",
        };

        return labels[folder] || folder;
    };

    return (
        <div className="media-management">
            <div className="page-heading">
                <div>
                    <h2>Quản lý Media</h2>

                    <p>
                        Quản lý hình ảnh và tài nguyên được lưu trên
                        Cloudinary
                    </p>
                </div>
            </div>

            <div className="media-summary">
                <div className="summary-card">
                    <div className="summary-icon blue">
                        ▧
                    </div>

                    <div>
                        <span>Tổng Media</span>
                        <strong>{summary.total}</strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon purple">
                        ▣
                    </div>

                    <div>
                        <span>Tour Covers</span>
                        <strong>{summary.covers}</strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon green">
                        ▤
                    </div>

                    <div>
                        <span>Tour Gallery</span>
                        <strong>{summary.gallery}</strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon orange">
                        ⚠
                    </div>

                    <div>
                        <span>Chưa sử dụng</span>
                        <strong>{summary.unused}</strong>
                    </div>
                </div>
            </div>

            <div className="media-toolbar">
                <div className="media-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm tên file, folder, nội dung sử dụng..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <select
                    value={folderFilter}
                    onChange={(e) =>
                        setFolderFilter(e.target.value)
                    }
                >
                    <option value="All">
                        Tất cả Folder
                    </option>

                    <option value="tours/covers">
                        tours/covers
                    </option>

                    <option value="tours/gallery">
                        tours/gallery
                    </option>

                    <option value="destinations">
                        destinations
                    </option>

                    <option value="users/avatars">
                        users/avatars
                    </option>

                    <option value="reviews">
                        reviews
                    </option>

                    <option value="banners">
                        banners
                    </option>
                </select>
            </div>

            <div className="media-table-card">
                <div className="table-header">
                    <div>
                        <h3>Danh sách Media</h3>

                        <span>
                            {filteredMedia.length} tài nguyên
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="media-table">
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>File</th>
                                <th>Folder</th>
                                <th>Kích thước</th>
                                <th>Ngày upload</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        Đang tải Media...
                                    </td>
                                </tr>
                            ) : filteredMedia.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="empty-state"
                                    >
                                        Không tìm thấy Media phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredMedia.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="media-thumbnail">
                                                <img
                                                    src={item.url}
                                                    alt={item.name}
                                                />
                                            </div>
                                        </td>

                                        <td>
                                            <div className="media-file-cell">
                                                <strong>
                                                    {item.name}
                                                </strong>

                                                <span>
                                                    {item.id}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="folder-badge">
                                                {item.folder}
                                            </span>
                                        </td>

                                        <td>
                                            {item.size}
                                        </td>

                                        <td>
                                            {item.uploadedDate}
                                        </td>


                                        <td>
                                            <div className="media-actions">
                                                <button
                                                    type="button"
                                                    className="media-action-view"
                                                    onClick={() =>
                                                        setSelectedMedia(
                                                            item
                                                        )
                                                    }
                                                >
                                                    Xem
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        item.usedBy
                                                            ? "media-action-delete disabled"
                                                            : "media-action-delete"
                                                    }
                                                    disabled={
                                                        !!item.usedBy
                                                    }
                                                    onClick={() =>
                                                        handleDeleteMedia(
                                                            item
                                                        )
                                                    }
                                                    title={
                                                        item.usedBy
                                                            ? "Media đang được sử dụng"
                                                            : "Xóa Media"
                                                    }
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedMedia && (
                <div
                    className="media-modal-overlay"
                    onClick={() =>
                        setSelectedMedia(null)
                    }
                >
                    <div
                        className="media-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="media-modal-header">
                            <div>
                                <span>
                                    Chi tiết Media
                                </span>

                                <h3>
                                    {selectedMedia.name}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setSelectedMedia(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="media-preview-large">
                            <img
                                src={selectedMedia.url}
                                alt={selectedMedia.name}
                            />
                        </div>

                        <div className="media-detail-grid">
                            <div className="detail-item">
                                <span>ID</span>

                                <strong>
                                    {selectedMedia.id}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>File name</span>

                                <strong>
                                    {selectedMedia.name}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Folder</span>

                                <strong>
                                    {getFolderLabel(
                                        selectedMedia.folder
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Kích thước</span>

                                <strong>
                                    {selectedMedia.size}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Ngày upload</span>

                                <strong>
                                    {selectedMedia.uploadedDate}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Đang sử dụng</span>

                                <strong>
                                    {selectedMedia.usedBy ||
                                        "Chưa sử dụng"}
                                </strong>
                            </div>
                        </div>

                        <div className="media-modal-note">
                            <span>ℹ</span>

                            <p>
                                Media đang được Tour, Destination hoặc
                                đối tượng khác sử dụng sẽ không được phép
                                xóa.
                            </p>
                        </div>

                        <div className="media-modal-actions">
                            <button
                                type="button"
                                className={
                                    selectedMedia.usedBy
                                        ? "modal-delete-media disabled"
                                        : "modal-delete-media"
                                }
                                disabled={
                                    !!selectedMedia.usedBy
                                }
                                onClick={() =>
                                    handleDeleteMedia(
                                        selectedMedia
                                    )
                                }
                            >
                                🗑 Xóa Media
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MediaManagement;

