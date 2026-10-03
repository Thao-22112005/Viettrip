import { useEffect, useMemo, useState } from "react";

import "./UserManagement.css";

import api from "../../../services/api";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =============================
    // GET USERS + BOOKING + PAYMENT
    // =============================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            // 1. Lấy danh sách User
            const response = await api.get("/api/Auth/internal/users");

            const responseData = Array.isArray(response.data)
                ? response.data
                : [];

            // 2. Lấy Booking + Payment của từng User
            const mappedUsers = await Promise.all(
                responseData.map(async (user) => {
                    let bookings = [];
                    let payments = [];

                    // Lấy danh sách Booking
                    try {
                        const bookingResponse = await api.get(
                            `/api/Bookings/user/${user.id}`
                        );

                        bookings = Array.isArray(bookingResponse.data)
                            ? bookingResponse.data
                            : [];
                    } catch (bookingError) {
                        console.error(
                            `Lỗi lấy booking của user ${user.id}:`,
                            bookingError
                        );
                    }

                    // Lấy danh sách Payment
                    try {
                        const paymentResponse = await api.get(
                            `/api/Payments/user/${user.id}`
                        );

                        payments = Array.isArray(paymentResponse.data)
                            ? paymentResponse.data
                            : [];
                    } catch (paymentError) {
                        console.error(
                            `Lỗi lấy payment của user ${user.id}:`,
                            paymentError
                        );
                    }

                    // Chỉ tính những payment đã thanh toán
                    const totalSpent = payments
                        .filter(
                            (payment) => payment.status === "Paid"
                        )
                        .reduce(
                            (total, payment) =>
                                total + Number(payment.amount || 0),
                            0
                        );

                    return {
                        apiId: user.id,

                        // Chỉ để hiển thị giống giao diện cũ
                        id: `U${String(user.id).padStart(3, "0")}`,

                        fullName: user.fullName || "",
                        email: user.email || "",
                        phone: user.phone || "Chưa cập nhật",

                        joinedDate: user.createdAt
                            ? new Date(
                                user.createdAt
                            ).toLocaleDateString("vi-VN")
                            : "--",

                        // Số booking
                        bookings: bookings.length,

                        // Tổng tiền đã thanh toán
                        totalSpent: totalSpent,

                        status: user.status || "Active",
                        role: user.role || "User",
                        address: user.address || "",
                        isEmailVerified: user.isEmailVerified,
                        createdAt: user.createdAt,
                    };
                })
            );

            setUsers(mappedUsers);
        } catch (err) {
            console.error("Lỗi lấy danh sách users:", err);

            if (err.response?.status === 401) {
                setError(
                    "Bạn chưa đăng nhập hoặc token đã hết hạn."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "Tài khoản hiện tại không có quyền Admin."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Không thể lấy danh sách người dùng."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // =============================
    // FILTER
    // =============================
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const keyword = search.toLowerCase().trim();

            const matchesSearch =
                !keyword ||
                user.id.toLowerCase().includes(keyword) ||
                user.fullName.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword) ||
                user.phone.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                user.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [users, search, statusFilter]);

    // =============================
    // SUMMARY
    // =============================
    const summary = useMemo(() => {
        return {
            total: users.length,

            active: users.filter(
                (user) => user.status === "Active"
            ).length,

            locked: users.filter(
                (user) => user.status === "Locked"
            ).length,

            // Tổng tất cả Booking của User
            totalBookings: users.reduce(
                (total, user) =>
                    total + (user.bookings || 0),
                0
            ),
        };
    }, [users]);

    // =============================
    // FORMAT MONEY
    // =============================
    const formatCurrency = (value) => {
        if (value === null || value === undefined) {
            return "—";
        }

        return (
            new Intl.NumberFormat("vi-VN").format(value) + "đ"
        );
    };

    // =============================
    // LOCK / UNLOCK USER
    // =============================
    const handleToggleLock = async (user) => {
        try {
            setError("");

            const newStatus =
                user.status === "Active"
                    ? "Locked"
                    : "Active";

            await api.put(
                `/api/Auth/internal/users/${user.apiId}/status`,
                {
                    status: newStatus,
                }
            );

            // Lấy lại dữ liệu thật từ DB
            await fetchUsers();

            // Nếu modal đang mở thì đóng lại
            setSelectedUser(null);
        } catch (err) {
            console.error(
                "Lỗi cập nhật trạng thái user:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Không thể thay đổi trạng thái tài khoản."
            );
        }
    };

    return (
        <div className="user-management">
            <div className="page-heading">
                <div>
                    <h2>Quản lý Users</h2>

                    <p>
                        Theo dõi và quản lý trạng thái tài khoản khách hàng
                    </p>
                </div>
            </div>

            {/* =============================
            SUMMARY
        ============================= */}
            <div className="user-summary">
                <div className="summary-card">
                    <div className="summary-icon blue">♙</div>

                    <div>
                        <span>Tổng Users</span>
                        <strong>{summary.total}</strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon green">✓</div>

                    <div>
                        <span>Đang hoạt động</span>
                        <strong>{summary.active}</strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon red">🔒</div>

                    <div>
                        <span>Đã khóa</span>
                        <strong>{summary.locked}</strong>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon purple">▤</div>

                    <div>
                        <span>Tổng Booking</span>

                        <strong>
                            {summary.totalBookings}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =============================
            ERROR
        ============================= */}
            {error && (
                <div
                    style={{
                        marginBottom: "18px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                        fontSize: "13px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* =============================
            TOOLBAR
        ============================= */}
            <div className="user-toolbar">
                <div className="user-search">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Tìm tên, email, số điện thoại..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="All">
                        Tất cả trạng thái
                    </option>

                    <option value="Active">
                        Đang hoạt động
                    </option>

                    <option value="Locked">
                        Đã khóa
                    </option>
                </select>
            </div>

            {/* =============================
            TABLE
        ============================= */}
            <div className="user-table-card">
                <div className="table-header">
                    <div>
                        <h3>Danh sách khách hàng</h3>

                        <span>
                            {loading
                                ? "Đang tải..."
                                : `${filteredUsers.length} tài khoản`}
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Ngày tham gia</th>
                                <th>Booking</th>
                                <th>Đã chi tiêu</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="empty-state"
                                    >
                                        Đang tải danh sách người dùng...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="empty-state"
                                    >
                                        Không tìm thấy tài khoản phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.apiId}>
                                        <td>
                                            <strong className="user-id">
                                                {user.id}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar">
                                                    {user.fullName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {user.fullName}
                                                    </strong>

                                                    <span>
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{user.phone}</td>

                                        <td>{user.joinedDate}</td>

                                        <td>
                                            {user.bookings}
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    user.totalSpent
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={`user-status ${user.status === "Active"
                                                        ? "user-status-active"
                                                        : "user-status-locked"
                                                    }`}
                                            >
                                                {user.status === "Active"
                                                    ? "Đang hoạt động"
                                                    : "Đã khóa"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="user-actions">
                                                <button
                                                    type="button"
                                                    className="user-action-view"
                                                    onClick={() =>
                                                        setSelectedUser(user)
                                                    }
                                                >
                                                    Xem
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        user.status === "Active"
                                                            ? "user-action-lock"
                                                            : "user-action-unlock"
                                                    }
                                                    onClick={() =>
                                                        handleToggleLock(user)
                                                    }
                                                >
                                                    {user.status === "Active"
                                                        ? "Khóa"
                                                        : "Mở khóa"}
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

            {/* =============================
            MODAL
        ============================= */}
            {selectedUser && (
                <div
                    className="user-modal-overlay"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="user-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="user-modal-header">
                            <div>
                                <span>
                                    Thông tin khách hàng
                                </span>

                                <h3>{selectedUser.id}</h3>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setSelectedUser(null)
                                }
                            >
                                ×
                            </button>
                        </div>

                        <div className="user-profile-preview">
                            <div className="large-user-avatar">
                                {selectedUser.fullName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h3>
                                    {selectedUser.fullName}
                                </h3>

                                <p>
                                    {selectedUser.email}
                                </p>
                            </div>
                        </div>

                        <div className="user-detail-grid">
                            <div className="detail-item">
                                <span>Mã User</span>

                                <strong>
                                    {selectedUser.id}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Họ và tên</span>

                                <strong>
                                    {selectedUser.fullName}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Email</span>

                                <strong>
                                    {selectedUser.email}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Số điện thoại</span>

                                <strong>
                                    {selectedUser.phone}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Ngày tham gia</span>

                                <strong>
                                    {selectedUser.joinedDate}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Số Booking</span>

                                <strong>
                                    {selectedUser.bookings}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Tổng chi tiêu</span>

                                <strong>
                                    {formatCurrency(
                                        selectedUser.totalSpent
                                    )}
                                </strong>
                            </div>

                            <div className="detail-item">
                                <span>Trạng thái</span>

                                <span
                                    className={`user-status ${selectedUser.status === "Active"
                                            ? "user-status-active"
                                            : "user-status-locked"
                                        }`}
                                >
                                    {selectedUser.status === "Active"
                                        ? "Đang hoạt động"
                                        : "Đã khóa"}
                                </span>
                            </div>
                        </div>

                        <div className="user-modal-note">
                            <span>ℹ</span>

                            <p>
                                Admin chỉ có quyền xem và thay đổi trạng thái
                                khóa tài khoản. Không được chỉnh sửa hoặc xóa
                                tài khoản khách hàng.
                            </p>
                        </div>

                        <div className="user-modal-actions">
                            <button
                                type="button"
                                className={
                                    selectedUser.status === "Active"
                                        ? "modal-lock-button"
                                        : "modal-unlock-button"
                                }
                                onClick={() =>
                                    handleToggleLock(selectedUser)
                                }
                            >
                                {selectedUser.status === "Active"
                                    ? "🔒 Khóa tài khoản"
                                    : "🔓 Mở khóa tài khoản"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


}

export default UserManagement;
