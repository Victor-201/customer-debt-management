import { useEffect } from "react";
import { FiTrash2, FiRotateCcw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchDeletedUsers,
  restoreUser,
  hardDeleteUser,
  selectDeletedUsers,
  selectUsersLoading,
} from "../../store/user.slice";

export default function DeletedUserPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector(selectDeletedUsers);
  const loading = useSelector(selectUsersLoading);

  useEffect(() => {
    dispatch(fetchDeletedUsers());
  }, [dispatch]);

  /* ===== RESTORE USER ===== */
  const handleRestoreUser = async (id) => {
    try {
      await dispatch(restoreUser(id)).unwrap();
      alert("Khôi phục nhân viên thành công");
      navigate("/users");
    } catch (err) {
      console.error(err);
      alert(
        err?.error || "Không thể khôi phục nhân viên"
      );
    }
  };

  /* ===== HARD DELETE ===== */
  const handleHardDeleteUser = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn nhân viên này?")) return;

    try {
      await dispatch(hardDeleteUser(id)).unwrap();
      alert("Đã xóa vĩnh viễn nhân viên");
    } catch (err) {
      console.error(err);
      alert(
        err?.error || "Không thể xóa vĩnh viễn nhân viên"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="fc-page-header">
        <div className="fc-page-header__breadcrumb">Quản lý / Thùng rác</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="fc-page-header__title">Thùng rác – Nhân viên</h1>
            <p className="fc-page-header__subtitle">
              Các nhân viên đã bị xóa (có thể khôi phục hoặc xóa vĩnh viễn)
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="fc-btn fc-btn--secondary"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <table className="fc-table">
          {/* HEADER */}
          <thead>
            <tr>
              <th className="table-header text-left pl-6">Nhân viên</th>
              <th className="table-header text-center">Email</th>
              <th className="table-header text-right pr-6">Hành động</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="group hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {/* NAME */}
                <td className="table-cell pl-6">
                  <div className="font-bold text-gray-800">{u.name}</div>
                </td>

                {/* EMAIL */}
                <td className="table-cell text-center text-gray-600">
                  {u.email}
                </td>

                {/* ACTIONS */}
                <td className="table-cell pr-6">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* RESTORE */}
                    <button
                      onClick={() => handleRestoreUser(u.id)}
                      className="action-btn text-green-500 hover:bg-green-50"
                      title="Khôi phục"
                    >
                      <FiRotateCcw />
                    </button>

                    {/* HARD DELETE */}
                    <button
                      onClick={() => handleHardDeleteUser(u.id)}
                      className="action-btn action-btn--delete"
                      title="Xóa vĩnh viễn"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Thùng rác trống
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
