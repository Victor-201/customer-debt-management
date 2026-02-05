import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiEdit,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiPlus,
  FiArchive,
} from "react-icons/fi";

import { selectUser } from "../../store/auth.slice";
import {
  fetchUsers,
  lockUser,
  unlockUser,
  softDeleteUser,
  selectUsers,
  selectUsersLoading,
} from "../../store/user.slice";

export default function UserListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const currentUser = useSelector(selectUser);
  const allUsers = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);

  // Filter to show only ACCOUNTANT users
  const users = allUsers.filter((u) => u.role === "ACCOUNTANT");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  /* ===== SEARCH ===== */
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleLock = async (u) => {
    if (u.id === currentUser?.id) {
      alert("Không thể khóa chính mình");
      return;
    }

    try {
      if (u.isActive) {
        await dispatch(lockUser(u.id)).unwrap();
      } else {
        await dispatch(unlockUser(u.id)).unwrap();
      }
    } catch (err) {
      console.error(err);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Xóa nhân viên này? (sẽ vào thùng rác)")) return;

    try {
      await dispatch(softDeleteUser(id)).unwrap();
      alert("Đã chuyển vào thùng rác");
    } catch (err) {
      console.error(err);
      alert("Không thể xóa nhân viên");
    }
  };

  // Get user initials and color
  const getAvatarColor = (name) => {
    const colors = ['blue', 'emerald', 'amber', 'purple', 'red', 'orange'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="fc-page-header">
        <div className="fc-page-header__breadcrumb">Quản lý / Nhân viên</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="fc-page-header__title">Quản lý nhân viên</h1>
            <p className="fc-page-header__subtitle">
              Thêm, chỉnh sửa, khóa hoặc xóa nhân viên hệ thống
            </p>
          </div>

          <div className="fc-page-actions">
            <button
              onClick={() => navigate("/users/create")}
              className="fc-btn fc-btn--primary-glow"
            >
              <FiPlus /> Thêm nhân viên
            </button>

            <button
              onClick={() => navigate("/users/deleted")}
              className="fc-btn--icon"
            >
              <FiArchive />
            </button>
          </div>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="relative max-w-md">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="fc-input pl-9"
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <table className="fc-table">
          <thead>
            <tr>
              <th className="table-header text-left pl-6">Nhân viên</th>
              <th className="table-header text-center w-48">Quyền</th>
              <th className="table-header text-center w-48">Trạng thái</th>
              <th className="table-header text-center w-48 pr-6">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="group hover:bg-blue-50/50 transition-colors"
              >
                {/* USER */}
                <td className="table-cell pl-6">
                  <div className="flex items-center gap-4">
                    <div className={`customer-avatar customer-avatar--${getAvatarColor(u.name)}`}>
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{u.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{u.email}</div>
                    </div>
                  </div>
                </td>

                {/* ROLE */}
                <td className="table-cell text-center">
                  <span className="status-badge status-badge--info">
                    Kế toán
                  </span>
                </td>

                {/* STATUS */}
                <td className="table-cell text-center">
                  {u.isActive ? (
                    <span className="status-badge status-badge--success">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="status-badge status-badge--danger">
                      Bị khóa
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="table-cell text-center pr-6">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/users/${u.id}/edit`)}
                      className="action-btn action-btn--edit"
                      title="Sửa"
                    >
                      <FiEdit />
                    </button>

                    <button
                      onClick={() => toggleLock(u)}
                      disabled={u.id === currentUser?.id}
                      className={`action-btn ${u.id === currentUser?.id
                        ? "opacity-30 cursor-not-allowed"
                        : u.isActive
                          ? "text-amber-500 hover:bg-amber-50"
                          : "text-emerald-500 hover:bg-emerald-50"
                        }`}
                      title={
                        u.id === currentUser?.id
                          ? "Không thể khóa chính mình"
                          : u.isActive
                            ? "Khóa"
                            : "Mở khóa"
                      }
                    >
                      {u.isActive ? <FiLock /> : <FiUnlock />}
                    </button>

                    <button
                      onClick={() => handleSoftDelete(u.id)}
                      className="action-btn action-btn--delete"
                      title="Xóa (vào thùng rác)"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="table-cell text-center py-10 text-gray-500"
                >
                  Không tìm thấy nhân viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
