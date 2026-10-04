
import { useEffect, useState } from "react";
import "./TourSchedules.css";
import api from "../../../services/api";

function TourSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [tours, setTours] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedTourId, setSelectedTourId] = useState("");

    const [formData, setFormData] = useState({
        tourId: "",
        startDate: "",
        endDate: "",
        availableSlots: "",
        isActive: true,
    });

    // =========================
    // LOAD DATA
    // =========================
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [scheduleResponse, tourResponse] = await Promise.all([
                api.get("/api/TourSchedules"),
                api.get("/api/Tours"),
            ]);

            setSchedules(scheduleResponse.data || []);
            setTours(tourResponse.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            alert(
                error.response?.data?.message ||
                "Không thể tải dữ liệu lịch khởi hành."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // FORM
    // =========================
    const resetForm = () => {
        setFormData({
            tourId: "",
            startDate: "",
            endDate: "",
            availableSlots: "",
            isActive: true,
        });

        setEditingId(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (schedule) => {
        setEditingId(schedule.id);

        setFormData({
            tourId: schedule.tourId,
            startDate: formatDateTimeForInput(schedule.startDate),
            endDate: formatDateTimeForInput(schedule.endDate),
            availableSlots: schedule.availableSlots,
            isActive: schedule.isActive,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================
    // DATE
    // =========================
    const formatDateTimeForInput = (date) => {
        if (!date) return "";

        const d = new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================
    // SAVE
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tourId) {
            alert("Vui lòng chọn tour.");
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            alert("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.");
            return;
        }

        if (
            new Date(formData.startDate) >=
            new Date(formData.endDate)
        ) {
            alert("Ngày kết thúc phải sau ngày bắt đầu.");
            return;
        }

        if (
            formData.availableSlots === "" ||
            Number(formData.availableSlots) <= 0
        ) {
            alert("Số chỗ phải lớn hơn 0.");
            return;
        }

        try {
            const payload = {
                tourId: Number(formData.tourId),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                availableSlots: Number(formData.availableSlots),
                isActive: formData.isActive,
            };

            if (editingId) {
                await api.put(
                    `/api/TourSchedules/${editingId}`,
                    payload
                );

                alert("Cập nhật lịch khởi hành thành công.");
            } else {
                await api.post("/api/TourSchedules", payload);

                alert("Thêm lịch khởi hành thành công.");
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error("Lỗi lưu lịch:", error);

            alert(
                error.response?.data?.message ||
                "Không thể lưu lịch khởi hành."
            );
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Bạn có chắc muốn vô hiệu hóa lịch khởi hành này?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/api/TourSchedules/${id}`);

            alert("Đã vô hiệu hóa lịch khởi hành.");

            fetchData();
        } catch (error) {
            console.error("Lỗi xóa lịch:", error);

            alert(
                error.response?.data?.message ||
                "Không thể vô hiệu hóa lịch khởi hành."
            );
        }
    };

    // =========================
    // FILTER
    // =========================
    const filteredSchedules = schedules.filter((schedule) => {
        if (!selectedTourId) return true;

        return schedule.tourId === Number(selectedTourId);
    });

    const getTourName = (tourId) => {
        const tour = tours.find(
            (item) => item.id === tourId
        );

        return tour?.name || `Tour #${tourId}`;
    };

    // =========================
    // RENDER
    // =========================
    return (
        <div className="tour-schedules-page">
            <div className="tour-schedules-header">
                <div>
                    <h1>Quản lý lịch khởi hành</h1>
                    <p>
                        Quản lý thời gian khởi hành và số chỗ của các tour.
                    </p>
                </div>

                <button
                    className="schedule-add-btn"
                    onClick={openAddModal}
                >
                    + Thêm lịch khởi hành
                </button>
            </div>

            {/* FILTER */}
            <div className="schedule-filter">
                <label>Chọn tour:</label>

                <select
                    value={selectedTourId}
                    onChange={(e) =>
                        setSelectedTourId(e.target.value)
                    }
                >
                    <option value="">Tất cả tour</option>

                    {tours.map((tour) => (
                        <option
                            key={tour.id}
                            value={tour.id}
                        >
                            {tour.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* TABLE */}
            <div className="schedule-table-wrapper">
                {loading ? (
                    <div className="schedule-loading">
                        Đang tải dữ liệu...
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="schedule-empty">
                        Chưa có lịch khởi hành nào.
                    </div>
                ) : (
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tour</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Số chỗ</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSchedules.map(
                                (schedule) => (
                                    <tr key={schedule.id}>
                                        <td>
                                            #{schedule.id}
                                        </td>

                                        <td>
                                            <strong>
                                                {getTourName(
                                                    schedule.tourId
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            {formatDate(
                                                schedule.startDate
                                            )}
                                        </td>

                                        <td>
                                            {formatDate(
                                                schedule.endDate
                                            )}
                                        </td>

                                        <td>
                                            <span className="schedule-slots">
                                                {
                                                    schedule.availableSlots
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            {schedule.isActive ? (
                                                <span className="status-active">
                                                    Đang hoạt động
                                                </span>
                                            ) : (
                                                <span className="status-inactive">
                                                    Đã vô hiệu hóa
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <div className="schedule-actions">
                                                <button
                                                    className="schedule-edit-btn"
                                                    onClick={() =>
                                                        openEditModal(
                                                            schedule
                                                        )
                                                    }
                                                >
                                                    Sửa
                                                </button>

                                                {schedule.isActive && (
                                                    <button
                                                        className="schedule-delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                schedule.id
                                                            )
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div
                    className="schedule-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="schedule-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="schedule-modal-header">
                            <h2>
                                {editingId
                                    ? "Chỉnh sửa lịch khởi hành"
                                    : "Thêm lịch khởi hành"}
                            </h2>

                            <button
                                className="schedule-close-btn"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="schedule-form"
                        >
                            <div className="schedule-form-group">
                                <label>
                                    Tour
                                </label>

                                <select
                                    name="tourId"
                                    value={
                                        formData.tourId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!!editingId}
                                    required
                                >
                                    <option value="">
                                        -- Chọn tour --
                                    </option>

                                    {tours.map(
                                        (tour) => (
                                            <option
                                                key={
                                                    tour.id
                                                }
                                                value={
                                                    tour.id
                                                }
                                            >
                                                {
                                                    tour.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="schedule-form-row">
                                <div className="schedule-form-group">
                                    <label>
                                        Ngày bắt đầu
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={
                                            formData.startDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="schedule-form-group">
                                    <label>
                                        Ngày kết thúc
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={
                                            formData.endDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="schedule-form-group">
                                <label>
                                    Số chỗ
                                </label>

                                <input
                                    type="number"
                                    name="availableSlots"
                                    min="1"
                                    value={
                                        formData.availableSlots
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Nhập số chỗ"
                                    required
                                />
                            </div>

                            {editingId && (
                                <label className="schedule-checkbox">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={
                                            formData.isActive
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        Lịch đang hoạt động
                                    </span>
                                </label>
                            )}

                            <div className="schedule-form-actions">
                                <button
                                    type="button"
                                    className="schedule-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="schedule-save-btn"
                                >
                                    {editingId
                                        ? "Lưu thay đổi"
                                        : "Thêm lịch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TourSchedules;

