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

  return (
    <div className="px-6 py-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-medium bold text-gray-800 py-2">
            Quản lý nhân viên
          </h1>
          <p className="text-sm text-gray-500">
            Thêm, chỉnh sửa, khóa hoặc xóa nhân viên hệ thống
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/users/create")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <FiPlus /> Thêm nhân viên
          </button>

          <button
            onClick={() => navigate("/users/deleted")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            <FiArchive /> Thùng rác
          </button>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr className="border-b border-gray-300">
              <th className="px-6 py-3 text-center font-medium border-r border-gray-200">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-center font-medium border-r border-gray-200">
                Quyền
              </th>
              <th className="px-6 py-3 text-center font-medium border-r border-gray-200">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center font-medium">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                {/* USER */}
                <td className="px-6 py-4 border-r border-gray-200 text-center">
                  <div className="flex flex-col items-center">
                    <div className="font-medium text-gray-800">
                      {u.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {u.email}
                    </div>
                  </div>
                </td>

                {/* ROLE */}
                <td className="px-6 py-4 text-center border-r border-gray-200">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                    ACCOUNTANT
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4 text-center border-r border-gray-200">
                  {u.isActive ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                      LOCKED
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/users/${u.id}/edit`)}
                      className="rounded-md border border-gray-300 p-2 hover:bg-gray-100"
                      title="Sửa"
                    >
                      <FiEdit />
                    </button>

                    <button
                      onClick={() => toggleLock(u)}
                      disabled={u.id === currentUser?.id}
                      className={`rounded-md p-2 text-white ${u.id === currentUser?.id
                        ? "bg-gray-300 cursor-not-allowed"
                        : u.isActive
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-600 hover:bg-green-700"
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
                      className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
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
                  className="px-6 py-10 text-center text-gray-500"
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
