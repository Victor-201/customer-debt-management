import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserById,
  createUser,
  updateUser,
  selectSelectedUser,
  selectUsersLoading,
  clearSelectedUser,
} from "../../store/user.slice";

export default function UserFormPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(userId);

  const selectedUser = useSelector(selectSelectedUser);
  const loading = useSelector(selectUsersLoading);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ACCOUNTANT",
    isActive: true,
  });

  /* ===== LOAD USER ===== */
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchUserById(userId));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, userId, isEdit]);

  // Populate form when selectedUser changes
  useEffect(() => {
    if (isEdit && selectedUser) {
      setForm({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "ACCOUNTANT",
        isActive: selectedUser.isActive ?? true,
        password: "",
      });
    }
  }, [isEdit, selectedUser]);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email) return;

    try {
      if (isEdit) {
        await dispatch(updateUser({
          id: userId,
          data: {
            name: form.name,
            email: form.email,
            isActive: form.isActive,
            role: form.role,
          }
        })).unwrap();
      } else {
        if (!form.password) return;
        await dispatch(createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        })).unwrap();
      }
      navigate("/users");
    } catch (err) {
      console.error(err);
      alert(err?.error || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border border-gray-300 bg-white shadow-sm">
        {/* HEADER */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Chỉnh sửa thông tin, đổi mật khẩu hoặc trạng thái"
              : "Tạo tài khoản nhân viên mới"}
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={submit}
          className="space-y-5 px-6 py-6"
        >
          {/* NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tên nhân viên
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tên"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          {/* PASSWORD */}
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {isEdit ? "Đổi mật khẩu" : "Mật khẩu"}
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>
          )}

          {/* ROLE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quyền
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
            </select>
          </div>

          {/* ACTIVE */}
          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <span className="text-sm text-gray-700">
                Đang hoạt động
              </span>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isEdit ? "Lưu thay đổi" : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
