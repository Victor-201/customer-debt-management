import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  deleteCustomer,
  updateCustomer,
} from "../../store/customer.slice";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

const CustomerListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading, error, pagination } = useSelector(
    (state) => state.customers
  );

  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [paymentTermFilter, setPaymentTermFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Active filters count
  const activeFiltersCount = [paymentTermFilter, riskLevelFilter, statusFilter].filter(f => f !== 'all').length;

  // Fetch customers when page/sort changes
  useEffect(() => {
    dispatch(fetchCustomers({
      page: currentPage,
      limit,
      sortBy: sortField,
      sortOrder: sortDirection.toUpperCase(),
      search: searchTerm || undefined,
      paymentTerm: paymentTermFilter !== 'all' ? paymentTermFilter : undefined,
      riskLevel: riskLevelFilter !== 'all' ? riskLevelFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }));
  }, [dispatch, currentPage, limit, sortField, sortDirection, searchTerm, paymentTermFilter, riskLevelFilter, statusFilter]);

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sort icon
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="inline w-4 h-4 text-slate-300" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="inline w-4 h-4 text-blue-600" />
      : <ChevronDown className="inline w-4 h-4 text-blue-600" />;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setPaymentTermFilter('all');
    setRiskLevelFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

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

  // Pagination info
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || list.length;

  /* ================= UI ================= */

  if (loading && list.length === 0)
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

      <div className="glass-card p-6">
        {/* HEADER */}
        <div className="fc-card__header">
          <h2 className="fc-card__title">
            Tất cả khách hàng ({totalItems})
          </h2>

          <button
            className="fc-btn fc-btn--primary"
            onClick={() => navigate("/customers/new")}
          >
            + Thêm khách hàng
          </button>
        </div>

        {/* SEARCH & FILTER BAR - Compact */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="fc-search-bar flex-1 min-w-[200px] max-w-[300px]">
            <Search className="fc-search-bar__icon" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="fc-search-bar__input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            className={`fc-btn ${showFilters || activeFiltersCount > 0 ? 'fc-btn--primary' : 'fc-btn--secondary'} flex items-center gap-2`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Bộ lọc
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              {paymentTermFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {paymentTermFilter === 'NET_7' ? '7 ngày' : paymentTermFilter === 'NET_15' ? '15 ngày' : '30 ngày'}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-blue-900"
                    onClick={() => { setPaymentTermFilter('all'); setCurrentPage(1); }}
                  />
                </span>
              )}
              {riskLevelFilter !== 'all' && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${riskLevelFilter === 'HIGH_RISK' ? 'bg-red-100 text-red-700' :
                  riskLevelFilter === 'WARNING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                  {riskLevelFilter === 'HIGH_RISK' ? 'Rủi ro cao' : riskLevelFilter === 'WARNING' ? 'Cảnh báo' : 'Bình thường'}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => { setRiskLevelFilter('all'); setCurrentPage(1); }}
                  />
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusFilter === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                  {statusFilter === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                  />
                </span>
              )}
              <button
                className="text-xs text-slate-500 hover:text-slate-700 underline"
                onClick={clearFilters}
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* FILTER DROPDOWN - Hidden by default */}
        {showFilters && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl flex flex-wrap items-center gap-4 animate-fadeIn">
            <select
              className="fc-input w-44"
              value={paymentTermFilter}
              onChange={(e) => { setPaymentTermFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả hình thức TT</option>
              <option value="NET_7">Thanh toán 7 ngày</option>
              <option value="NET_15">Thanh toán 15 ngày</option>
              <option value="NET_30">Thanh toán 30 ngày</option>
            </select>

            <select
              className="fc-input w-40"
              value={riskLevelFilter}
              onChange={(e) => { setRiskLevelFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả rủi ro</option>
              <option value="NORMAL">Bình thường</option>
              <option value="WARNING">Cảnh báo</option>
              <option value="HIGH_RISK">Rủi ro cao</option>
            </select>

            <select
              className="fc-input w-44"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="fc-table">
            <thead>
              <tr>
                <th
                  className="cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('name')}
                >
                  Khách hàng <SortIcon field="name" />
                </th>
                <th
                  className="cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('email')}
                >
                  Email <SortIcon field="email" />
                </th>
                <th
                  className="cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('phone')}
                >
                  SĐT <SortIcon field="phone" />
                </th>
                <th
                  className="cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('paymentTerm')}
                >
                  Hình thức TT <SortIcon field="paymentTerm" />
                </th>
                <th
                  className="cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('creditLimit')}
                >
                  Hạn mức <SortIcon field="creditLimit" />
                </th>
                <th
                  className="cursor-pointer hover:bg-slate-100 select-none"
                  onClick={() => handleSort('riskLevel')}
                >
                  Rủi ro <SortIcon field="riskLevel" />
                </th>
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
                      <span className="font-medium text-slate-800">{customer.name}</span>
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
                      <span className="text-slate-600 text-sm">{customer.email}</span>
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
                        <option value="NET_7">7 ngày</option>
                        <option value="NET_15">15 ngày</option>
                        <option value="NET_30">30 ngày</option>
                      </select>
                    ) : (
                      <span className="text-sm">
                        {customer.paymentTerm === "NET_7" ? "7 ngày" :
                          customer.paymentTerm === "NET_15" ? "15 ngày" : "30 ngày"}
                      </span>
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
                      <span className="font-medium">{customer.creditLimit?.toLocaleString()} đ</span>
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
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Ngừng</option>
                      </select>
                    ) : (
                      <select
                        className="fc-input w-28 py-1 text-sm"
                        value={customer.status}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            customer.id,
                            e.target.value,
                            customer.status
                          )
                        }
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Ngừng</option>
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

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Hiển thị {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalItems)} trên {totalItems} khách hàng
            </div>

            <div className="flex items-center gap-2">
              <button
                className="fc-btn fc-btn--secondary p-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="fc-btn fc-btn--secondary p-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== CONFIRM POPUP ===== */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={handleCancelConfirm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-[450px] transform transition-all animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
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
                    ? 'Xác nhận thay đổi'
                    : 'Xác nhận cập nhật'}
              </h3>
            </div>

            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {confirmData?.type === 'delete'
                ? 'Bạn có chắc chắn muốn xóa khách hàng này?'
                : confirmData?.type === 'status'
                  ? `Đổi trạng thái sang ${confirmData.newStatus === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}?`
                  : 'Xác nhận lưu thay đổi?'}
            </p>

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
                {confirmData?.type === 'delete' ? 'Xóa' : 'Xác nhận'}
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerListPage;