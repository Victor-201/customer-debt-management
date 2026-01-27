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
    <div className="px-6 py-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Thùng rác – Nhân viên
          </h1>
          <p className="text-sm text-gray-500">
            Các nhân viên đã bị xóa (có thể khôi phục hoặc xóa vĩnh viễn)
          </p>
        </div>

        {/* QUAY LẠI */}
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          {/* HEADER */}
          <thead className="bg-gray-50 text-gray-700">
            <tr className="border-b border-gray-300">
              <th className="px-6 py-3 text-left font-semibold border-r border-gray-200">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-center font-semibold border-r border-gray-200">
                Email
              </th>
              <th className="px-6 py-3 text-right font-semibold">
                Hành động
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                {/* NAME */}
                <td className="px-6 py-4 border-r border-gray-200">
                  <div className="font-medium text-gray-800">
                    {u.name}
                  </div>
                </td>

                {/* EMAIL */}
                <td className="px-6 py-4 text-center border-r border-gray-200 text-gray-600">
                  {u.email}
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {/* RESTORE */}
                    <button
                      onClick={() => handleRestoreUser(u.id)}
                      className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
                      title="Khôi phục"
                    >
                      <FiRotateCcw />
                    </button>

                    {/* HARD DELETE */}
                    <button
                      onClick={() => handleHardDeleteUser(u.id)}
                      className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
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
