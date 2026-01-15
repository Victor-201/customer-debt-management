import { useEffect, useState } from "react";
import { FiTrash2, FiRotateCcw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import userApi from "../../api/user.api";

export default function DeletedUserPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
 
  const fetchUsers = async () => {
    try {
      const res = await userApi.getDeleted();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách thùng rác");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ===== RESTORE USER ===== */
  const restoreUser = async (id) => {
    try {
      await userApi.restore(id);
      alert("Khôi phục nhân viên thành công");
      navigate("/users"); 
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          "Không thể khôi phục nhân viên"
      );
    }
  };

  /* ===== HARD DELETE ===== */
  const hardDeleteUser = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn nhân viên này?")) return;

    try {
      await userApi.hardDelete(id);
      alert("Đã xóa vĩnh viễn nhân viên");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          "Không thể xóa vĩnh viễn nhân viên"
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
                      onClick={() => restoreUser(u.id)}
                      className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
                      title="Khôi phục"
                    >
                      <FiRotateCcw />
                    </button>

                    {/* HARD DELETE */}
                    <button
                      onClick={() => hardDeleteUser(u.id)}
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
