import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  clearSelectedCustomer,
  updateCustomer,
} from "../../store/customer.slice";
import { useParams, useNavigate } from "react-router-dom";

const CustomerDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedCustomer, loading, error } = useSelector(
    (state) => state.customers
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentTerm: "NET_30",
    creditLimit: "",
  });

  useEffect(() => {
    dispatch(fetchCustomerById(id));

    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        name: selectedCustomer.name ?? "",
        email: selectedCustomer.email ?? "",
        phone: selectedCustomer.phone ?? "",
        address: selectedCustomer.address ?? "",
        paymentTerm: selectedCustomer.paymentTerm ?? "NET_30",
        creditLimit: selectedCustomer.creditLimit ?? "",
      });
    }
  }, [selectedCustomer]);

  /* ================= HANDLERS ================= */

  const handleSaveConfirm = () => {
    setConfirmData({
      type: 'update',
      data: {
        ...formData,
        creditLimit: Number(formData.creditLimit),
      }
    });
    setShowConfirm(true);
  };

  const handleSave = () => {
    if (confirmData && confirmData.type === 'update') {
      dispatch(
        updateCustomer({
          id,
          data: confirmData.data,
        })
      );
      setIsEditing(false);
    }
    setShowConfirm(false);
    setConfirmData(null);
  };

  const handleDeactivateConfirm = () => {
    setConfirmData({
      type: 'deactivate'
    });
    setShowConfirm(true);
  };

  const handleDeactivate = () => {
    if (confirmData && confirmData.type === 'deactivate') {
      dispatch(
        updateCustomer({
          id,
          data: { status: "INACTIVE" },
        })
      );
    }
    setShowConfirm(false);
    setConfirmData(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmData(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Đang tải thông tin khách hàng...
        </p>
      </div>
    );
  }

  if (error || !selectedCustomer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy khách hàng
          </h3>
          <p className="text-gray-500 mb-6">
            {error || 'Khách hàng không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => navigate('/customers')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Danh sách khách hàng
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="card space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-blue-600">
            Chi tiết khách hàng
          </h2>

          <span
            className={`px-4 py-2 rounded-full font-semibold ${selectedCustomer.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {selectedCustomer.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}
          </span>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Tên"
            value={formData.name}
            isEditing={isEditing}
            onChange={(v) =>
              setFormData({ ...formData, name: v })
            }
          />

          <EditableField
            label="Email"
            value={formData.email}
            isEditing={isEditing}
            onChange={(v) =>
              setFormData({ ...formData, email: v })
            }
          />

          <EditableField
            label="Điện thoại"
            value={formData.phone}
            isEditing={isEditing}
            onChange={(v) =>
              setFormData({ ...formData, phone: v })
            }
          />

          <EditableField
            label="Địa chỉ"
            value={formData.address}
            isEditing={isEditing}
            onChange={(v) =>
              setFormData({ ...formData, address: v })
            }
          />

          <div>
            <p className="text-sm text-gray-500">
              Điều khoản thanh toán
            </p>
            {isEditing ? (
              <select
                className="input"
                value={formData.paymentTerm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentTerm: e.target.value,
                  })
                }
              >
                <option value="NET_7">NET_7</option>
                <option value="NET_15">NET_15</option>
                <option value="NET_30">NET_30</option>
              </select>
            ) : (
              <p className="font-medium">
                {selectedCustomer.paymentTerm}
              </p>
            )}
          </div>

          <EditableField
            label="Hạn mức tín dụng"
            type="number"
            value={formData.creditLimit}
            isEditing={isEditing}
            onChange={(v) =>
              setFormData({
                ...formData,
                creditLimit: v,
              })
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => navigate("/customers")}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            ← Quay lại danh sách
          </button>

          <div className="space-x-2">
            {isEditing ? (
              <>
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  onClick={handleSaveConfirm}
                >
                  Lưu
                </button>
                <button
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Sửa thông tin
                </button>

                {selectedCustomer.status === "ACTIVE" && (
                  <button
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={handleDeactivateConfirm}
                  >
                    ⛔ Dừng hoạt động
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONFIRM POPUP - IMPROVED ===== */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={handleCancelConfirm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-[450px] transform transition-all animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon & Title */}
            <div className="flex flex-col items-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmData?.type === 'deactivate'
                  ? 'bg-red-100'
                  : 'bg-green-100'
                }`}>
                {confirmData?.type === 'deactivate' ? (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-800">
                {confirmData?.type === 'deactivate'
                  ? 'Xác nhận dừng hoạt động'
                  : 'Xác nhận cập nhật'}
              </h3>
            </div>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {confirmData?.type === 'deactivate'
                ? 'Bạn có chắc chắn muốn dừng hoạt động khách hàng này không? Khách hàng sẽ không thể thực hiện giao dịch mới.'
                : 'Bạn có chắc chắn muốn lưu thay đổi thông tin khách hàng không?'}
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                onClick={handleCancelConfirm}
              >
                Hủy
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${confirmData?.type === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
                onClick={() => {
                  if (confirmData?.type === 'deactivate') {
                    handleDeactivate();
                  } else {
                    handleSave();
                  }
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 6px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .card {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const EditableField = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
}) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    {isEditing ? (
      <input
        type={type}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className="font-medium">{value || "-"}</p>
    )}
  </div>
);

export default CustomerDetailPage;