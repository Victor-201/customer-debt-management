import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  updateCustomer,
} from "../../store/customer.slice";
import { useNavigate } from "react-router-dom";

const CustomerListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading, error } = useSelector(
    (state) => state.customers
  );

  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentTerm: "NET_30",
    creditLimit: "",
    riskLevel: "NORMAL",
    status: "ACTIVE",
  });

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  /* ================= HANDLERS ================= */

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      paymentTerm: customer.paymentTerm ?? "NET_30",
      creditLimit: customer.creditLimit ?? "",
      riskLevel: customer.riskLevel ?? "NORMAL",
      status: customer.status ?? "ACTIVE",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveConfirm = () => {
    setConfirmData({
      type: 'update',
      id: editingId,
      data: {
        ...formData,
        creditLimit: Number(formData.creditLimit),
      }
    });
    setShowConfirm(true);
  };

  const handleSave = () => {
    if (confirmData) {
      dispatch(
        updateCustomer({
          id: confirmData.id,
          data: confirmData.data,
        })
      );
    }
    setEditingId(null);
    setShowConfirm(false);
    setConfirmData(null);
  };

  const handleDelete = (id) => {
    setConfirmData({
      type: 'delete',
      id: id
    });
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (confirmData && confirmData.type === 'delete') {
      dispatch(deleteCustomer(confirmData.id));
    }
    setShowConfirm(false);
    setConfirmData(null);
  };

  const handleQuickStatusChange = (id, newStatus, oldStatus) => {
    if (newStatus === oldStatus) return;

    setConfirmData({
      type: 'status',
      id: id,
      newStatus: newStatus,
      oldStatus: oldStatus
    });
    setShowConfirm(true);
  };

  const handleConfirmStatusChange = () => {
    if (confirmData && confirmData.type === 'status') {
      dispatch(
        updateCustomer({
          id: confirmData.id,
          data: { status: confirmData.newStatus },
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

  /* ================= UI ================= */

  if (loading)
    return <p className="p-4">Đang tải dữ liệu...</p>;

  if (error)
    return (
      <p className="p-4 text-red-600">{error}</p>
    );

  return (
    <div>
      <div className="fc-page-header">
        <div className="fc-page-header__breadcrumb">Quản lý / Khách hàng</div>
        <h1 className="fc-page-header__title">Danh sách khách hàng</h1>
        <p className="fc-page-header__subtitle">Quản lý thông tin và công nợ khách hàng</p>
      </div>

      <div className="fc-card">
        {/* HEADER */}
        <div className="fc-card__header">
          <h2 className="fc-card__title">
            Tất cả khách hàng
          </h2>

          <button
            className="fc-btn fc-btn--primary"
            onClick={() => navigate("/customers/new")}
          >
            + Thêm khách hàng
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="fc-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Hình thức thanh toán</th>
                <th>Hạn mức tín dụng</th>
                <th>Mức độ rủi ro</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="p-4 text-center text-gray-500"
                  >
                    Không có khách hàng
                  </td>
                </tr>
              )}

              {list.map((customer) => (
                <tr key={customer.id}>
                  {/* NAME */}
                  <td>
                    {editingId === customer.id ? (
                      <input
                        className="fc-input"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      customer.name
                    )}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {editingId === customer.id ? (
                      <input
                        className="fc-input"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                      />
                    ) : (
                      customer.email
                    )}
                  </td>

                  {/* PHONE */}
                  <td>
                    {editingId === customer.id ? (
                      <input
                        className="fc-input"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value,
                          })
                        }
                      />
                    ) : (
                      customer.phone || "-"
                    )}
                  </td>

                  {/* PAYMENT */}
                  <td>
                    {editingId === customer.id ? (
                      <select
                        className="fc-input"
                        value={formData.paymentTerm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentTerm:
                              e.target.value,
                          })
                        }
                      >
                        <option value="NET_7">Thanh toán sau 7 ngày</option>
                        <option value="NET_15">Thanh toán sau 15 ngày</option>
                        <option value="NET_30">Thanh toán sau 30 ngày</option>
                      </select>
                    ) : (
                      customer.paymentTerm === "NET_7" ? "7 ngày" :
                        customer.paymentTerm === "NET_15" ? "15 ngày" : "30 ngày"
                    )}
                  </td>

                  {/* CREDIT */}
                  <td>
                    {editingId === customer.id ? (
                      <input
                        type="number"
                        className="fc-input"
                        value={formData.creditLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            creditLimit:
                              e.target.value,
                          })
                        }
                      />
                    ) : (
                      customer.creditLimit?.toLocaleString() + " đ"
                    )}
                  </td>

                  {/* RISK */}
                  <td>
                    {editingId === customer.id ? (
                      <select
                        className="fc-input"
                        value={formData.riskLevel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            riskLevel:
                              e.target.value,
                          })
                        }
                      >
                        <option value="NORMAL">Bình thường</option>
                        <option value="WARNING">Cảnh báo</option>
                        <option value="HIGH_RISK">Rủi ro cao</option>
                      </select>
                    ) : (
                      <span className={`fc-badge ${customer.riskLevel === 'HIGH_RISK' ? 'fc-badge--danger' :
                        customer.riskLevel === 'WARNING' ? 'fc-badge--warning' : 'fc-badge--success'}`}>
                        {customer.riskLevel === "WARNING" ? "Cảnh báo" :
                          customer.riskLevel === "HIGH_RISK" ? "Rủi ro cao" : "Bình thường"}
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td>
                    {editingId === customer.id ? (
                      <select
                        className="fc-input"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status:
                              e.target.value,
                          })
                        }
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                      </select>
                    ) : (
                      <select
                        className="fc-input"
                        value={customer.status}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            customer.id,
                            e.target.value,
                            customer.status
                          )
                        }
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                      </select>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editingId === customer.id ? (
                        <>
                          <button
                            className="fc-btn fc-btn--primary"
                            onClick={handleSaveConfirm}
                          >
                            Lưu
                          </button>
                          <button
                            className="fc-btn fc-btn--secondary"
                            onClick={handleCancelEdit}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="fc-btn fc-btn--secondary"
                            onClick={() =>
                              navigate(
                                `/customers/${customer.id}`
                              )
                            }
                          >
                            Xem
                          </button>

                          <button
                            className="fc-btn fc-btn--secondary"
                            onClick={() =>
                              handleEdit(customer)
                            }
                          >
                            Sửa
                          </button>

                          <button
                            className="fc-btn fc-btn--danger"
                            onClick={() =>
                              handleDelete(
                                customer.id
                              )
                            }
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmData?.type === 'delete'
                ? 'bg-red-100'
                : confirmData?.type === 'status'
                  ? 'bg-blue-100'
                  : 'bg-green-100'
                }`}>
                {confirmData?.type === 'delete' ? (
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : confirmData?.type === 'status' ? (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-800">
                {confirmData?.type === 'delete'
                  ? 'Xác nhận xóa'
                  : confirmData?.type === 'status'
                    ? 'Xác nhận thay đổi trạng thái'
                    : 'Xác nhận cập nhật'}
              </h3>
            </div>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {confirmData?.type === 'delete'
                ? 'Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác.'
                : confirmData?.type === 'status'
                  ? `Bạn có chắc chắn muốn ${confirmData.newStatus === 'ACTIVE' ? 'kích hoạt' : 'ngừng hoạt động'} khách hàng này không?`
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
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${confirmData?.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : confirmData?.type === 'status'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
                onClick={() => {
                  if (confirmData?.type === 'delete') {
                    handleConfirmDelete();
                  } else if (confirmData?.type === 'status') {
                    handleConfirmStatusChange();
                  } else {
                    handleSave();
                  }
                }}
              >
                {confirmData?.type === 'delete'
                  ? 'Xóa'
                  : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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

export default CustomerListPage;